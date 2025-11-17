<template>
  <fieldset :name="groupName" class="radio-group">
    <label v-for="(knob, i) in options" :key="knob.value" :for="generateInputId(knob.value, i)" :class="labelClass">
      <input v-model="value" :id="generateInputId(knob.value, i)" :value="knob.value" :name="groupName" type="radio"
        :class="inputClass" />
      {{ knob.label }}
    </label>
  </fieldset>
</template>

<script setup lang="ts">
import { useUniqueId } from 'composables';
import { computed } from 'vue';

export type RadioOptionValueType = string | number;

export type RadioGroupOption<T extends RadioOptionValueType> = {
  label?: string;
  caption?: string;
  value: T;
};

export type RadioGroupOptions<T extends RadioOptionValueType> = RadioGroupOption<T>[];

const props = defineProps<{
  inputClass?: string;
  labelClass?: string;
  modelValue: RadioOptionValueType;
  options: readonly RadioGroupOption<RadioOptionValueType>[];
}>();

const emit = defineEmits<{
  (e: 'update:model-value', value: RadioOptionValueType): void;
}>();

const value = computed({
  get() {
    return props.modelValue;
  },

  set(value: RadioOptionValueType) {
    emit('update:model-value', value);
  },
});

const groupName = `radio-group-${useUniqueId()}`;

const generateInputId = (id: RadioOptionValueType, index: number) => {
  return `${groupName}-${id}-${index}`;
};
</script>

<style scoped>
.radio-group {
  border: none;
  margin: 0;
  padding: 0;
}
</style>
