import { InputEventMap } from 'webmidi';

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

export type Mappings = {
  [key in Bank]?: {
    usb: {
      ccs: number[];
      channels: number[];
    };
    trs: {
      ccs: number[];
      channels: number[];
    };
  };
};

// Provides typing for `inputListenerCallbacks` in ../composables/hachiNi.ts
export type InputListenerCallbacks = { [K in keyof InputEventMap]?: InputEventMap[K][] };
