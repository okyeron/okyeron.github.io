<script setup lang="ts">
import { usePageTitle } from 'composables';
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue';
import Configurator from 'components/8x2/Configurator.vue';
import ConfiguratorLayout from 'components/8x2/ConfiguratorLayout.vue';
import LoadingEllipsis from 'components/LoadingEllipsis.vue';
import { useHachiNi } from 'access/composables';
import { Banks, MappingSchema } from 'access/types';
import type { Bank, Interface, Mappings } from 'access/types';
import ModalOverlay from 'components/8x2/ModalOverlay.vue';

usePageTitle('hachi-ni');

onMounted(() => {
  document.documentElement.style.setProperty('--background-color', '#222222');
})

const midiInterface = ref<Interface>('usb');

const { access, connecting, connected, mappings, bank, info, potentiometers, saveConfig } = useHachiNi();

const editorMappings = reactive<Mappings>({});

const ccs = computed({
  get() {
    return editorMappings?.[bank.value]?.[midiInterface.value]?.ccs ?? [];
  },
  set(value) {
    const mapping = editorMappings[bank.value];

    if (mapping) {
      mapping[midiInterface.value].ccs = value;
    }
  },
});

const channels = computed({
  get() {
    return editorMappings?.[bank.value]?.[midiInterface.value]?.channels ?? [];
  },
  set(value) {
    const mapping = editorMappings[bank.value];

    if (mapping) {
      mapping[midiInterface.value].channels = value;
    }
  },
});

const overwriteEditorMappings = (newMappings: Mappings) => {
  Banks.forEach((bank) => {
    const mapping = newMappings[bank];

    if (mapping) {
      // Clone without copying object references.
      editorMappings[bank] = JSON.parse(JSON.stringify(mapping));
    }
  });
};

const configDiverged = computed(
  () =>
    JSON.stringify(mappings[bank.value]?.['usb']) !== JSON.stringify(editorMappings[bank.value]?.['usb']) ||
    JSON.stringify(mappings[bank.value]?.['trs']) !== JSON.stringify(editorMappings[bank.value]?.['trs'])
);

watch(mappings, () => overwriteEditorMappings(mappings), {
  immediate: true,
});

const onCopyBetweenInterfaces = () => {
  const bankMappings = editorMappings[bank.value];

  if (bankMappings) {
    const destinationInterface: Interface = midiInterface.value === 'trs' ? 'usb' : 'trs';

    bankMappings[destinationInterface].ccs = [...bankMappings[midiInterface.value].ccs];
    bankMappings[destinationInterface].channels = [...bankMappings[midiInterface.value].channels];
  }
};

const onExportConfig = () => {
  const editorMapping = editorMappings[bank.value];

  if (editorMapping) {
    const data = JSON.stringify(editorMapping);
    const blob = new Blob([data], { type: 'application/octet-stream' });

    const link = document.createElement('a');

    link.style.position = 'fixed';
    link.style.visibility = 'hidden';
    link.setAttribute('download', 'hachi-ni-config.json');
    link.href = window.URL.createObjectURL(blob);

    if (typeof link.download === 'undefined') {
      link.setAttribute('target', '_blank');
    }

    document.body.appendChild(link);

    try {
      link.click();
    } finally {
      setTimeout(() => {
        window.URL.revokeObjectURL(link.href);
      }, 10000);

      link.remove();
    }
  }
};

const onLoadConfig = async (file: File) => {
  const unvalidatedConfig = await file.text().then(JSON.parse);

  const parseResult = MappingSchema.safeParse(unvalidatedConfig);

  if (parseResult.success) {
    const bankToOverwrite = parseResult.data.bank ?? bank.value;
    const needToSwitch = bankToOverwrite !== bank.value;

    let bankSwitched: (value?: unknown) => void | undefined;

    const awaitBankSwitch = needToSwitch ? new Promise((resolve) => (bankSwitched = resolve)) : Promise.resolve();

    if (needToSwitch) {
      const unwatch = watchEffect(() => {
        if (bankToOverwrite === bank.value) {
          unwatch();

          bankSwitched?.();
        }
      });

      bank.value = bankToOverwrite as Bank;
    }

    return awaitBankSwitch.then(() => overwriteEditorMappings({ [bankToOverwrite]: parseResult.data }));
  } else {
    // TODO: Some sort of notification
    console.error('Invalid config file');
  }
};

