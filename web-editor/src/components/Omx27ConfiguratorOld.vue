<script setup lang="ts">
import KeyBed from 'components/KeyBed.vue';
import PotentiometerRow from 'components/PotentiometerRow.vue';
import type { PotentiometerInfo } from 'src/access/composables/omx-27';
import type { OmxBank } from 'src/access/types';
import { omxBanks } from 'src/access/types';
import { computed, reactive, watch } from 'vue';

const { potentiometers } = defineProps<{
  keys: Record<number, boolean>;
  potentiometers: PotentiometerInfo;
}>();

const bank = defineModel<OmxBank>('bank', { required: true });

const computeOffset = (bank: OmxBank) => (bank - 1) * omxBanks.length;

// const offset = computed(() => computeOffset(bank.value));

const modifiedPotentiometers = reactive<Record<OmxBank, number[]>>({
  1: Array.from({ length: 5 }).fill(0, 0, 5) as number[],
  2: Array.from({ length: 5 }).fill(0, 0, 5) as number[],
  3: Array.from({ length: 5 }).fill(0, 0, 5) as number[],
  4: Array.from({ length: 5 }).fill(0, 0, 5) as number[],
  5: Array.from({ length: 5 }).fill(0, 0, 5) as number[],
});

const modifiedPotentiometersActiveCcs = computed(
  () => modifiedPotentiometers[bank.value],
);

const getCcsForBank = (bank: OmxBank) =>
  potentiometers.ccs.slice(computeOffset(bank), computeOffset(bank) + 5);

const refreshModifiedPotentiometers = () => {
  if (
    modifiedPotentiometers[bank.value].length === 0 ||
    modifiedPotentiometers[bank.value].every((val) => val === 0)
  ) {
    modifiedPotentiometers[bank.value] = getCcsForBank(bank.value);
  }
};

const resetModifiedPotentiometers = () => {
  modifiedPotentiometers[bank.value] = getCcsForBank(bank.value);
};

watch(() => potentiometers.ccs, refreshModifiedPotentiometers);

watch(bank, refreshModifiedPotentiometers);

const resetCc = (index: number) => {
  const ccsForBank = getCcsForBank(bank.value)[index];

  if (ccsForBank) {
    modifiedPotentiometers[bank.value][index] = ccsForBank;
  }
};

const updateCcs = (activeCcsWindow: number[]) => {
  modifiedPotentiometers[bank.value] = activeCcsWindow;
};
</script>

<template>
  <div
    class="column configurator-container justify-center q-col-gutter-sm q-pa-sm q-pt-xl relative-position rounded-borders">
    <!-- <div
      class="absolute-full glow-accent rounded-borders"
      style="border: 1px solid var(--q-accent)"
    /> -->

    <!-- <div class="relative-position self-start">
        <div
          class="absolute-top-left bank-label q-pr-xs rounded-borders text-cyan-12"
        >
          Bank
        </div>

        <q-btn-toggle
          v-model="bank"
          :options="banks"
          :ripple="false"
          color="primary"
          toggle-text-color="cyan-12"
          toggle-color="primary"
          outline
        />
      </div> -->

    <!-- <div class="row items-center justify-center q-col-gutter-sm self-end">
        <div class="text-cyan-12">Bank →</div>

        <q-btn-toggle
          v-model="bank"
          :options="banks"
          :ripple="false"
          color="primary"
          toggle-text-color="cyan-12"
          toggle-color="primary"
          outline
        />
      </div> -->

    <PotentiometerRow v-model:bank="bank" @reset="resetCc" @reset-all="resetModifiedPotentiometers"
      @update-ccs="updateCcs" :modified-potentiometers="modifiedPotentiometersActiveCcs" :potentiometers />

    <KeyBed :keys class="col-auto" />
  </div>
</template>

<style lang="scss">
// .bank-label {
//   background: var(--q-dark-page);
//   transform: translate(25%, 25%);
//   z-index: 1;
// }

.bank-select {
  min-width: 6.5rem;
}

.configurator-container {
  // border: 1px solid var(--q-primary);
  width: min-content;
}

.knob-row {
  display: grid;
  gap: 0.5rem;
  // Unsure why I can't use repeat(13, 1fr) in the middle of the two 1.5frs,
  // but the browser thinks the CSS is invalid?
  // 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr
  grid: '. one . two . three . four . five .' 1fr / 2.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 4fr 1fr 2.5fr;
}
</style>
