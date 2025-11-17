<script setup lang="ts">
import { usePageTitle } from 'composables';
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import Configurator from 'components/8x2/Configurator.vue';
import ConfiguratorLayout from 'components/8x2/ConfiguratorLayout.vue';
import LoadingEllipsis from 'components/8x2/LoadingEllipsis.vue';
import { useHachiNi } from 'access/composables';
import { Banks, MappingSchema } from 'access/types';
import type { Bank, Interface, Mappings } from 'access/types';
import ModalOverlay from 'components/8x2/ModalOverlay.vue';

usePageTitle('hachi-ni');

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

<style lang="scss" scoped>
#hachi-ni-page {
  align-items: center;
  display: flex;
  flex-direction: column;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  height: 100%;
  justify-content: center;
  padding: 2em;
  text-align: center;

  :deep(a) {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
  }

  :deep(a:hover) {
    color: #535bf2;
  }

  :deep(h1) {
    font-size: 3.2em;
    line-height: 1.1;
  }

  :deep(button) {
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

  :deep(button:hover) {
    background-color: var(--highlight-color);
    color: var(--background-color);
    border-color: var(--background-color);
  }

  :deep(button:focus,
    button:focus-visible) {
    outline: 4px auto -webkit-focus-ring-color;
  }

  :deep(button:disabled) {
    cursor: not-allowed;
    color: var(--border-color);
  }

  :deep(button:disabled:hover) {
    background-color: var(--background-color);
    border-color: var(--border-color);
    color: var(--border-color);
  }

  :deep(input) {
    border: 1px solid var(--border-color);
    border-radius: 2px;
  }

  :deep(.column) {
    display: flex;
    flex-direction: column;
  }

  :deep(.row) {
    display: flex;
  }

  :deep(.align-center) {
    align-items: center;
  }

  :deep(.align-start) {
    align-items: flex-start;
  }

  :deep(.align-self-start) {
    align-self: flex-start;
  }

  :deep(.align-end) {
    align-items: flex-end;
  }

  :deep(.justify-center) {
    justify-content: center;
  }

  :deep(.justify-between) {
    justify-content: space-between;
  }

  :deep(.justify-end) {
    justify-content: end;
  }

  :deep(.absolute-position) {
    position: absolute;
  }

  :deep(.bottom-left) {
    bottom: 0;
    left: 0;
  }

  :deep(.relative-position) {
    position: relative;
  }

  :deep(.visibility-hidden) {
    visibility: hidden;
  }

  :deep(particle) {
    --character: '八';
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    top: 0;
  }

  :deep(particle.ni) {
    --character: '二';
  }

  :deep(particle::before) {
    content: var(--character);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
  }

  @media screen and (max-width: 680px) {
    #hachi-ni-page {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
}
</style>