const onResetConfig = () => {
  const editorMapping = editorMappings[bank.value];
  const onDeviceInterfaceConfig = mappings?.[bank.value]?.[midiInterface.value];

  if (editorMapping && onDeviceInterfaceConfig) {
    const newMapping: typeof editorMapping = JSON.parse(JSON.stringify(editorMapping));

    newMapping[midiInterface.value] = JSON.parse(JSON.stringify(onDeviceInterfaceConfig));

    overwriteEditorMappings({ [bank.value]: newMapping });
  }
};

const onSaveConfig = () => {
  const mapping = editorMappings[bank.value];

  if (mapping) {
    saveConfig(bank.value, mapping);
  }
};
</script>

<template>
  <q-page id="hachi-ni-page" class="column justify-center">
    <div class=" row fit items-center justify-evenly">
      <div v-if="access === 'disabled'">Web MIDI not supported or access denied</div>

      <div v-else-if="access === 'requesting'">Requesting MIDI access</div>

      <div v-else-if="access === 'enabled' && connecting">Connecting to Hachi Ni
        <LoadingEllipsis />
      </div>

      <div v-else-if="!connected">No device detected. Did you turn it on?</div>

      <ConfiguratorLayout v-else-if="connected && !connecting">
        <template #configurator>
          <Configurator v-model:bank="bank" v-model:ccs="ccs" v-model:channels="channels"
            v-model:interface="midiInterface" :disable-save="!configDiverged" :info="info"
            :on-device-ccs="mappings[bank]?.[midiInterface].ccs ?? []"
            :on-device-channels="mappings[bank]?.[midiInterface].channels ?? []" :potentiometers="potentiometers"
            @copy-between-interfaces="onCopyBetweenInterfaces" @export-config="onExportConfig"
            @load-config="onLoadConfig" @reset-config="onResetConfig" @save-config="onSaveConfig" />
        </template>
      </ConfiguratorLayout>

      <ModalOverlay />
    </div>
  </q-page>
</template>

<style lang="scss">
#hachi-ni-page {
  --border-color: rgba(255, 255, 255, 0.3);
  --highlight-color: rgba(127, 127, 127);
  --text-color: #fefefe;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  align-items: stretch;
  background-color: var(--background-color);
  color-scheme: dark;
  color: rgba(255, 255, 255, 0.87);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-synthesis: none;
  font-weight: 400;
  height: 100%;
  height: 100%;
  justify-content: center;
  line-height: 1.5;
  margin: 0;
  text-rendering: optimizeLegibility;

  button,
  input,
  optgroup,
  select,
  textarea {
    font: initial;
    font-family: inherit;
  }

  input {
    font-size: 10pt;
  }
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

#app {
  background: var(--background-color);
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 2em;
  text-align: center;
}

button {
  --padding: 1ch;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  color: var(--text-color);
  border-radius: 1ch;
  background-color: var(--background-color);
  border: 1px dashed var(--border-color);
  padding: var(--padding);
  margin: 0;
  transition: background-color, color, border-color, 0.125s;
  user-select: none;
}

button:hover {
  background-color: var(--highlight-color);
  color: var(--background-color);
  border-color: var(--background-color);
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

button:disabled {
  cursor: not-allowed;
  color: var(--border-color);
}

button:disabled:hover {
  background-color: var(--background-color);
  border-color: var(--border-color);
  color: var(--border-color);
}

input {
  border: 1px solid var(--border-color);
  border-radius: 2px;
}

.column {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  flex-wrap: nowrap;
}

.align-center {
  align-items: center;
}

.align-start {
  align-items: flex-start;
}

.align-self-start {
  align-self: flex-start;
}

.align-end {
  align-items: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: end;
}

.absolute-position {
  position: absolute;
}

.bottom-left {
  bottom: 0;
  left: 0;
}

.relative-position {
  position: relative;
}

particle {
  --character: '八';
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
}

particle.ni {
  --character: '二';
}

particle::before {
  content: var(--character);
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  color: white;
}

@media screen and (max-width: 680px) {
  #app {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
