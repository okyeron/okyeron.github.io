<script lang="ts" setup>
import KeySwitch from 'components/KeySwitch.vue';
import { keyStatesRange } from 'src/access/composables/omx-27';

defineOptions({
  name: 'KeyBed',
});

defineProps<{ keys: Record<number, boolean> }>();

const topRowKeys = ['C0', 'D0', 'F0', 'G0', 'A0', 'C1', 'D1', 'F1', 'G1', 'A1'];

const topRowKeyMappings = [
  // 61, 63,
  //   //
  //   66, 68, 70,
  //   //
  //   73, 75,
  //   //
  //   78, 80, 82,

  2, 4,
  //
  7, 9, 11,
  //
  14, 16,
  //
  19, 21, 23,
].map((offset) => keyStatesRange.start + offset);

const bottomRowKeys = [
  'B0',
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

const bottomRowKeyMappings = [
  // 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84,
  0, 1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25,
].map((offset) => keyStatesRange.start + offset);
</script>

<template>
  <section class="key-bed column items-center justify-center">
    <div class="full-width top-row">
      <KeySwitch v-for="(k, i) in topRowKeys" :note="k" :key="k" :pressed="keys[topRowKeyMappings[i] ?? 0] ?? false"
        disable class="glow-secondary q-ma-sm" />
    </div>

    <div class="bottom-row items-center justify-center no-wrap row">
      <KeySwitch v-for="(k, i) in bottomRowKeys" :note="k" :key="k"
        :pressed="keys[bottomRowKeyMappings[i] ?? 0] ?? false" disable class="glow-secondary q-ma-sm" />
    </div>
  </section>
</template>

<style lang="scss">
.key-bed {
  width: min-content;

  .top-row {
    display: grid;
    // Unsure why I can't use repeat(13, 1fr) in the middle of the two 1.5frs,
    // but the browser thinks the CSS is invalid?
    grid: '. C0 D0 . F0 G0 A0 . C1 D1 . F1 G1 A1 .' 1fr / 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
  }
}
</style>
