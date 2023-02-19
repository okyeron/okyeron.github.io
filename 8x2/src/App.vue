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
      :potentiometers="potentiometers"
      @load-config="onLoadConfig"
      @save-config="saveConfig(mappings)"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import Configurator from '@/components/Configurator.vue';
import LoadingEllipsis from '@/components/LoadingEllipsis.vue';
import { useHachiNi } from '@/access/composables';
import { Banks, Interface, Mapping, Mappings } from '@/access/types';

const midiInterface = ref<Interface>('usb');

const { access, connecting, connected, mappings, bank, info, potentiometers, saveConfig } = useHachiNi();

const editorMappings = reactive<Mappings>({});

watch(
  mappings,
  () =>
    Banks.forEach((bank) => {
      if (mappings[bank]) {
        // Clone without copying object references.
        editorMappings[bank] = JSON.parse(JSON.stringify(mappings[bank]));
      }
    }),
  {
    immediate: true,
  }
);

const ccs = computed({
  get() {
    return mappings?.[bank.value]?.[midiInterface.value]?.ccs ?? [];
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
    return mappings?.[bank.value]?.[midiInterface.value]?.channels ?? [];
  },
  set(value) {
    const mapping = editorMappings[bank.value];

    if (mapping) {
      mapping[midiInterface.value].channels = value;
    }
  },
});

const onLoadConfig = (config: Mapping) => {
  console.log('loaded config:', config);
};
</script>

<style></style>
