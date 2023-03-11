import { computed, reactive, readonly, ref, watchEffect } from 'vue';
import { Mappings, Bank, Info, Banks, MIDICallbacks, Mapping } from '@/access/types';
import { useWebMidi } from './webMidi';

const deviceManufacturer = 'denkioto';
const deviceName = 'omx-27';
const manufacturerId = [125, 0, 0];
const requestConfigMessage = [0xf0, ...manufacturerId, 0x1f, 0xf7];

const isEducationalManufacturer = (data: number[]) => data.every((byte, i) => byte === manufacturerId[i]);

const extractInfo = (data: number[]): Info => {
  return {
    modelNum: data[1],
    model: { 2: 'OMX-27' }[data[1]],
    ver: data[2],
    version: data.slice(2, 5).join('.'),
    eepromVersion: data[6],
    currentmode: data[7],
    PlayingPattern: data[8],
    midiChannel: data[9],
  };
};

const extractMappings = (data: number[]) => {
  const usbCcStart = 10;
  const trsCcStart = 41;
  const usbChanStart = 57;
  const trsChanStart = 73;
  const startOffsets = [usbCcStart, trsCcStart, usbChanStart, trsChanStart].map(
    (offset) => offset - 4 // Number of bytes stripped from message start (status + manufacturer id bytes)
  );

  return startOffsets.map((offset) => {
    const values = [];

    for (let i = offset; i < offset + 5; i++) {
      values.push(data[i]);
    }

    return values;
  });
};

const extractBank = (data: number[]): Bank => (data[5] + 1) as Bank; // Sketchy, as there is no validation

export const useOMX27 = () => {
  const info = ref<Info | null>(null);

  const mappings = reactive<Mappings>({});

  const bank = ref<Bank>(1);

  const potentiometers = ref<number[]>(new Array(5).fill(0, 0, 16));

  // If connected to an output port, this sends the bank change request, followed
  // immediately by the message to request the config state.
  const selectBank = (bank: Bank, output: WebMidi.MIDIOutput | null) => {
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
      const [status, bank] = e.data;
      // Program Change on any channel
      if (192 <= status && status <= 207) {
        selectBank((bank + 1) as Bank, output);
      }
    },
    (e) => {
      const [status, control, controlValue] = e.data;

      // Channel 1 === 176, channel 16 === 191
      if (176 <= status && status <= 191) {
        const ccs = mappings[bank.value]?.usb.ccs;
        const index = ccs?.findIndex((cc) => cc === control);

        if (index != null) {
          potentiometers.value[index] = controlValue;
        }
      }
    },
    (e) => {
      const [status, ...data] = Array.from(e.data);

      // Extract, check, and drop manufacturer id bytes
      if (status !== 240 || !isEducationalManufacturer(data.splice(0, 3))) {
        return;
      }

      info.value = extractInfo(data);
console.debug('[sysex]:', ...data);
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

  const { access, output, connected } = useWebMidi(deviceManufacturer, deviceName, callbacks);

  // OMX-27 specific concept of connecting. i.e. The input/output ports are connected,
  // and we are awaiting receipt of the initial config state for the active bank.
  const connecting = computed(() => connected.value && mappings[bank.value] == null);

  // Any time the value of output changes i.e. when we find a new OMX-27 output port,
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
  // the OMX-27 successfully sends the updated config data for the requested bank.
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
        0xf7
      );

      output.value?.send(sendConfigMessage, 0);

      // Force OMX-27 to echo back updated bank mapping to configurator
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
