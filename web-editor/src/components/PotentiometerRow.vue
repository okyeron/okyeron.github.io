<script setup lang="ts">
import NumberInput from 'components/NumberInput.vue';
import PotentiometerKnob from 'components/PotentiometerKnob.vue';
import { QBtnToggle } from 'quasar';
import type { PotentiometerInfo } from 'src/access/composables';
import type { OmxBank } from 'src/access/types';
import { omxBanks } from 'src/access/types';
import { onMounted } from 'vue';
import { watch } from 'vue';
import { computed, ref } from 'vue';

defineOptions({
  name: 'PotentiometerRow',
});

// defineProps<{
//   potentiometers: PotentiometerInfo;
// }>();

const modifiedPotentiometers = defineModel<PotentiometerInfo['ccs']>(
  'modifiedPotentiometers',
  {
    required: true,
  },
);

const potentiometers = defineModel<PotentiometerInfo>('potentiometers', {
  required: true,
});

const emit = defineEmits<{
  reset: [index: number];
  'reset-all': [];
  'update-ccs': [value: number[]];
}>();

const bank = defineModel<OmxBank>('bank', { required: true });

const copying = ref(false);

const banks = computed(() =>
  [1, 2, 3, 4, 5].map((n) => ({
    attrs: {
      'aria-label': copying.value
        ? `copy bank ${bank.value} to bank ${n}`
        : `select bank ${n}`,
    },
    label: `${n}`,
    class: [{ copying: copying.value }, 'relative-position, text-glow'],
    value: n,
    disable: copying.value && bank.value === n,
  })),
);

// const onUpdateCC = () => {};

const bankContainer = ref<HTMLDivElement | null>(null);
const bankToggles = ref<QBtnToggle | null>(null);

const bankContainerWidth = ref(0);
const bankWidth = computed(() => bankContainerWidth.value / 5);

const updateCcs = (index: number, value: number) => {
  const updatedArray = modifiedPotentiometers.value.slice();

  updatedArray.splice(index, 1, value);

  // potentiometers.value.activeCcs = updatedArray;
  emit('update-ccs', updatedArray);
};

onMounted(() => {
  bankContainerWidth.value = bankContainer.value?.clientWidth ?? 0;
});

watch(
  () => bank,
  (newBank, oldBank) => {
    if (copying.value) {
      // TODO: Copy bank value
      console.log(`Copying from bank ${oldBank} to bank ${newBank}`);

      copying.value = false;
    }
  },
);

watch(bank, (newBank, oldBank) => {
  if (copying.value) {
    // TODO: Copy bank value
    console.log(`Copying from bank ${oldBank} to bank ${newBank}`);

    copying.value = false;
  }
});
</script>

<template>
  <!-- <div class="row items-center q-col-gutter-md">
        <template v-for="(potentiometer, i) in potentiometers" :key="i">
          <div>
            <q-knob
              :model-value="potentiometer"
              :angle="240"
              :inner-min="0"
              :inner-max="127"
              :min="0"
              :max="127 + 127 / 2"
              :thickness="0.22"
              font-size="1rem"
              center-color="grey-10"
              color="purple"
              track-color="transparent"
              dense
              instant-feedback
              readonly
              rounded
              show-value
              class="q-ma-md"
            />
          </div>

          <div
            v-if="i === potentiometers.length - 1"
            class="row items-center justify-center q-col-gutter-md"
          >
            <div>
              <PotentiometerKnob :model-value="potentiometer" />
            </div>
          </div>

          <div v-else>
            <PotentiometerKnob :model-value="potentiometer" />
          </div>
        </template>
