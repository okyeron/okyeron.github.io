<script lang="ts" setup>
import DescriptionCell from 'components/DescriptionCell.vue';
import DescriptionRow from 'components/DescriptionRow.vue';
import DescriptionRowHeader from 'components/DescriptionRowHeader.vue';
import StripedSpacer from 'components/StripedSpacer.vue';
import BorderRevealContainer from 'components/BorderRevealContainer.vue';
import type { OmxState } from 'src/access/composables';
import type { OmxBank } from 'src/access/types';
import { omxBanks } from 'src/access/types';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { entranceAnimationsForSectionBorders } from 'src/utils';
import { QBtnToggle } from 'quasar';
import { matUndo } from '@quasar/extras/material-icons'

export type PotConfigurationProps = {
  animateBorder?: boolean;
  potentiometers: OmxState['potentiometers'];
};

const { animateBorder = true, potentiometers } = defineProps<PotConfigurationProps>();

const emit = defineEmits<{
  (e: 'save-ccs', payload: { bank: OmxBank, ccs: number[] }): void
  (e: 'after-enter'): void
  (e: 'reset', index: number): void
  (e: 'reset-all'): void
}>();

const colors = ['white', 'white', 'white', 'white', 'white'] as const;
const rainbowColors = ["#ff7db5", "#ffb37d", "#fff67d", "#7DFF9D", '#7DC4FF'] as const;

const bank = defineModel<OmxBank>('bank', { required: true });

const computeOffset = (bank: OmxBank) => (bank - 1) * omxBanks.length;

const getCcsForBank = (bank: OmxBank) => (potentiometers.ccs.slice(computeOffset(bank), computeOffset(bank) + 5));

const modifiedCcs = reactive<Record<OmxBank, number[]>>({
  1: getCcsForBank(1),
  2: getCcsForBank(2),
  3: getCcsForBank(3),
  4: getCcsForBank(4),
  5: getCcsForBank(5),
});

const refreshModifiedPotentiometers = () => {
  if (
    modifiedCcs[bank.value].length === 0 ||
    modifiedCcs[bank.value].every((val) => val === 0)
  ) {
    modifiedCcs[bank.value] = getCcsForBank(bank.value);
  }
};

const resetModifiedPotentiometers = () => {
  modifiedCcs[bank.value] = getCcsForBank(bank.value);
};

watch([bank, () => potentiometers.ccs], refreshModifiedPotentiometers);

// watch(bank, refreshModifiedPotentiometers);

const activeCcs = computed(() => modifiedCcs[bank.value]);

const updateCc = (index: number, newValue: string | number | null) => {
  if (newValue == null) {
    return;
  }

  const parsed = typeof newValue === 'string' ? parseInt(newValue, 10) : newValue;

  if (Number.isNaN(parsed)) {
    return;
  }

  modifiedCcs[bank.value][index] = Math.min(127, Math.max(0, parsed));
}

const resetCc = (i: number) => {
  updateCc(i, getCcsForBank(bank.value)[i] ?? 0);
}

const showChangesButtonContainer = ref(false);

const showSaveButton = ref(false);
const showDiscardButton = ref(false);


const ccModified = computed(() => (
  activeCcs.value.map((cc, i) => cc !== potentiometers.activeCcs[i])));

watch(() => ccModified.value, () => {
  const shouldShow = ccModified.value.some(Boolean);

  if (shouldShow) {
    showChangesButtonContainer.value = true;
  } else {
    showSaveButton.value = false;
  }
}, {
  deep: true
});

const banks = computed(() =>
  [1, 2, 3, 4, 5].map((n) => ({
    attrs: {
      'aria-label': `select bank ${n}`,
    },
    class: 'relative-position',
    label: `${n}`,
    value: n,
  })),
);

const potInfo = computed(() => {
  return potentiometers.values.map((value, i) => ({
    cc: modifiedCcs[bank.value][i] ?? 0,
    value: value ?? 0,
  }));
});

const potValueStyle = (value: number) => {
  const percentage = value / 127;

  return {
    'clip-path': `rect(auto auto auto ${Number(percentage * 100).toFixed(2)}%)`,
  };
};

const showSpacer = ref(false);

const showPots = ref([false, false, false, false, false]);
const showInputs = ref([false, false, false, false, false]);

onMounted(() => {
  setTimeout(() => (showSpacer.value = true), 300);

  let i = 0;

  const stopPotsInterval = setInterval(() => {
    if (i === showPots.value.length) {
      clearInterval(stopPotsInterval);
    }

    showPots.value[i++] = true;
  }, 100);

  let j = 0;

  const stopInputsInterval = setInterval(() => {
    if (j === showInputs.value.length) {
      clearInterval(stopInputsInterval);
    }

    showInputs.value[j++] = true;
  }, 100);
});
</script>

