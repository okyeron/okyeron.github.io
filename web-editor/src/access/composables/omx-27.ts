import { computed, reactive, readonly, ref, watchEffect } from 'vue'
import type { DeviceInfo, MIDICallbacks, MIDICallback, OmxBank } from 'src/access/types'

import { omxBanks } from 'src/access/types'
import { useWebMidi } from './webMidi'

const ccByte = 176
const deviceManufacturer = 'denki-oto'
const deviceName = 'omx-27'
const manufacturerId = [125, 0, 0]
const requestConfigMessage = [0xf0, ...manufacturerId, 0x1f, 0xf7]
const saveConfigMessage = [0xf0, ...manufacturerId, 0x0d]

export const keyStatesRange = {
  end: 85, // 36, // 85,
  start: 59, // 11, // 59,
}

const potCcsStart =
  13 - 4 /* Number of bytes stripped from message start (status + manufacturer id bytes) */

const isEducationalManufacturer = (data: number[]) =>
  data.every((byte, i) => byte === manufacturerId[i])

const extractInfo = (data: number[]): DeviceInfo => {
  if (data.length < 6) {
    throw new Error('extractInfo expects data indices up to 5 to be populated')
  }

  return {
    modelNum: data[1]!,
    model: { 2: 'OMX-27' }[data[1]!] ?? '',
    ver: data[2]!,
    version: data.slice(2, 5).join('.'),
    eepromVersion: data[5]!,
  }
}

const extractSequencerInfo = (data: number[]): SequencerInfo => {
  if (data.length < 8) {
    throw new Error('extractSequencerInfo expects data indices up to 7 to be populated')
  }

  const mode = modes[data[6]!]

  if (!mode) {
    throw new Error('extractInfo expects data indices up to 6 to be populated')
  }

  return {
    mode,
    playingPattern: data[7]!,
  }
}

const modes = ['MIDI', 'Drum', 'Chords', 'S1', 'S2', 'Grids', 'Euclid', 'OM'] as const

type Mode = (typeof modes)[number]

const midiMacroModes = ['Off', 'M8', 'Norns', 'Deluge'] as const

type MidiMacroMode = (typeof midiMacroModes)[number]

const scaleRoots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

type ScaleRoot = (typeof scaleRoots)[number]

const scalePatterns = [
  'major',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'minor',
  'locrian',

  'mel minor',
  'dorian b2',
  'lydian #5',
  'lydian b7',
  'mixo b6',
  'half-dim',
  'altered',

  'harm minor',
  'locrian 6',
  'ionian #5',
  'dorian #4',
  'phrygian dom',
  'lydian #2',
  'sup loc bb7',

  'dbl harm.maj',
  'lydian #2#6',
  'ultraphrygian',
  'hungarian',
  'oriental',
  'ionian #2#5',
  'loc bb3bb7',

  'blues maj',
  'blues min',
  'penta maj',
  'penta min',
  'in sen',
  'iwato',
  'yo',
  'hirajoshi',
  'egyptian',
] as const

type ScalePattern = (typeof scalePatterns)[number] | 'off'

type MidiInfo = {
  channel: number
  defaultVelocity: number
  macro: {
    channel: number
    type: MidiMacroMode
  }
}

const extractMidiInfo = (data: number[]): MidiInfo => {
  if (data.length < 36) {
    throw new Error('No')
  }

  //  29 - MIDI Macro Channel
  //  30 - MIDI Macro Type
  const type = midiMacroModes[data[35]!]

  if (!type) {
    throw new Error('No')!
  }

  return {
    channel: data[8]! + 1,
    defaultVelocity: data[40]!,
    macro: {
      channel: data[34]! + 1,
      type,
    },
  }
}

export type PotentiometerInfo = {
  activeCcs: number[]
  bank: OmxBank
  ccs: number[]
  values: number[]
}

export type SequencerInfo = {
  mode: Mode
  playingPattern: number
}