</div> -->

  <div class="full-width potentiometer-row items-center">
    <!-- <KeySwitch
      color="primary"
      note="esc"
      disable
      class="glow-primary q-ma-sm"
    /> -->

    <div v-for="i in omxBanks.length" :key="i - 1" :style="{
      gridArea: { 0: 'one', 1: 'two', 2: 'three', 3: 'four', 4: 'five' }[
        i - 1
      ],
    }" class="knob-container relative-position">
      <!-- <q-input
        color="primary"
        model-value="694"
        label="CC"
        dense
        stack-label
        class="absolute-bottom-left bg-grey-9 cc-input q-pl-xs rounded-borders"
      /> -->

      <!-- <q-input
        color="primary"
        model-value="127"
        label="Ch."
        dense
        stack-label
        class="absolute-top-right bg-grey-9 ch-input-container q-pl-xs rounded-borders"
      /> -->

      <div class="absolute-top input-container">
        <div class="relative-position">
          <div class="absolute-top column full-width items-center justify-center">
            <!-- <q-input
              :model-value="potentiometers.activeCcs[i - 1]"
              color="primary"
              label=" CC"
              mask="###"
              dense
              stack-label
              class="ch-input rounded-borders"
            /> -->
            <!-- :model-value="potentiometers.activeCcs[i - 1]" -->
            <NumberInput @update:model-value="updateCcs(i - 1, $event)" :max="127" :min="0"
              :model-value="modifiedPotentiometers[i - 1] ?? 0" :modified="modifiedPotentiometers[i - 1] !==
                potentiometers.activeCcs[i - 1]
                " color="primary" label=" CC" mask="###" dense stack-label class="ch-input rounded-borders" />
          </div>

          <div class="absolute-top column full-width items-center justify-center">
            <!-- <q-input
              color="primary"
              model-value="127"
              label=" CC"
              dense
              stack-label
              class="cc-input rounded-borders"
            /> -->
          </div>
        </div>
      </div>

      <div class="absolute absolute-center">
        <PotentiometerKnob :model-value="potentiometers.values[i - 1] ?? 0" />

        <div v-if="
          modifiedPotentiometers[i - 1] !== potentiometers.activeCcs[i - 1]
        " class="full-width col absolute-top row justify-end items-center">
          <q-btn @click="emit('reset', i - 1)" size="xs" dense flat round class="relative-position reset-button">
            <q-icon name="undo" />
          </q-btn>
        </div>
      </div>
    </div>

    <div class="bank non-selectable relative-position">
      <div ref="bankContainer" class="relative-position">
        <!-- @update:model-value="emit('bank-select', $event)" -->
        <!-- :model-value="bank" -->
        <q-btn-toggle v-model="bank" ref="bankToggles" :options="banks" :ripple="false" color="secondary"
          toggle-text-color="primary" toggle-color="primary" no-caps outline class="bank-toggles" />

        <div
          class="absolute-top-left bank-label items-center justify-center no-pointer-events rounded-borders row text-center text-primary text-glow">
          <div class="bank-label-content rounded-borders">bank</div>
        </div>
      </div>

      <div class="absolute-top copy-button-container fit items-center justify-start q-pb-xl row">
        <q-btn @click="copying = !copying" color="primary" size="sm" dense outline class="copy-button">
          {{ copying ? 'Cancel' : 'Copy To..' }}
        </q-btn>
      </div>
    </div>

    <div class="actions column items-end justify-center q-gutter-sm q-mr-sm">
      <div class="row items-center justify-center no-wrap q-gutter-xs">
        <q-btn @click="emit('reset-all')" color="primary" size="sm" dense outline>
          reset
        </q-btn>
      </div>

      <q-btn :disable="true" color="primary" size="sm" dense> save </q-btn>
    </div>

    <!-- <template v-for="(potentiometer, i) in potentiometers" :key="i">
      <div
        :style="{
          gridArea: { 0: 'one', 1: 'two', 2: 'three', 3: 'four', 4: 'five' }[i],
        }"
      >
        <q-knob
          :model-value="potentiometer"
          :angle="240"
          :inner-min="0"
          :inner-max="127"
          :min="0"
          :max="127 + 127 / 2"
          :thickness="0.22"
          font-size="1rem"
          center-color="grey-10"
          color="primary"
          track-color="grey-9"
          dense
          instant-feedback
          readonly
          rounded
          show-value
        />
      </div>
    </template> -->
  </div>
</template>

<style lang="scss">
// @import 'src/css/app.scss';

.actions {
  grid-area: end;
}

.bank {
  grid-area: displayencoder;

  &-label {
    // transform: translate(12.5%, -50%);
    // transform: translate(375%, 50%);
    transform: translate(calc((v-bind(bank) - 1) * 100%), -50%);
    transition: 0.1s ease transform;
    font-weight: initial;
    line-height: initial;
    width: calc(v-bind(bankWidth) * 1px); // min-content;
    z-index: 1;

    &-content {
      text-shadow: none;

      &::before {
        @extend .rounded-borders;

        --height: 0.45rem;
        content: '';
        position: absolute;
        top: calc(50% - var(--height) / 2);
        bottom: 0;
        left: 4px;
        right: 4px;
        height: var(--height);
        background: var(--q-dark-page);
        z-index: -1;
      }
    }

    // &::before {
    //   content: '';
    //   position: absolute;
    //   top: 0;
    //   bottom: 0;
    //   left: 0;
    //   right: 0;
    //   background: purple;
    // }
  }
}

.bank-toggles {
  // button[aria-pressed='true'] {
  //   @extend .glow-secondary;
  // }

  // button[aria-pressed='false'] {
  //   @extend .glow-primary;
  // }

  button:not([disabled]).copying {
    &:hover {
      color: purple;
      background: white;
      padding-bottom: 3px;
      border-bottom: 1px solid $accent;
      // border-top: 1px solid $accent;

      &::before {
        border-bottom: none;
        // border-top: none;
      }

      &::after {
        content: '⬇';
        color: $primary;
        border-bottom: none;
        border-top: none;
        font-size: 1.5em;
        height: min-content;
        left: 0;
        position: absolute;
        right: 0;
        top: calc(-50% + 3px);
        z-index: 1;
      }
    }
  }
}

