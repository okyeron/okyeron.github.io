import { z } from 'zod';

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

export const MappingSchema = z.object({
  usb: z.object({
    ccs: z.array(z.number()),
    channels: z.array(z.number()),
  }),
  trs: z.object({
    ccs: z.array(z.number()),
    channels: z.array(z.number()),
  }),
  flipped: z.optional(z.boolean()),
  bank: z.optional(z.number()),
});

export type Mapping = z.infer<typeof MappingSchema>;

export type Mappings = {
  [key in Bank]?: Mapping;
};

export type MIDICallback = (e: WebMidi.MIDIMessageEvent, output: WebMidi.MIDIOutput | null) => void;
export type MIDICallbacks = MIDICallback[];
