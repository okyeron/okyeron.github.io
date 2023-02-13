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
      @save-config="saveConfig(mappings)"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Configurator from '@/components/Configurator.vue';
import LoadingEllipsis from '@/components/LoadingEllipsis.vue';
import { useHachiNi } from '@/access/composables';
import { Interface } from '@/access/types';

const midiInterface = ref<Interface>('usb');

const { access, connecting, connected, mappings, bank, info, potentiometers, saveConfig } = useHachiNi();

const ccs = computed({
  get() {
    return mappings?.[bank.value]?.[midiInterface.value]?.ccs ?? [];
  },
  set(value) {
    console.debug('received ccs update:');
    console.debug(value);
  },
});

const channels = computed({
  get() {
    return mappings?.[bank.value]?.[midiInterface.value]?.channels ?? [];
  },
  set(value) {
    console.debug('received channels update:');
    console.debug(value);
  },
});
</script>

<style></style>