.copy-button {
  @extend .bg-aero;
  // background: var(--q-dark-page) !important;
  // transform: translate(-25%, 75%);
  // transform-origin: 50% 0%;
  width: 9ch; //  min-content;
  text-wrap: nowrap;

  &-container {
    top: -100%;
  }
}

.input-container {
  --gap: 0.25rem;

  // input {
  //   font-family: monospace;
  // }

  &:has(.q-input.q-field--highlighted) {
    &:after {
      @extend .glow-primary;
      border-color: $primary;
      border-width: 2px;
      transform: translate(calc(-0.2rem),
          calc(0.21rem + var(--additional-length))) rotate(106deg);
      transition: 0.5s ease border-color;
      transition-delay: 0.125s;
    }
  }

  &:has(.q-input:not(.q-field--highlighted):hover) {
    &:after {
      @extend .glow-white;
      border-color: white;
      transition: 0.5s ease border-color;
      transition-delay: 0.125s;
    }
  }

  // .cc-input {
  //   transform: translate(0, calc(-100% - var(--gap)));

  //   // &::before {
  //   //   --height: 0.333rem;
  //   //   --padding: 0.5rem;
  //   //   content: '';
  //   //   border-left: 2px solid $accent;
  //   //   border-right: 2px solid $accent;
  //   //   border-radius: 1px;
  //   //   width: calc(100%);
  //   //   height: var(--height);
  //   //   background: var(--q-dark-page);
  //   //   top: calc(var(--height) + var(--height) / 8 + 50%);
  //   //   left: 0;
  //   //   transform: translateX(calc(-1 * ((var(--padding) / 2) + 1px)));
  //   //   padding: 0 calc(2 * var(--padding));
  //   //   position: absolute;
  //   // }
  // }

  .ch-input {
    transform: translate(calc(-110% - var(--gap)), -125%);
  }
}

.input-container {
  // transform: translate(calc(100% - 4px), -100%); // 4px comes from q-pl-xs

  .q-input {
    // background: $dark-page;

    // TODO: ?
    // border: 1px solid $grey-13;

    width: 4.5ch;

    // &:after {
    //   content: '';
    //   border-top: 1px solid rgba(255, 255, 255, 0.6);
    //   height: 100%;
    //   // bottom: 0;
    //   // left: 0;
    //   position: absolute;
    //   transform: translate(-100%, calc(100% - 1px)) rotate(-45deg);
    //   transform-origin: 100% 0%;
    //   width: 1ch;
    // }

    &.ch-input {
      &.q-field--highlighted:after {
        @extend .glow-primary;
        border-color: $primary;
        border-width: 2px;
        transform: translate(calc(63% - 1px), calc(1rem + 0.5px)) rotate(56deg);
        transition: 0.5s ease border-color;
        transition-delay: 0.125s;
      }

      &:not(.q-field--highlighted):hover {
        &:after {
          @extend .glow-white;
          border-color: white;
          transition: 0.5s ease border-color;
          transition-delay: 0.125s;
        }
      }

      &:after {
        content: '';
        border-top: 1px solid rgba(255, 255, 255, 0.6);
        // height: 100%;
        bottom: 0;
        right: 0;
        // left: 0;
        position: absolute;
        transform: translate(calc(63% - 1px), calc(1rem + 0.5px)) rotate(56deg);
        transform-origin: 100% 0%;
        transition-delay: 0.125s;
        width: 1.25rem;
      }
    }
  }

  // &:after {
  //   --additional-length: 0.125rem;
  //   content: '';
  //   border-top: 1px solid rgba(255, 255, 255, 0.6);
  //   height: 100%;
  //   // bottom: 0;
  //   // left: 0;
  //   position: absolute;
  //   transform: translate(
  //       calc(-0.2rem),
  //       calc(0.21rem + var(--additional-length))
  //     )
  //     rotate(106deg);
  //   transform-origin: 100% 0%;
  //   width: calc(1ch + var(--additional-length));
  // }
}

.knob-container {
  height: 5ch;
  width: 5ch;
}

// .copy-bank-toggle {
//   &-end {
//   }

//   &-segment {
//     border-bottom: 1px solid $accent;
//     border-top: 1px solid $accent;

//     &::before {
//       border-bottom: none;
//       border-top: none;
//     }
//   }
// }

.potentiometer-row {
  display: grid;
  grid: 'esc trs-jacks one . two . three . four displayencoder . five end' 1fr / 1fr 1.875fr 1fr 0.5fr 1fr 0.5fr 1fr 0.625fr 1fr 2.833fr 0.8751fr 1fr 2.542fr;
}

.reset-button {
  transform: translate(calc(-50% - 4px), -1.5rem);
  z-index: 9999;
}
</style>
