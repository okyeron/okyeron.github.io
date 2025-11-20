import { computed, reactive, readonly, ref, watchEffect } from 'vue';
import type { Mappings, Bank, DeviceInfo, MIDICallbacks, Mapping } from 'access/types';
import { Banks } from 'access/types';
import { useWebMidi } from 'access/composables/webMidi';

const deviceName = 'hachi-ni';
const manufacturerId = [125, 0, 0];
const requestConfigMessage = [0xf0, ...manufacturerId, 0x1f, 0xf7];

const isEducationalManufacturer = (data: number[]) =>
  data.every((byte, i) => byte === manufacturerId[i]);

const extractInfo = (data: number[]): DeviceInfo => {
  if (data.length < 7) {
    throw new Error('extractInfo expects data indices up to 6 to be populated');
  }

  return {
    modelNum: data[1]!,
    model: { 5: '8x2' }[data[1]!],
    ver: data[2]!,
    version: data.slice(2, 5).join('.'),
    eepromVersion: data[6]!,
  };
};

const extractMappings = (data: number[]): [number[], number[], number[], number[]] => {
  const usbCcStart = 25;
  const trsCcStart = 41;
  const usbChanStart = 57;
  const trsChanStart = 73;

  const startOffsets = [usbCcStart, trsCcStart, usbChanStart, trsChanStart].map(
    (offset) => offset - 4, // Number of bytes stripped from message start (status + manufacturer id bytes)
  );

  return startOffsets.map((offset) => {
    const values = [];

    for (let i = offset; i < offset + 16; i++) {
      values.push(data[i]);
    }

    return values;
  }) as [number[], number[], number[], number[]];
};

const extractBank = (data: number[]): Bank => {
  if (data.length < 6) {
    throw new Error('extractInfo expects data indices up to 5 to be populated');
  }

  return (data[5]! + 1) as Bank; // Sketchy, as there is no validation
};

export const useHachiNi = () => {
  const info = ref<DeviceInfo | null>(null);

  const mappings = reactive<Mappings>({});

  const bank = ref<Bank>(1);

  const potentiometers = ref<number[]>(Array.from<number>({ length: 16 }).fill(0, 0, 16));

  // If connected to an output port, this sends the bank change request, followed
  // immediately by the message to request the config state.
  const selectBank = (bank: Bank, output: MIDIOutput | null) => {
    if (output && output.state === 'connected') {
      output.send([192, bank - 1], 0);
      output.send(requestConfigMessage, 0);
    }
  };

  // This array contains all of the callbacks/code you want to run when MIDI messages
  // are received. Each callback is invoked with the message event and the
  // (potentially null) output port. Both typed to help with development and auto-complete.
  const callbacks: MIDICallbacks = [
    (e, output) => {
      const data = e.data;

      if (!data) {
        return;
      }

      if (data.length < 2) {
        throw new Error('A MIDI callback expects data indices up to 3 to be populated');
      }

      const [status, bank] = data;
      // Program Change on any channel
      if (192 <= status! && status! <= 207) {
        selectBank((bank! + 1) as Bank, output);
      }
    },
    (e) => {
      const data = e.data;

      if (!data) {
        return;
      }

      if (data.length < 2) {
        throw new Error('A MIDI callback expects data indices up to 3 to be populated');
      }

      const [status, control, controlValue] = data;

      // Channel 1 === 176, channel 16 === 191
      if (176 <= status! && status! <= 191) {
        const ccs = mappings[bank.value]?.usb.ccs;
        const index = ccs?.findIndex((cc) => cc === control);

        if (index != null) {
          potentiometers.value[index] = controlValue!;
        }
      }
    },
    (e) => {
      const eventData = e.data;

      if (!eventData) {
        return;
      }

      if (eventData.length < 2) {
        throw new Error('A MIDI callback expects data indices up to 3 to be populated');
      }

      const [status, ...data] = Array.from(eventData);

      // Extract, check, and drop manufacturer id bytes
      if (status !== 240 || !isEducationalManufacturer(data.splice(0, 3))) {
        return;
      }

      info.value = extractInfo(data);

      const [usbCcs, trsCcs, usbChans, trsChans] = extractMappings(data);

      const deviceBank = extractBank(data);

      mappings[deviceBank] = {
        usb: {
          ccs: usbCcs,
          channels: usbChans.map((channel) => channel + 1),
        },
        trs: {
          ccs: trsCcs,
          channels: trsChans.map((channel) => channel + 1),
        },
      };

      bank.value = deviceBank;
    },
  ];

  const { access, output, connected } = useWebMidi(
    () => true,
    (name) => (name ?? '').toLowerCase().includes(deviceName),
    callbacks,
  );

  // 8x2 specific concept of connecting. i.e. The input/output ports are connected,
  // and we are awaiting receipt of the initial config state for the active bank.
  const connecting = computed(() => connected.value && mappings[bank.value] == null);

  // Any time the value of output changes i.e. when we find a new 8x2 output port,
  // this effect makes sure that we automatically send the config state request message.
  // see: https://vuejs.org/guide/essentials/watchers.html#watcheffect
  watchEffect(() => {
    if (output.value && connected) {
      output.value.send(requestConfigMessage, 0);
    }
  });

  watchEffect(() => {
    if (!connected.value) {
      // Go ahead and wipe out the cached bank + potentiometer position data. There is
      // no guarantee that it will be valid and current when the device reconnects.
      Banks.forEach((bank) => delete mappings[bank]);

      potentiometers.value.fill(0, 0, 16);
    }
  });

  // External to this module, we expose a writeable computed where accessing
  // the value proxies to bank's value, but setting the value merely
  // aspirationally requests a new bank, and the value doesn't update until
  // the 8x2 successfully sends the updated config data for the requested bank.
  //
  // see: https://vuejs.org/guide/essentials/computed.html
  // see: https://vuejs.org/guide/essentials/computed.html#writable-computed
  const externalBank = computed({
    get() {
      return bank.value;
    },
    set(newBank: Bank) {
      selectBank(newBank, output.value);
    },
  });

  const saveConfig = (destBank: Bank, mapping: Mapping) => {
    if (connected.value) {
      const settingsBlock = new Array(15).fill(0, 0, 15);

      const sendConfigMessage = [
        0xf0,
        ...manufacturerId,
        0x0e,
        info.value?.modelNum,
        0,
        0,
        0,
        destBank - 1,
        ...settingsBlock,
      ];

      sendConfigMessage.push(
        ...mapping.usb.ccs,
        ...mapping.trs.ccs,
        ...mapping.usb.channels.map((channel) => channel - 1),
        ...mapping.trs.channels.map((channel) => channel - 1),
        0xf7,
      );

      output.value?.send(sendConfigMessage, 0);

      // Force 8x2 to echo back updated bank mapping to configurator
      selectBank(destBank, output.value);
    }
  };

  return {
    access,
    connected,
    connecting,
    mappings,
    bank: externalBank,
    info: readonly(info),
    potentiometers: readonly(potentiometers),
    saveConfig,
  };
};
