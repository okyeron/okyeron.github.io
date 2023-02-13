export type MidiAccessState = 'disabled' | 'pending' | 'requesting' | 'enabled';

export const Banks = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type BanksTuple = typeof Banks;
export type Bank = BanksTuple[number];

export type Interface = 'usb' | 'trs';
export type Port = 'Input' | 'Output';

export type Info = {
  modelNum: number;
  model?: string;
  ver: number;
  version: string;
  eepromVersion: number;
};

export type Mapping = {
  usb: {
    ccs: number[];
    channels: number[];
  };
  trs: {
    ccs: number[];
    channels: number[];
  };
};

export type Mappings = {
  [key in Bank]?: Mapping;
};

export type MIDICallback = (e: WebMidi.MIDIMessageEvent, output: WebMidi.MIDIOutput | null) => void;
export type MIDICallbacks = MIDICallback[];