<template>
  <BorderRevealContainer @after-enter="emit('after-enter')" :active="animateBorder"
    :duration="entranceAnimationsForSectionBorders[4]" color="white">
    <section class="column q-gutter-y-sm">
      <DescriptionRow color="white" class="potentiometers-row">
        <template #header>
          <DescriptionRowHeader :show-spacer="showSpacer">Potentiometers</DescriptionRowHeader>

          <div class="col q-mb-sm row">
            <div class="col-auto row">
              <div class="bg-white col-auto items-center row">
                <div class="q-px-sm text-black text-uppercase">Bank</div>
              </div>

              <DescriptionRow class="bank-toggles-container col-auto self-stretch">
                <DescriptionCell name="Bank" value="" class="col-auto">
                  <template #name>
                    <q-btn-toggle v-model="bank" ref="bankToggles" :options="banks" :ripple="false" color="white"
                      toggle-text-color="black" dense flat no-caps class="bank-toggles bg-black" />
                  </template>

                  <template #value>
                    <div />
                  </template>
                </DescriptionCell>
              </DescriptionRow>
            </div>

            <div class="col items-center row">
              <div class="col full-height relative-position">
                <StripedSpacer shadowed class="dimmed full-height" />

                <div class="absolute-full overflow-hidden">
                  <transition @after-enter="showSaveButton = true" appear name="reveal-discard-button-container">
                    <div v-if="showChangesButtonContainer" class="bank-buttons-container items-stretch fit row">
                      <div class="col-6 save-button-container justify-center row">
                        <transition @after-enter="showDiscardButton = true" @after-leave="showDiscardButton = false"
                          enter-active-class="animated faster slideInUp"
                          leave-active-class="animated faster slideOutDown">
                          <q-btn v-if="showSaveButton" @click="emit('save-ccs', { bank, ccs: modifiedCcs[bank] })"
                            :ripple="false" color="white" label="save" text-color="black" dense />
                        </transition>
                      </div>

                      <div class="col-6 discard-button-container justify-center row">
                        <transition @after-leave="showChangesButtonContainer = false"
                          enter-active-class="animated faster slideInUp"
                          leave-active-class="animated faster slideOutDown">
                          <q-btn v-if="showDiscardButton" @click="resetModifiedPotentiometers" :ripple="false"
                            label="discard" dense class="bg-black discard-button" style="border: 1px solid white" />
                        </transition>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </template>

        <DescriptionCell v-for="({ cc, value }, i) in potInfo" :key="i" :name="`Pot ${i + 1}`" :value="value" :class="[
          'col fade potentiometer-cell',
          {
            cloaked: !showPots[i],
            maxed: value === 127,
            'previous-maxed': potInfo[i - 1]?.value === 127,
          },
        ]">
          <template #name>
            <div class="relative-position">
              <q-input :id="`cc-input-${i}`" label="CC" type="number" dense stack-label :model-value="cc" :max="127"
                :min="0" @update:model-value="val => updateCc(i, val)" :class="[
                  'cc-input q-px-xs',
                  {
                    'modified': ccModified[i],
                    'one-digit': cc < 10,
                    'two-digits': cc >= 10 && cc < 100,
                    'three-digits': cc >= 100,
                  },
                ]" />


              <transition enter-active-class="animated rotateIn" leave-active-class="animated zoomOut">
                <div v-if="ccModified[i]" class="discard-individual-cc-button">
                  <q-btn @click="() => resetCc(i)" color="black" :icon="matUndo" size="xs" dense flat round
                    class="q-px-xs q-py-none">
                    <q-tooltip anchor="top middle" self="bottom middle">Discard</q-tooltip>
                  </q-btn>
                </div>
              </transition>
            </div>
          </template>

          <template #value>
            <div class="relative-position" style="height: 1.5em">
              <transition leave-active-class="animated fadeOut" :style="{ animationDelay: `${200 + i * 50}ms` }">
                <div v-if="!showInputs[i]" class="absolute-full">
                  <StripedSpacer :color="rainbowColors[i] ?? ''" class="fit" />
                </div>
              </transition>

              <transition appear enter-active-class="animated slideInDown fast">
                <div v-show="showInputs[i]" class="absolute-full" :style="{ animationDelay: `${200 + i * 50}ms` }">
                  <div class="fit relative-position" style="border-top: 1px solid white">
                    <div :class="['fit text-black', { 'pot-maxed': value === 127 }]"
                      :style="{ backgroundColor: 'white', '--color': colors[i], }">
                      {{ value }}

                      <div class="absolute-right maxed-indicator" />
                    </div>

                    <div class="absolute-full bg-black fit text-white" :style="potValueStyle(value)">
                      {{ value }}
                    </div>

                    <!-- midpoint tick mark -->
                    <div class="absolute-full fit row items-end justify-center">
                      <div
                        :style="{ borderLeft: '1px solid white', borderColor: value < 65 ? 'white' : 'black', height: '2px' }" />
                    </div>

                    <div class="absolute-full fit no-pointer-events"
                      style=" background: linear-gradient(0deg, #ffffff00 69%, #0000006b 92%), linear-gradient(0deg, #ffffff00 97%, #000000ff 100%)" />
                  </div>
                </div>
              </transition>
            </div>
          </template>
        </DescriptionCell>
      </DescriptionRow>
    </section>
  </BorderRevealContainer>
