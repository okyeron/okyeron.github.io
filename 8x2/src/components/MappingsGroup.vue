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

            <NumberInput
              v-model="meterChannels[i]"
              @resetValue="() => (meterChannels[i] = onDeviceChannels[i])"
              :min="1"
              :max="16"
              :tabindex="i + 1 + countOffset"
              :class="{ 'value-diverged': meterChannels[i] !== onDeviceChannels[i] }"
            />
          </div>

          <label class="compact-label">Ch.</label>
        </div>

        <div style="position: relative">
          <div class="align-start row justify-center input-group">
            <div class="color-padding" />

            <NumberInput
              v-model="meterCCs[i]"
              @resetValue="() => (meterCCs[i] = onDeviceCcs[i])"
              :min="0"
              :max="127"
              :tabindex="i + 1 + meterCCs.length * 2 + countOffset"
              :class="{ 'value-diverged': meterCCs[i] !== onDeviceCcs[i] }"
            />
          </div>

          <label class="compact-label">CC</label>
        </div>

        <Potentiometer :modelValue="potentiometers[i]" :max="127" />

        <div class="meter-number">{{ countOffset + i + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import NumberInput from '@/components/NumberInput.vue';
import Potentiometer from '@/components/Potentiometer.vue';

const props = withDefaults(
  defineProps<{
    ccs: number[];
    channels: number[];
    countOffset?: number;
    onDeviceCcs: readonly number[];
    onDeviceChannels: readonly number[];
    potentiometers: readonly number[];
  }>(),
  { countOffset: 0 }
);

const emit = defineEmits<{
  (e: 'update:ccs', value: number[]): void;
  (e: 'update:channels', value: number[]): void;
}>();

const meterCCs = reactive<number[]>([]);
props.ccs.forEach((cc) => meterCCs.push(cc));

watch(
  () => props.ccs,
  () => meterCCs.splice(0, meterCCs.length, ...props.ccs)
);

watch(meterCCs, (newValue) => {
  emit('update:ccs', newValue);
});

const meterChannels = reactive<number[]>([]);
props.channels.forEach((channel) => meterChannels.push(channel));

watch(
  () => props.channels,
  () => meterChannels.splice(0, meterChannels.length, ...props.channels)
);

watch(meterChannels, (newValue) => {
  emit('update:channels', newValue);
});
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
  user-select: none;
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
  user-select: none;
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

.value-diverged {
  border: 1px dashed white;
}
</style>
