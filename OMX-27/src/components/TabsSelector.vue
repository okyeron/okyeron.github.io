<template>
  <div :class="['container', { 'column vertical': vertical, row: !vertical }]">
    <div>{{ label }}</div>

    <fieldset :class="['tab-selector', { 'column vertical': vertical, row: !vertical }]">
      <template v-for="item in options" :key="item">
        <input v-model="value" :id="JSON.stringify(item)" :name="name" :value="item" type="radio" class="radio" />

        <label :for="JSON.stringify(item)" class="tab label">
          {{ item }}
        </label>
      </template>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    shrink?: boolean;
    label: string;
    modelValue: string | number;
    options: readonly (string | number)[];
    padding?: string;
    vertical?: boolean;
  }>(),
  { shrink: false, padding: '2ch', vertical: false }
);

const emit = defineEmits<{
  (e: 'update:model-value', value: string | number): void;
}>();

// Generate unique name for group of inputs to avoid clashing
// with other groups spawned by other TabsSelector instances.
// TODO: Something better than generating a random number.
const name = `${props.label}-${Math.floor(Math.random() * 1000000)}`;

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:model-value', value);
  },
});
</script>

<style scoped>
.tab {
  --horizontal-padding: v-bind(padding);
  align-items: center;
  justify-content: center;
  border-left: 1px dashed var(--border-color);
  display: flex;
  flex-grow: 1;
  font-weight: bold;
  padding: 0 var(--horizontal-padding) 0 var(--horizontal-padding);
  text-transform: uppercase;
  transition: 0.125s ease background;
}

.tab:hover {
  background: #111111;
}

.container.vertical .tab {
  border-top: 1px dashed var(--border-color);
}

.radio:checked + label {
  background-color: var(--highlight-color);
  color: var(--background-color);
}

.tab:first-of-type,
.tab:nth-of-type(2) {
  border-left: none;
}

.tab:first-of-type {
  border-right: 1px dashed var(--border-color);
  border-top-left-radius: calc(1ch - 2px);
}

.tab:last-of-type {
  border-top-right-radius: calc(1ch - 2px);
}

.container.vertical .tab {
  border-left: none;
}

.container.vertical .tab:first-of-type,
.container.vertical .tab:nth-of-type(2) {
  border-top: none;
}

.container.vertical .tab:first-of-type {
  border-right: none;
  border-bottom: 1px dashed var(--border-color);
  border-top-left-radius: 0;
  border-top-right-radius: calc(1ch - 2px);
}

.container.vertical .tab:last-of-type {
  border-top-right-radius: 0;
  border-bottom-right-radius: calc(1ch - 2px);
}

.tab-selector {
  border: 1px dashed var(--border-color);
  border-bottom: none;
  border-top-left-radius: 1ch;
  border-top-right-radius: 1ch;
  flex-grow: v-bind("shrink ? '0' : '1'");
  padding: 0;
  margin: 0;
}

.tab-selector.vertical {
  border-bottom: 1px dashed var(--border-color);
  border-left: none;
  border-top-right-radius: 1ch;
  border-bottom-right-radius: 1ch;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.radio {
  display: none;
}

.label {
  cursor: pointer;
}

.container {
  gap: 1ch;
  user-select: none;
}
</style>
