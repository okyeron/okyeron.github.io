<template>
  <div class="row relative-position meters">
    <div class="column dashes-container">
      <div class="dash-container row align-center">
        <div class="dash" />

        <div style="margin-bottom: 1px; height: 0.75rem; opacity: 0.3">➛</div>
      </div>

      <div class="dash-container row align-center">
        <div class="dash" />

        <div style="margin-bottom: 1px; height: 0.75rem; opacity: 0.3">➛</div>
      </div>
    </div>

    <div class="align-start column labels-container">
      <label>Channel</label>

      <label>CC</label>
    </div>

    <div class="meters-container">
      <div v-for="(channel, i) in meterChannels" :key="i" class="column meter-container">
        <div style="position: relative">
          <div class="align-start row justify-center input-group">
            <div class="color-padding" />

            <!-- TODO: This v-model binding to an array member is not working as expected.
              No update event is fired. Needs to be fixed. -->
            <input v-model.number="meterChannels[i]" type="number" min="1" max="16" />
          </div>

          <label class="compact-label">Ch.</label>
        </div>

        <div style="position: relative">
          <div class="align-start row justify-center input-group">
            <div class="color-padding" />

            <!-- TODO: Same as above. -->
            <input v-model.number="meterCCs[i]" type="number" min="0" max="127" />
          </div>

          <label class="compact-label">CC</label>
        </div>

        <!-- <Potentiometer :modelValue="meterValues[i]" :max="127" :time="750" /> -->
        <Potentiometer :modelValue="potentiometers[i]" :max="127" />

        <div class="meter-number">{{ countOffset + i + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue';
import Potentiometer from '@/components/Potentiometer.vue';

const props = withDefaults(
  defineProps<{
    ccs: number[];
    channels: number[];
    countOffset?: number;
    potentiometers: number[];
  }>(),
  { countOffset: 0 }
);

const emit = defineEmits<{
  (e: 'update:ccs', value: number[]): void;
  (e: 'update:channels', value: number[]): void;
}>();

const meterCCs = computed({
  get() {
    return props.ccs;
  },
  set(value) {
    emit('update:ccs', value);
  },
});

const meterChannels = computed({
  get() {
    return props.channels;
  },
  set(value) {
    emit('update:channels', value);
  },
});

const METER_MIN = 0;
const METER_MAX = 127;

// const meterValues = ref<number[]>([]);

// // TODO: Remove all of this placeholder meter animation code once actual
// // values are plumbed in.
// const setMeterValue = (value: number, index: number, meters: Ref<number[]>) => {
//   meters.value[index] = value;
// };

// const randomizeMeterValue = (index: number, meters: Ref<number[]>) => {
//   const delta = METER_MAX - METER_MIN + 1;
//   const value = METER_MIN + Math.floor(Math.random() * delta);

//   setMeterValue(value, index, meters);
// };

// const setRandomMeterValues = () => {
//   for (let i = 0; i < props.channels.length; i++) {
//     randomizeMeterValue(i, meterValues);
//   }
// };

// watch(
//   () => props.channels,
//   () => {
//     if (props.channels.length !== meterValues.value.length) {
//       setRandomMeterValues();
//     }
//   },
//   { immediate: true }
// );

// setInterval(setRandomMeterValues, 1000);
</script>

<style scoped>
.meters-container {
  align-items: end;
  display: flex;
  justify-content: space-around;
  column-gap: 4.25ch;
  row-gap: 2rem;
  flex-wrap: wrap;
}

.meter-container {
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  gap: 1rem;
  padding-left: 1ch;
  padding-bottom: 1ch;
  position: relative;
  border-bottom-left-radius: 3.5ch;
  transition: 0.125s ease border;
}

.meter-container:hover {
  border-color: var(--text-color);
}

.meter-container:hover .meter-number {
  border: 1px solid var(--text-color);
}

.meter-number {
  --dimension: 2ch;
  --padding: 0.25ch;
  width: var(--dimension);
  height: var(--dimension);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  padding: var(--padding);
  border: 1px dashed #666666;
  border-radius: 50%;
  right: calc(-1 * (var(--dimension) + 1px + 2 * var(--padding)));
  bottom: calc(-1 * (var(--padding) * 2 + 2px + var(--dimension)) / 2);
  transition: 0.125s ease border;
}

.input-group input {
  width: 5.3ch;
  z-index: 1;
}

.input-group {
  gap: 1ch;
  position: relative;
}

.input-group .color-padding {
  width: calc(100% + 0.5ch);
  background: var(--background-color);
  height: 100%;
  position: absolute;
  z-index: 0;
}

.dashes-container {
  gap: 1.5rem;
  position: absolute;
  width: calc(100% + 2ch);
  height: calc(3rem + 1ch);
}

.dashes-container .dash-container {
  height: 0.75rem;
  width: calc(100% + 1ch);
}

.dashes-container .dash {
  border-bottom: 1px dashed var(--border-color);
  height: 0.75rem;
  z-index: 0;
  width: 100%;
}

.labels-container {
  gap: 1ch;
  margin-right: 1ch;
  z-index: 1;
  position: relative;
}

.labels-container label {
  z-index: 1;
  position: relative;
  padding: 0 0.5ch 0 0.5ch;
  background: var(--background-color);
}

.compact-label {
  background: var(--background-color);
  display: none;
  position: absolute;
  left: -2.25ch;
  top: -1.25em;
}

@media screen and (max-width: 640px) {
  .dashes-container,
  .labels-container {
    display: none;
  }

  .compact-label {
    display: block;
  }
}
</style>