</template>

<style lang="scss" scoped>
.maxed-indicator {
  border-right: 1px solid red;
  height: 100%;
}

.pot-maxed {
  animation: pot-maxed 0.5s ease-out;
}

@keyframes pot-maxed {
  0% {
    background-color: #ff4343;
    transform: translateY(0px);
    z-index: 5;
  }

  10% {
    transform: translateY(-1.5px);
  }

  15% {
    transform: translateY(0px);
  }

  20% {
    transform: translateY(1px);
  }

  22% {
    transform: translateY(-0.5px);
  }

  24% {
    transform: translateY(0.5px);
  }

  25% {
    transform: translateY(0px);
  }

  100% {
    background-color: var(--color);
  }
}

.bank-buttons-container {
  :deep(.q-btn) {
    border-radius: unset;
    font-size: 0.75em;
    font-weight: bold;
    height: 100%;
    min-height: unset;
    transition: height 0.15s ease;

    // &:focus,
    // &:hover {
    // }
  }

  .save-button-container {
    filter: drop-shadow(0px 0px 2.5px white);
  }


  .copy-button {
    width: 8ch;
  }
}

.bank-toggles {
  border-top: 1px solid white;

  &-container {
    :deep(:nth-child(1 of .description-cell)) {
      dt {
        border-left: unset;
      }
    }
  }

  :deep(.q-btn[aria-pressed="true"]) {
    background-color: white;
  }

  border-radius: 0;

  &:deep(> .q-btn-item) {
    padding: 0 1ch;

    &:not(:last-child) {
      border-left: 1px solid black;
      border-radius: 0;
    }

    &:not(:first-child) {
      border-radius: 0;
    }
  }
}

.cc-input {
  background: black;
  position: relative;
  width: 8.25ch;
  z-index: 1;

  :deep(.q-field__control::after) {
    display: none;
  }

  :deep(.q-field__control::before) {
    display: none;
  }

  :deep(input.q-field__native) {
    color: white;
    order: 1;
    padding: 0;

    &::-webkit-inner-spin-button,
    ::-webkit-outer-spin-button {
      opacity: 1;
    }
  }

  &::before {
    background: white;
    bottom: 0px;
    content: '';
    left: 0;
    position: absolute;
    top: 0;
    width: 2.5ch;
  }

  &.modified {
    :deep(.q-field__label) {
      opacity: 0;
      transition: opacity 0.25s ease;
    }
  }

  &.one-digit {
    :deep(input.q-field__native) {
      width: 4.15ch;
    }
  }


  &.two-digits {
    :deep(input.q-field__native) {
      width: 4.65ch;
    }
  }


  &.three-digits {
    :deep(input.q-field__native) {
      width: 5.15ch;
    }
  }

  :deep(.q-field__control) {
    align-items: center;
    height: min-content;
  }

  :deep(.q-field__control-container) {
    align-items: center;
    height: 1.5em;
    justify-content: space-between;
  }

  :deep(.q-field__label) {
    align-content: center;
    color: black;
    font-size: 0.75em;
    font-weight: bold;
    height: 100%;
    order: 0;
    position: relative;
    top: unset;
    transform: unset;
    transition: opacity 0.25s ease;
  }
}

.cloaked {
  opacity: 0;
}

.fade {
  transition: opacity 0.67s ease;
}

.potentiometer-cell {
  border-top: 1px solid white;
}

.potentiometers-row {
  :deep(dt) {
    background: unset;
    border-left: 1px solid white;
    border-right: unset;
    z-index: 3;
  }
}

.discard-individual-cc-button {
  position: absolute;
  left: 1px;
  top: -1px;
  z-index: 2;
}

.reveal-discard-button-container-enter-from,
.reveal-discard-button-container-leave-to {
  width: 0;
  margin-left: 0;
}

.reveal-discard-button-container-enter-to,
.reveal-discard-button-container-leave-from {
  width: 4.5ch;
  margin-left: var(--q-gutter-x-xs, 0.5rem);
}

.reveal-discard-button-container-enter-active,
.reveal-discard-button-container-leave-active {
  transition: width 0.15s ease, margin-left 0.15s ease;
}

.discard-button-container {
  filter: drop-shadow(0px 0px 2.5px black);
  overflow: hidden;

  // TODO: Remove once hachi-ni editor integration has CSS fully sorted out
  .discard-button:hover {
    color: white;
  }
}
</style>
