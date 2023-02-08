<template>
  <main>
    <div v-if="!midiSupported">Web MIDI not supported</div>

    <div v-else-if="connecting">Connecting to Hachi Ni <LoadingEllipsis /></div>

    <div v-else-if="!connected">Plug it in</div>

    <Configurator
      v-else-if="connected && !connecting"
      v-model:bank="bank"
      v-model:ccs="ccs"
      v-model:channels="channels"
      v-model:interface="midiInterface"
      :info="info"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Configurator from '@/components/Configurator.vue';
import LoadingEllipsis from '@/components/LoadingEllipsis.vue';
import { useHachiNi } from '@/midi/composables';
import { Interface } from '@/midi/types';

const midiInterface = ref<Interface>('usb');

const { connected, connecting, mappings, bank, info, midiSupported } = useHachiNi();

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
