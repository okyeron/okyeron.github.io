import { computed, readonly, ref, watch } from 'vue';
import { MidiAccessState, MIDICallbacks } from '@/access/types';

export const useWebMidi = (deviceName: string, callbacks: MIDICallbacks) => {
  const access = ref<MidiAccessState>('pending');
  const input = ref<WebMidi.MIDIInput | null>(null);
  const inputDeviceState = ref<WebMidi.MIDIPortDeviceState>('disconnected');
  const output = ref<WebMidi.MIDIOutput | null>(null);
  const outputDeviceState = ref<WebMidi.MIDIPortDeviceState>('disconnected');

  const inputAbortController = ref<AbortController>(new AbortController());
  const outputAbortController = ref<AbortController>(new AbortController());

  const connected = computed(() => {
    return (
      input.value && output.value && inputDeviceState.value === 'connected' && outputDeviceState.value === 'connected'
    );
  });

  const stateChangeHandler = (e: WebMidi.MIDIConnectionEvent) => {
    if (e.port.name !== deviceName) {
      return;
    }

    const isInput = e.port.type === 'input';

    const store = isInput ? inputDeviceState : outputDeviceState;
    const port = isInput ? input : output;

    store.value = e.port.state === 'connected' && e.port.connection === 'open' ? 'connected' : 'disconnected';

    if (e.port.state === 'disconnected') {
      port.value = null;
    } else {
      port.value = isInput ? (e.port as WebMidi.MIDIInput) : (e.port as WebMidi.MIDIOutput);
    }
  };

  watch(input, (newValue) => {
    inputAbortController.value.abort();
    inputAbortController.value = new AbortController();

    if (newValue) {
      callbacks.forEach((callback) =>
        newValue.addEventListener('midimessage', (e) => callback(e, output.value), {
          signal: inputAbortController.value.signal,
        })
      );
    }
  });

  watch(output, (newValue) => {
    outputAbortController.value.abort();
    outputAbortController.value = new AbortController();

    newValue?.open();
  });

  // Why the type assertions? TypeScript has taken the view of only supporting the smaller
  // subset covered by all browsers, and not the expanded list with things like Web MIDI
  // that Chromium et al. support. My understanding, at least.
  const midiPermission = { name: 'midi' as PermissionName, sysex: true } as PermissionDescriptor;

  navigator.permissions
    .query(midiPermission)
    .then((result) => {
      if (result.state === 'prompt') {
        access.value = 'requesting';
      } else if (result.state === 'denied') {
        access.value = 'disabled'; // WebMIDI API permission was denied by user prompt or permission policy
      }
    })
    .then(() => {
      navigator.requestMIDIAccess({ sysex: true }).then(
        (midiAccess) => {
          midiAccess.addEventListener('statechange', stateChangeHandler);

          input.value = [...midiAccess.inputs.values()].find((input) => input.name === deviceName) ?? null;
          output.value = [...midiAccess.outputs.values()].find((output) => output.name === deviceName) ?? null;

          access.value = 'enabled';
        },
        () => {
          access.value = 'disabled';
        }
      );
    })
    .catch((e) => {
      if (e instanceof TypeError) {
        // Likely caused by 'midi' not being in the PermissionName enumeration. i.e. browser doesn't support web MIDI.
        access.value = 'disabled';
      }
    });

  return {
    access: readonly(access),
    connected,
    input: readonly(input),
    output: readonly(output),
  };
};
