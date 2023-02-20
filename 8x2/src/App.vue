<template>
  <main>
    <div v-if="access === 'disabled'">Web MIDI not supported or access denied</div>

    <div v-else-if="access === 'requesting'">Requesting MIDI access</div>

    <div v-else-if="access === 'enabled' && connecting">Connecting to Hachi Ni <LoadingEllipsis /></div>

    <div v-else-if="!connected">Plug it in</div>

    <Configurator
      v-else-if="connected && !connecting"
      v-model:bank="bank"
      v-model:ccs="ccs"
      v-model:channels="channels"
      v-model:interface="midiInterface"
      :info="info"
      :on-device-ccs="mappings[bank]?.[midiInterface].ccs ?? []"
      :on-device-channels="mappings[bank]?.[midiInterface].channels ?? []"
      :potentiometers="potentiometers"
      @load-config="onLoadConfig"
      @reset-config="onResetConfig"
      @save-config="onSaveConfig"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import Configurator from '@/components/Configurator.vue';
import LoadingEllipsis from '@/components/LoadingEllipsis.vue';
import { useHachiNi } from '@/access/composables';
import { Bank, Banks, Interface, Mappings, MappingSchema } from '@/access/types';

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

watch(mappings, () => overwriteEditorMappings(mappings), {
  immediate: true,
});

const onLoadConfig = async (file: File) => {
  const unvalidatedConfig = await file.text().then(JSON.parse);

  const parseResult = MappingSchema.safeParse(unvalidatedConfig);

  if (parseResult.success) {
    const bankToOverwrite = parseResult.data.bank ?? bank.value;
    const needToSwitch = bankToOverwrite !== bank.value;

    let bankSwitched: Function | undefined;

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
  overwriteEditorMappings(mappings);
};

const onSaveConfig = () => {
  const mapping = editorMappings[bank.value];

  if (mapping) {
    saveConfig(bank.value, mapping);
  }
};
</script>

<style></style>
