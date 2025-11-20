import { computed, readonly, ref, watch, onUnmounted } from 'vue';
import type { MidiAccessState, MIDICallbacks } from 'src/access/types';

const debug = (...message: unknown[]) => console.debug('[Web MIDI]:', ...message);

type StringPredicate = (value: string | null) => boolean;

export const useWebMidi = (
  deviceManufacturer: string | StringPredicate,
  deviceName: string | StringPredicate,
  callbacks: MIDICallbacks,
) => {
  const access = ref<MidiAccessState>('pending');
  const input = ref<MIDIInput | null>(null);
  const inputDeviceState = ref<MIDIPortDeviceState>('disconnected');
  const output = ref<MIDIOutput | null>(null);
  const outputDeviceState = ref<MIDIPortDeviceState>('disconnected');

  const inputAbortController = ref<AbortController>(new AbortController());
  const outputAbortController = ref<AbortController>(new AbortController());

  const connected = computed(
    () =>
      input.value != null &&
      output.value != null &&
      inputDeviceState.value === 'connected' &&
      outputDeviceState.value === 'connected',
  );

  const validateManufacturer: StringPredicate =
    typeof deviceManufacturer === 'string'
      ? (name) => name === deviceManufacturer
      : deviceManufacturer;

  const validateDeviceName: StringPredicate =
    typeof deviceName === 'string' ? (name) => name === deviceName : deviceName;

  const validPort = (port: MIDIPort): boolean =>
    validateDeviceName(port.name) && validateManufacturer(port.manufacturer);

  const extractPortProperties = (port: MIDIPort | null) => ({
    connection: port?.connection,
    id: port?.id,
    manufacturer: port?.manufacturer,
    name: port?.name,
    state: port?.state,
    type: port?.type,
  });

  function findPort(portMap: MIDIInputMap): MIDIInput;
  function findPort(portMap: MIDIOutputMap): MIDIOutput;
  function findPort<P extends MIDIInputMap | MIDIOutputMap>(
    portMap: P,
  ): MIDIInput | MIDIOutput | null {
    for (const [, value] of portMap) {
      if (validPort(value)) {
        return value as P extends MIDIInputMap
          ? MIDIInput
          : P extends MIDIOutputMap
            ? MIDIOutput
            : never;
      }
    }

    return null;
  }

  let midiAccess: MIDIAccess | null = null;

  const stateChangeHandler = (e: MIDIConnectionEvent) => {
    const eventPort = e.port;
    debug('State change fired', extractPortProperties(eventPort));

    // Always rescan all ports
    input.value = findPort(midiAccess!.inputs as MIDIInputMap);
    output.value = findPort(midiAccess!.outputs as MIDIOutputMap);

    if (input.value) {
      inputDeviceState.value =
        input.value.state === 'connected' && input.value.connection === 'open'
          ? 'connected'
          : 'disconnected';
      if (input.value.connection !== 'open') {
        input.value.open?.();
      }
    } else {
      inputDeviceState.value = 'disconnected';
    }

    if (output.value) {
      outputDeviceState.value =
        output.value.state === 'connected' && output.value.connection === 'open'
          ? 'connected'
          : 'disconnected';
      if (output.value.connection !== 'open') {
        output.value.open?.();
      }
    } else {
      outputDeviceState.value = 'disconnected';
    }
  };

  watch(input, (newValue) => {
    inputAbortController.value.abort();
    inputAbortController.value = new AbortController();

    if (newValue) {
      callbacks.forEach((callback) =>
        newValue.addEventListener('midimessage', (e) => callback(e, output.value), {
          signal: inputAbortController.value.signal,
        }),
      );
    }
  });

  watch(output, (newValue) => {
    outputAbortController.value.abort();

    outputAbortController.value = new AbortController();

    newValue?.open();
  });

  watch(
    [access, connected, input, inputDeviceState, output, outputDeviceState],
    () => {
      debug(
        'State History Snapshot',
        JSON.stringify(
          {
            access: access.value,
            connected: connected.value,
            input: extractPortProperties(input.value),
            inputDeviceState: inputDeviceState.value,
            output: extractPortProperties(output.value),
            outputDeviceState: outputDeviceState.value,
          },
          null,
          2,
        ),
      );
    },
    { immediate: true },
  );

  const requestAccess = () => {
    navigator
      .requestMIDIAccess({ sysex: true })
      .then(
        (value) => {
          midiAccess = value;

          debug('MIDI access request: granted');

          midiAccess.addEventListener('statechange', stateChangeHandler);

          debug(
            'Available MIDI Input ports:',
            JSON.stringify([...midiAccess.inputs.values()].map(extractPortProperties), null, 2),
          );

          debug(
            'Available MIDI Output ports:',
            JSON.stringify([...midiAccess.outputs.values()].map(extractPortProperties), null, 2),
          );

          input.value = findPort(midiAccess.inputs as MIDIInputMap);

          output.value = findPort(midiAccess.outputs as MIDIOutputMap);

          if (input.value) {
            input.value.open?.();
          }

          if (output.value) {
            output.value.open?.();
          }

          access.value = 'enabled';
        },
        () => {
          debug('MIDI access request: denied');

          access.value = 'disabled';
        },
      )
      .catch((e) => {
        debug(`MIDI access error: ${e.message}`);

        access.value = 'disabled';
      });
  };

  // Permissions query fallback
  if ('permissions' in navigator && 'query' in navigator.permissions) {
    navigator.permissions
      .query({ name: 'midi' as PermissionName })
      .then((result) => {
        debug(`MIDI permissions query result: ${result.state}`);

        if (result.state === 'prompt') {
          access.value = 'requesting';
        } else if (result.state === 'denied') {
          access.value = 'disabled';
        }
      })
      .finally(requestAccess)
      .catch(requestAccess);
  } else {
    requestAccess();
  }

  onUnmounted(() => {
    inputAbortController.value.abort();

    outputAbortController.value.abort();

    midiAccess?.removeEventListener('statechange', stateChangeHandler);
  });

  return {
    access: readonly(access),
    connected,
    input: readonly(input),
    output: readonly(output),
  };
};
