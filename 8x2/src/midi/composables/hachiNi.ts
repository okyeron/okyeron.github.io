import { computed, reactive, readonly, ref, watch } from 'vue';
import { Input, Message, Output, PortEvent, WebMidi } from 'webmidi';
import { Mappings, Bank, Port, Info, InputListenerCallbacks, Banks } from '@/midi/types';

const deviceName = 'hachi-ni';
const configMessagePrefixPattern = [0, 0, 15]; // What are these?
const requestConfigMessage = [0xf0, 0x7d, 0x00, 0x00, 0x1f, 0xf7]; // What are these?

const midiInput = ref<Input | null>(null);
const midiOutput = ref<Output | null>(null);

const midiInfo = ref<Info | null>(null);

const mappings = reactive<Mappings>({});

const midiBank = ref<Bank>(1);

const potentiometers = ref<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

// External to this module, we expose a writeable computed where accessing
// the value proxies to midiBank's value, but setting the value merely
// aspirationally requests a new bank, and the value doesn't update until
// the 8x2 successfully sends the updated config data for the requested bank.
//
// see: https://vuejs.org/guide/essentials/computed.html
// see: https://vuejs.org/guide/essentials/computed.html#writable-computed
const externalMidiBank = computed({
  get() {
    return midiBank.value;
  },
  set(newBank: Bank) {
    selectBank(newBank);
  },
});

const connected = computed(() => midiInput.value && midiOutput.value);

const connecting = computed(() => {
  return connected.value && null == mappings[midiBank.value];
});

watch(connected, () => {
  if (!connected.value) {
    // Go ahead and wipe out the cached bank data. There is no guarantee
    // that it will be valid and current when the device reconnects.
    Banks.forEach((bank) => delete mappings[bank]);
  }
});

// If connected to an output port, this sends the bank change request, followed
// immediately by the message to request the config state.
const selectBank = (bank: Bank) => {
  if (midiOutput.value && midiOutput.value.state === 'connected') {
    console.debug(`selecting bank ${bank} (and requesting updated config)`);

    midiOutput.value.send([192, bank - 1]).send(requestConfigMessage);
  }
};

// Takes a WebMidi message's dataBytes array (see: https://webmidijs.org/api/classes/Message#dataBytes)
// e.g., without the first two bytes of the message's complete data array.
const extractInfo = (bytes: number[]): Info => {
  return {
    modelNum: bytes[3],
    model: { 0x05: '8x2' }[bytes[3]],
    ver: bytes[4],
    version: bytes.slice(4, 7).join('.'),
    eepromVersion: bytes[8],
  };
};

// Takes a WebMidi message's dataBytes array (see: https://webmidijs.org/api/classes/Message#dataBytes)
// e.g., without the first two bytes of the message's complete data array.
// Extracts the currently mapped channels and CCs for the USB and TRS interfaces.
const extractMappings = (bytes: number[]) => {
  const usbCcStart = 23;
  const trsCcStart = 39;
  const usbChanStart = 55;
  const trsChanStart = 71;
  const startOffsets = [usbCcStart, trsCcStart, usbChanStart, trsChanStart];

  return startOffsets.map((offset) => {
    const values = [];

    for (let i = offset; i < offset + 16; i++) {
      values.push(bytes[i]);
    }

    return values;
  });
};

// Returns true if the incoming sysex message is the 8x2's config info.
const configMessageGuard = (message: Message) => {
  const {
    command,
    manufacturerId: [id],
  } = message;

  if (command !== 240 || id !== 125) {
    return false;
  }

  return message.dataBytes
    .slice(0, configMessagePrefixPattern.length)
    .every((byte, i) => byte === configMessagePrefixPattern[i]);
};

// Finds/connects to the 8x2's specified port. Also features function
// overloading to correctly type the result based on the direction parameter value.
// see: https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads
function getPort(direction: 'Input'): Input;
function getPort(direction: 'Output'): Output;
function getPort(direction: Port): Input | Output | null {
  const port = WebMidi[`get${direction}ByName`](deviceName);

  if (port && port.state === 'connected') {
    return port;
  }

  return null;
}