export type OmxState = {
  info: DeviceInfo
  keys: Record<number, boolean>
  potentiometers: PotentiometerInfo
  scale: ScaleInfo
  midi: MidiInfo
  sequencer: SequencerInfo
}
// MODE is
// var modeid = document.getElementById("6");
// SYSEXx DUMP FROM DEVICE is 46 bytes
/*F0 // SYSEX 240

7D 00 00 // Manufacturer id

 return {
    modelNum: data[1],
    model: { 2: 'OMX-27' }[data[1]],
    ver: data[2],
    version: data.slice(2, 5).join('.'),
    eepromVersion: data[6],
  };

      //  64 bytes of data:
    //  0 - EEPROM VERSION
    //  1 - Current MODE
    //  2 - Sequencer PlayingPattern
    //  3 - MIDI mode MidiChannel
    //  4 - 28 - Pots (x25 - 5 banks of 5 pots)
    //  29 - MIDI Macro Channel
    //  30 - MIDI Macro Type
    //  31 - Scale Root
    //  32 - Scale Pattern, -1 for chromatic
    //  33 - Lock Scale - Bool
    //  34 - Scale Group 16 - Bool
    //  35 - 63 - Not yet used

240 // SysEx
125 0 0 // Manufacturer id
15 // ?
2 // Model number
1 // Major version
13 // Minor version
4 // Patch version
36 // EEPROM version

0 // Mode
0 // Sequencer playing pattern
0 // MIDI mode MIDI channel

// Potentiometer CCs
21 22 23 24 7 // Bank 1
29 30 31 32 33 // Bank 2
34 35 36 37 38 // Bank 3
39 40 41 42 43 // Bank 4
91 93 103 104 7 // Bank 5

9 // MIDI macro channel
0 // MIDI macro type
0 // Scale root
127 // Scale pattern; -1 for chromatic
0 // Lock scale (Boolean)
0 // Scale group 16 (Boolean)
100 // Not yet used
247 // Not yet used

  //  64 bytes of data:
    //  0 - EEPROM VERSION
    //  1 - Current MODE
    //  2 - Sequencer PlayingPattern
    //  3 - MIDI mode MidiChannel
    //  4 - 28 - Pots (x25 - 5 banks of 5 pots)
    //  29 - MIDI Macro Channel
    //  30 - MIDI Macro Type
    //  31 - Scale Root
    //  32 - Scale Pattern, -1 for chromatic
    //  33 - Lock Scale - Bool
    //  34 - Scale Group 16 - Bool
    //  35 - 63 - Not yet used

*/

// Pot banks start at byte 14
// MODE IS byte 11
// Playing pattern is byte 12
// midi channel is byte 13

// save SYSEX TO DEVICE - 38 bytes
// Pot banks start at byte 10
// MODE IS byte 7
// Playing pattern is byte 8
// midi channel is byte 9
// F0 7D 00 00 0D 36 00 00 01 15 16 17 18 07 1D 1E 1F 20 21 22 23 24 25 26 27 28 29 2A 2B 5B 5D 67 68 07 00 00 00 F7

// async find(access) {
//   const identify = raw("f0 7d 00 00 1f f7"), timeout = 100;
//   const signature = raw("f0 7d 00 00 0F ?? ?? ?? ??");
//   const model = message => ({
//     0x02: "OMX-27"
//   })[message[5]];
//   const version = message => (message[6] + "." + message[7] + "." + message[8]);
//   const ver = message => (message[6]);
//   const eeprom_version = message => (message[9]);

//   if (this.model)
//     if (this.input && this.input.state == "connected")
//       if (this.output && this.output.state == "connected")
//         return this.model;
//   this.clear();

//   for (const port of access.outputs.values()) {
//     const promise = access.receive(event => {
//       if (match(signature, event.data))
//         if (this.model = model(event.data), this.model) {
//           this.version = version(event.data);
//           this.ver = ver(event.data);
//           this.eeprom_version = eeprom_version(event.data);
//           this.input = event.target;
//           this.output = port;
//           this.data = event.data;
//           return true;
//         }
//     }, timeout);
//     port.send(identify);
//     if (await promise)
//       break;
//   }
//   return this.model;
// },

// const extractInfo = (data: number[]): Info => {
//   return {
//     modelNum: data[1],
//     model: { 2: 'OMX-27' }[data[5]],
//     ver: data[6],
//     version: data.slice(6, 9).join('.'),
//     eepromVersion: data[9],
//   };
// };

const extractPotBank = (data: number[]): OmxBank => {
  if (data.length < 44) {
    throw new Error('No')
  }

  return (data[43]! + 1) as OmxBank
}

const extractPotentiometerCCs = (data: number[]) => {
  return data.slice(potCcsStart, potCcsStart + 25) // 5 x 5 banks
}

type ScaleInfo = {
  group: boolean
  lock: boolean
  pattern: ScalePattern
  root: ScaleRoot
}

