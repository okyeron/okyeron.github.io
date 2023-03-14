<template>
  <div :class="['container', { 'column vertical': vertical, row: !vertical }]">
    <div>{{ label }}</div>

    <RadioGroup
      v-model="value"
      :options="options"
      :class="['tab-selector', { 'column vertical': vertical, row: !vertical }]"
      input-class="radio"
      label-class="tab label"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import RadioGroup, { RadioGroupOption, RadioOptionValueType } from '@/components/RadioGroup.vue';

const props = withDefaults(
  defineProps<{
    shrink?: boolean;
    label: string;
    modelValue: RadioOptionValueType;
    options: readonly RadioGroupOption<RadioOptionValueType>[];
    padding?: string;
    vertical?: boolean;
  }>(),
  { shrink: false, padding: '2ch', vertical: false }
);

const emit = defineEmits<{
  (e: 'update:model-value', value: string | number): void;
}>();

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
:deep(.tab) {
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

:deep(.tab:hover) {
  background: #111111;
}

.container.vertical :deep(.tab) {
  border-top: 1px dashed var(--border-color);
}

:deep(.tab:has(.radio:checked)) {
  background-color: var(--highlight-color);
  color: var(--background-color);
}

:deep(.tab:first-of-type, .tab:nth-of-type(2)) {
  border-left: none;
}

:deep(.tab:first-of-type) {
  border-right: 1px dashed var(--border-color);
  border-top-left-radius: calc(1ch - 2px);
}

:deep(.tab:last-of-type) {
  border-top-right-radius: calc(1ch - 2px);
}

.container.vertical :deep(.tab) {
  border-left: none;
}

.container.vertical :deep(.tab:first-of-type),
.container.vertical :deep(.tab:nth-of-type(2)) {
  border-top: none;
}

.container.vertical :deep(.tab:first-of-type) {
  border-right: none;
  border-bottom: 1px dashed var(--border-color);
  border-top-left-radius: 0;
  border-top-right-radius: calc(1ch - 2px);
}

.container.vertical :deep(.tab:last-of-type) {
  border-top-right-radius: 0;
  border-bottom-right-radius: calc(1ch - 2px);
}

:deep(.tab-selector) {
  border: 1px dashed var(--border-color);
  border-bottom: none;
  border-top-left-radius: 1ch;
  border-top-right-radius: 1ch;
  flex-grow: v-bind("shrink ? '0' : '1'");
  padding: 0;
  margin: 0;
}

:deep(.tab-selector.vertical) {
  border-bottom: 1px dashed var(--border-color);
  border-left: none;
  border-top-right-radius: 1ch;
  border-bottom-right-radius: 1ch;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

:deep(.radio) {
  display: none;
}

:deep(.label) {
  cursor: pointer;
}

.container {
  gap: 1ch;
  user-select: none;
}
</style>