// This object contains all of the callbacks/code you want to run when MIDI
// messages are received. The keys are any message type exposed by WebMidi,
// and the values are arrays of callback functions to run when that message type
// is received. It's all correctly typed to help with auto completion.
const inputListenerCallbacks: InputListenerCallbacks = {
  // TODO: Figure out how to receive knob states
  controlchange: [
    (e) => {
      if (e.message.statusByte === 176) {
        // console.debug(e);
        const [control, controlValue] = e.message.dataBytes;
        // console.debug(`channel ${e.message.channel}. cntrl: ${control}:${controlValue}`);
        const thisPot = mappings[midiBank.value]?.usb.ccs;
        const thisIdx = thisPot?.findIndex((el) => el === control);
        console.debug(thisIdx);
        if (thisIdx != null) {
          potentiometers.value[thisIdx] = controlValue;
        }
      }
    },
  ],
  sysex: [
    (e) => {
      console.debug(e);

      if (!configMessageGuard(e.message)) {
        return;
      }

      midiInfo.value = extractInfo(e.message.dataBytes);

      const [usbCcs, trsCcs, usbChans, trsChans] = extractMappings(e.message.dataBytes);

      const bank = (e.message.dataBytes[7] + 1) as Bank; // Sketchy, as there is no validation

      // Important: Updating mappings here, and midiBank after it, drives the entire UI state.
      mappings[bank] = {
        usb: {
          ccs: usbCcs,
          channels: usbChans.map((channel) => channel + 1),
        },
        trs: {
          ccs: trsCcs,
          channels: trsChans.map((channel) => channel + 1),
        },
      };

      midiBank.value = bank;
    },
  ],
};

const connectedCallback = (e: PortEvent) => {
  console.debug(`connected ${e.port.name} ${e.port.type}`);
  console.debug(e);

  // TODO: Might be a more 'correct' way of ensuring we only connect to the 8x2.
  if (e.port.type === 'input' && e.port === getPort('Input')) {
    midiInput.value = e.port;
  }

  if (e.port.type === 'output' && e.port === getPort('Output')) {
    midiOutput.value = e.port;
  }
};

const disconnectedCallback = (e: PortEvent) => {
  console.debug(`disconnected ${e.port.name} ${e.port.type}`);
  console.debug(e);

  if (e.port.type === 'input' && e.port.name === deviceName) {
    midiInput.value = null;
  }

  if (e.port.type === 'output' && e.port.name === deviceName) {
    midiOutput.value = null;
  }
};

const initialize = () => {
  console.debug('Web MIDI access granted. Initializing.');

  WebMidi.addListener('connected', connectedCallback);
  WebMidi.addListener('disconnected', disconnectedCallback);
};

// Any time the value of midiOutput changes i.e. when we find a new 8x2 output port,
// this watcher makes sure that we automatically send the config state request message.
// see: https://vuejs.org/guide/essentials/watchers.html
watch(midiOutput, (/* newValue */ _, oldValue) => {
  oldValue?.removeListener(); // Drops all registered listeners

  if (midiOutput.value && midiOutput.value.state === 'connected') {
    console.debug('requesting config');

    midiOutput.value.send(requestConfigMessage);
  }
});

// Any time the value of midiInput changes i.e. when we find a new 8x2 input port,
// this watcher makes sure that we automatically register all of our callbacks for MIDI events.
// see: https://vuejs.org/guide/essentials/watchers.html
watch(midiInput, (/* newValue */ _, oldValue) => {
  oldValue?.removeListener(); // Drops all registered listeners

  if (midiInput.value && midiInput.value.state === 'connected') {
    Object.entries(inputListenerCallbacks).forEach(([event, callbacks]) => {
      callbacks.forEach((callback) => midiInput.value?.addListener(event as keyof InputListenerCallbacks, callback));
    });
  }
});

export const useHachiNi = () => {
  if (WebMidi.supported) {
    WebMidi.addListener('midiaccessgranted', initialize);

    WebMidi.enable({ sysex: true })
      // TODO: Actually do something if this errors out.
      .catch((err) => alert(err));
  }

  return {
    connected,
    connecting,
    mappings,
    bank: externalMidiBank,
    info: readonly(midiInfo),
    midiSupported: WebMidi.supported,
    potentiometers,
  };
};
