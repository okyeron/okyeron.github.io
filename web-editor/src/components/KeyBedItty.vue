<script lang="ts" setup>
import KeySwitchBitty from 'components/KeySwitchBitty.vue';
import { keyStatesRange } from 'src/access/composables/omx-27';

const { revealContent = true } = defineProps<{ keys: Record<number, boolean>; revealContent?: boolean }>();

const topRowKeys = ['C0', 'D0', 'F0', 'G0', 'A0', 'C1', 'D1', 'F1', 'G1', 'A1'];

const topRowKeyMappings = [
  2, 4,
  //
  7, 9, 11,
  //
  14, 16,
  //
  19, 21, 23,
].map((offset) => keyStatesRange.start + offset);

const bottomRowKeys = [
  'Bminus1',
  'C0',
  'D0',
  'E0',
  'F0',
  'G0',
  'A1',
  'B1',
  'C1',
  'D1',
  'E1',
  'F1',
  'G1',
  'A2',
  'B2',
  'C2',
];

const rainbowColors = ["#ff7db5", "#ffb37d", "#fff67d", "#7DFF9D", '#7DC4FF', '#cd7dff'] as const;

const randomColor = () => {
  const index = Math.ceil(rainbowColors.length * Math.random()) - 1

  return rainbowColors[index] ?? 'white';
}

const bottomRowKeyMappings = [
  0, 1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25,
].map((offset) => keyStatesRange.start + offset);
</script>

<template>
  <section :class="['row justify-center', { cloaked: !revealContent }]">
    <div class="col-auto key-bed column items-center justify-center q-gutter-y-xs">
      <div class="full-width top-row">
        <KeySwitchBitty v-for="(k, i) in topRowKeys" :hide="!revealContent" :key="k" :note="k"
          :pressed="keys[topRowKeyMappings[i] ?? 0] ?? false" :reveal-delay="Math.floor(500 * Math.random())"
          :startColor="randomColor()" class="glow-secondary q-mx-xs"
          :style="`--delay: ${Math.floor(500 * Math.random())}ms`" />
      </div>

      <div class="bottom-row full-width">
        <KeySwitchBitty v-for="(k, i) in bottomRowKeys" :hide="!revealContent" :key="k" :note="k"
          :pressed="keys[bottomRowKeyMappings[i] ?? 0] ?? false" :reveal-delay="Math.floor(500 * Math.random())"
          :startColor="randomColor()" class="glow-secondary q-mx-xs"
          :style="`--delay: ${Math.floor(500 * Math.random())}ms`" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@keyframes fade {
  from {
    border-color: var(--color);
    opacity: 0;

  }

  to {
    border-color: white;
    opacity: 1;
  }
}


.cloaked {
  opacity: 0;
}

.fade {
  transition: opacity 0.67s ease;
}

.fade {
  --delay: 0ms;
  --duration: 1000ms;
  animation: fade var(--duration) ease-in var(--delay) 1 forwards;
  opacity: 0;
}

.key-bed {
  width: min-content;

  .bottom-row {
    display: grid;
    grid-template-areas:
      "Bminus1 C0 D0 E0 F0 G0 A1 B1 C1 D1 E1 F1 G1 A2 B2 C2";

    grid-template-rows: 1fr;
    grid-template-columns: repeat(16, 1fr);
  }

  .top-row {
    display: grid;
    // Unsure why I can't use repeat(13, 1fr) in the middle of the two 1.5frs,
    // but the browser thinks the CSS is invalid?
    grid: '. C0 D0 . F0 G0 A0 . C1 D1 . F1 G1 A1 .' 1fr / 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
  }
}
</style>