//  31 - Scale Root
//  32 - Scale Pattern, -1 for chromatic
//  33 - Lock Scale - Bool
//  34 - Scale Group 16 - Bool
const extractScaleInfo = (data: number[]): ScaleInfo => {
  if (data.length < 41) {
    throw new Error('No')
  }

  const [root, pattern, lock, group] = data.slice(36, 40) as [number, number, number, number]

  const scalePattern = pattern === 127 ? 'off' : scalePatterns[pattern]

  const scaleRoot = scaleRoots[root]

  if (!scalePattern || !scaleRoot) {
    throw new Error('No')
  }

  return {
    group: Boolean(group),
    lock: Boolean(lock),
    pattern: scalePattern,
    root: scaleRoot,
  }
}

// const extract = (data: number[]): ScaleInfo => {
//   const [root, pattern, lock, group] = data.slice(36, 40);

//   return {
//     root: scaleRoots[root],
//     pattern: scalePatterns[pattern],
//     locked: Boolean(lock),
//     group: Boolean(group),
//   };
// };

export const useOmx27 = () => {
  const bank = ref<OmxBank>(1)

  const potentiometers = ref(Array.from({ length: 25 }).fill(0, 0, 25) as number[])

  const activePotentiometerBankCCs = computed<number[]>({
    get() {
      const offset = omxBanks.length * (bank.value - 1)

      return potentiometers.value.slice(offset, offset + omxBanks.length)
    },
    set(value: number[]) {
      const offset = omxBanks.length * (bank.value - 1)

      potentiometers.value.splice(offset, omxBanks.length, ...value)
    },
  })

  const omxState = reactive<OmxState>({
    info: {
      modelNum: 0,
      model: '',
      ver: 0,
      version: '',
      eepromVersion: 0,
    },
    keys: {},
    midi: {
      channel: 0,
      defaultVelocity: 0,
      macro: { channel: 0, type: 'Off' },
    },
    potentiometers: {
      activeCcs: activePotentiometerBankCCs as unknown as PotentiometerInfo['activeCcs'],
      bank: bank as unknown as PotentiometerInfo['bank'],
      ccs: potentiometers as unknown as PotentiometerInfo['ccs'],
      values: Array.from({ length: omxBanks.length }).fill(0, 0, omxBanks.length) as number[],
    },
    // potentiometerCcs: activePotentiometerBankCCs.value,
    scale: {
      group: false,
      lock: false,
      pattern: 'major',
      root: 'C',
    },
    sequencer: {
      mode: 'MIDI',
      playingPattern: 0,
    },
  })

  const ccStatus = computed(() => ccByte + omxState.midi.channel - 1)

  const keyStates = computed(() => ({
    pressed: 144 + omxState.midi.channel - 1, // 158,
    released: 128 + omxState.midi.channel - 1, // 142,
  }))

  for (let i = keyStatesRange.start; i < keyStatesRange.end; i++) {
    omxState.keys[i] = false
  }

  const selectBank = (bank: OmxBank, output: MIDIOutput | null) => {
    if (output && output.state === 'connected') {
      output.send([0xb0, 0, bank - 1], 0)
    }
  }

  const bankSelectCallback: MIDICallback = (e) => {
    const [status, cc, value] = e.data ?? []

    if (cc === undefined || status === undefined || value === undefined) {
      return
    }

    // Currently, the OMX-27 does not send any sort of update message
    // when the MIDI channel is changed on device. To get around the
    // channel de-syncing with what the web editor understands to be active
    // MIDI channel, we just check to see if the status byte falls within
    // the 176 - 191 range, which correlates to CC messages on MIDI channels 1 - 16.
    const normalizedStatus = status - ccByte

    const isCcStatus = 0 <= normalizedStatus && normalizedStatus <= 15

    if (isCcStatus && cc === 90) {
      bank.value = (value + 1) as OmxBank
    }
  }

  const keyStateCallback: MIDICallback = (e) => {
    const [status, key] = e.data ?? []

    if (key === undefined || status === undefined) {
      return
    }

    if (keyStates.value.released === status || keyStates.value.pressed === status) {
      omxState.keys[key] = keyStates.value.pressed === status
    }
  }

  const potentiometerStateCallback: MIDICallback = (e) => {
    if (!e.data) {
      return
    }

    const [status, control, controlValue] = e.data

    if (status === undefined || control === undefined || controlValue === undefined) {
      return
    }

    if (ccStatus.value === status && control !== 90) {
      omxState.potentiometers.values[activePotentiometerBankCCs.value.indexOf(control)] =
        controlValue
    }
  }

  // This array contains all of the callbacks/code you want to run when MIDI messages
  // are received. Each callback is invoked with the message event and the
  // (potentially null) output port. Both typed to help with development and auto-complete.
  const callbacks: MIDICallbacks = [
    // (e, output) => {
    //   const [status, bank] = e.data;

    //   // Program Change on any channel
    //   if (192 <= status && status <= 207) {
    //     selectBank((bank + 1) as OmxBank, output);
    //   }
    // },
    bankSelectCallback,
    keyStateCallback,
    potentiometerStateCallback,
    (e) => {
      if (!e.data) {
        return
      }

      const [status, ...data] = Array.from(e.data)

      if (status === undefined) {
        return
      }

      // 252 is sent when OMX-27 saves on-device
      // Extract, check, and drop manufacturer id bytes
      if (![240, 252].includes(status) || !isEducationalManufacturer(data.splice(0, 3))) {
        return
      }

      if (data.length === 0) {
        output.value?.send(requestConfigMessage, 0)

        return
      }

      if (data.length < 44) {
        throw new Error('No')
      }

      omxState.info = extractInfo(data)

      potentiometers.value = extractPotentiometerCCs(data)

      const scaleInfo = extractScaleInfo(data)

      omxState.scale = scaleInfo

      const midiInfo = extractMidiInfo(data)

      omxState.midi = midiInfo

      omxState.sequencer = extractSequencerInfo(data)

      bank.value = extractPotBank(data) as OmxBank
    },
  ]

  const { access, output, connected } = useWebMidi(deviceManufacturer, deviceName, callbacks)

  // OMX-27 specific concept of connecting. i.e. The input/output ports are connected,
  // and we are awaiting receipt of the initial config state for the active bank.
  const connecting = computed(() => connected.value && omxState.info.model === '')

  // Any time the value of output changes i.e. when we find a new OMX-27 output port,
  // this effect makes sure that we automatically send the config state request message.
  // see: https://vuejs.org/guide/essentials/watchers.html#watcheffect
  watchEffect(() => {
    if (output.value && connected.value) {
      output.value.send(requestConfigMessage, 0)
    }
  })

  watchEffect(() => {
    if (!connected.value) {
      // Go ahead and wipe out the cached bank + potentiometer position data. There is
      // no guarantee that it will be valid and current when the device reconnects.

      omxState.potentiometers.ccs.fill(0, 0, 25)
    }
  })

  // External to this module, we expose a writeable computed where accessing
  // the value proxies to bank's value, but setting the value merely
  // aspirationally requests a new bank, and the value doesn't update until
  // the OMX-27 successfully sends the updated config data for the requested bank.
  //
  // see: https://vuejs.org/guide/essentials/computed.html
  // see: https://vuejs.org/guide/essentials/computed.html#writable-computed
  const externalBank = computed<OmxBank>({
    get() {
      return omxState.potentiometers.bank
    },
    set(newBank: OmxBank) {
      selectBank(newBank, output.value)

      bank.value = newBank
    },
  })

  const saveConfig = ({ bank, ccs }: { bank: OmxBank; ccs: number[] }) => {
    // (destBank: OmxBank, mapping: Mapping) => {
    if (connected.value) {
      /*
0:  F0
1:  7D
2:  00
3:  00
4:  0D
- EEPROM version
5:  36
- Mode
6:  06
- Playing pattern
7:  00
- MIDI channel
8:  02
- bank 0
9:  15
10: 16
11: 17
12: 18
13: 07
- bank 1
14: 1D
15: 1E
16: 1F
17: 20
18: 21
- bank 2
19: 22
20: 23
21: 24
22: 25
23: 26
- bank 3
24: 27
25: 28
26: 29
27: 2A
28: 2B
- bank 4
29: 5B
30: 5D
31: 67
32: 68
33: 07
- Magic bytes (?)
34: 00
35: 00
36: 00
37: F7
*/

      const offset = omxBanks.length * (bank - 1)

      potentiometers.value.splice(offset, ccs.length, ...ccs)

      const sendConfigMessage: number[] = [
        ...saveConfigMessage,
        omxState.info.eepromVersion, // .modelNum ?? 0,
        modes.indexOf(omxState.sequencer.mode),
        omxState.sequencer.playingPattern,
        omxState.midi.channel - 1, // 0-indexed for saving
        ...potentiometers.value,
        // TODO: Magic byte sequence. What is this?
        0,
        0,
        0,
        0xf7,
      ]

      output.value?.send(sendConfigMessage, 0)

      // Force OMX-27 to echo back updated bank mapping to configurator
      // selectBank(bank, output.value)
    }
  }

  return {
    access,
    connected,
    connecting,
    bank: externalBank,
    info: readonly(omxState.info),
    keys: readonly(omxState.keys),
    activeCcs: readonly(omxState.potentiometers.activeCcs),
    potentiometers: omxState.potentiometers,
    omxState: readonly(omxState),
    saveConfig,
  }
}
