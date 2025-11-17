import { computed, readonly, ref, watch } from 'vue'
import type { MidiAccessState, MIDICallbacks } from 'src/access/types'

const debug = (...message: unknown[]) => console.debug('[Web MIDI]:', ...message)

export const useWebMidi = (
  deviceManufacturer: string,
  deviceName: string,
  callbacks: MIDICallbacks,
) => {
  const access = ref<MidiAccessState>('pending')
  const input = ref<MIDIInput | null>(null)
  const inputDeviceState = ref<MIDIPortDeviceState>('disconnected')
  const output = ref<MIDIOutput | null>(null)
  const outputDeviceState = ref<MIDIPortDeviceState>('disconnected')

  const inputAbortController = ref<AbortController>(new AbortController())
  const outputAbortController = ref<AbortController>(new AbortController())

  const connected = computed(() => {
    // console.log('checking connected for', deviceManufacturer, deviceName)
    // console.log('input.value', input.value)
    // console.log('output.value', output.value)
    // console.log('inputDeviceState.value', inputDeviceState.value)
    // console.log('outputDeviceState.value', outputDeviceState.value)

    return (
      input.value != null &&
      output.value != null &&
      inputDeviceState.value === 'connected' &&
      outputDeviceState.value === 'connected'
    )
  })

  const validPort = (port: MIDIPort): boolean =>
    (port.manufacturer?.includes(deviceManufacturer) ?? false) &&
    (port.name?.includes(deviceName) ?? false)

  const stateChangeHandler = (e: Event) => {
    console.log('stateChangeHandler')
    console.log(e)
    const eventPort = (e as MIDIConnectionEvent)?.port

    if (!eventPort) {
      console.log('no port')
      return
    }

    if (!validPort(eventPort)) {
      console.log('not valid port')
      return
    }

    const isInput = eventPort.type === 'input'

    const store = isInput ? inputDeviceState : outputDeviceState
    const port = isInput ? input : output

    store.value =
      eventPort.state === 'connected' && eventPort.connection === 'open'
        ? 'connected'
        : 'disconnected'

    debug(
      'State Change Event',
      JSON.stringify(
        {
          ...extractPortProperties(eventPort),
          connectionState: store.value,
        },
        null,
        2,
      ),
    )

    if (eventPort.state === 'disconnected') {
      port.value = null
    } else {
      port.value = isInput ? (eventPort as MIDIInput) : (eventPort as MIDIOutput)
    }
  }

  watch(input, (newValue) => {
    inputAbortController.value.abort()
    inputAbortController.value = new AbortController()

    if (newValue) {
      callbacks.forEach((callback) =>
        newValue.addEventListener('midimessage', (e) => callback(e, output.value), {
          signal: inputAbortController.value.signal,
        }),
      )
    }
  })

  watch(output, (newValue) => {
    outputAbortController.value.abort()
    outputAbortController.value = new AbortController()

    newValue?.open()
  })

  const extractPortProperties = (port: MIDIPort | null) => {
    return {
      connection: port?.connection,
      id: port?.id,
      manufacturer: port?.manufacturer,
      name: port?.name,
      state: port?.state,
      type: port?.type,
    }
  }

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
      )
    },
    { immediate: true },
  )

  function findPort(portMap: MIDIInputMap): MIDIInput
  function findPort(portMap: MIDIOutputMap): MIDIOutput
  function findPort<P extends MIDIInputMap | MIDIOutputMap>(
    portMap: P,
  ): MIDIInput | MIDIOutput | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, value] of portMap) {
      if (validPort(value)) {
        return value as P extends MIDIInputMap
          ? MIDIInput
          : P extends MIDIOutputMap
            ? MIDIOutput
            : never
      }
    }

    return null
  }

  // Why the type assertions? TypeScript has taken the view of only supporting the smaller
  // subset covered by all browsers, and not the expanded list with things like Web MIDI
  // that Chromium et al. support. My understanding, at least.
  const midiPermission = {
    name: 'midi' as PermissionName,
    sysex: true,
  } as PermissionDescriptor

  navigator.permissions
    .query(midiPermission)
    .then((result) => {
      debug(`MIDI + Sysex permissions query result: ${result.state}`)

      if (result.state === 'prompt') {
        access.value = 'requesting'
      } else if (result.state === 'denied') {
        access.value = 'disabled' // WebMIDI API permission was denied by user prompt or permission policy
      }
    })
    .then(() => {
      navigator.requestMIDIAccess({ sysex: true }).then(
        (midiAccess) => {
          debug('MIDI access request: granted')

          midiAccess.addEventListener('statechange', stateChangeHandler)

          const inputPorts: MIDIInput[] = []

          midiAccess.inputs.forEach((i) => inputPorts.push(i as MIDIInput))

          debug(
            'Available MIDI Input ports:',
            JSON.stringify(inputPorts.map(extractPortProperties), null, 2),
          )
          // debug(
          //   'Available MIDI Input ports:',
          //   JSON.stringify(
          //     [...midiAccess.inputs.values()].map(extractPortProperties),
          //     null,
          //     2,
          //   ),
          // );

          const outputPorts: MIDIOutput[] = []

          midiAccess.outputs.forEach((o) => outputPorts.push(o as MIDIOutput))

          debug(
            'Available MIDI Output ports:',
            JSON.stringify(outputPorts.map(extractPortProperties), null, 2),
          )
          // debug(
          //   'Available MIDI Output ports:',
          //   JSON.stringify(
          //     [...midiAccess.outputs.values()].map(extractPortProperties),
          //     null,
          //     2,
          //   ),
          // );

          input.value = findPort(midiAccess.inputs as MIDIInputMap)
          output.value = findPort(midiAccess.outputs as MIDIOutputMap)

          access.value = 'enabled'
        },
        () => {
          debug('MIDI access request: denied')

          access.value = 'disabled'
        },
      )
    })
    .catch((e) => {
      // Likely caused by 'midi' not being in the PermissionName enumeration
      // or requestMIDIAccess not being a property of navigator:
      // i.e. browser doesn't support web MIDI.
      debug(`MIDI (permissions query/access request) error: ${e.message}`)

      access.value = 'disabled'
    })

  return {
    access: readonly(access),
    connected,
    input: readonly(input),
    output: readonly(output),
  }
}
