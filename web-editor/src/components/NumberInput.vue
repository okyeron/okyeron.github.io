<template>
  <q-input
    v-bind="$attrs"
    :model-value="current"
    @blur="onChange"
    @input="onChange"
    @update:model-value="rawValue = $event?.toString() ?? ''"
    @keydown.capture="onKeyDown"
    type="number"
    :min="min"
    :max="max"
  />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    modified?: boolean;
    min: number;
    max: number;
    resetOnBlur?: boolean;
  }>(),
  { modified: false, resetOnBlur: true },
);

const emit = defineEmits<{
  (e: 'reset-value'): void;
  (e: 'update:modelValue', value: number): void;
}>();

const current = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit('update:modelValue', newValue);
  },
});

const rawValue = ref(props.modelValue.toString());

watch(
  () => props.modelValue,
  () => (rawValue.value = props.modelValue.toString()),
);

const onChange = (e: Event) => {
  if (e.type === 'input' && rawValue.value === '') {
    // No-op. Give user the chance to see the error of their ways.
    return;
  } else if (props.resetOnBlur && e.type === 'blur' && rawValue.value === '') {
    emit('reset-value');
  } else {
    const parsedValue = parseInt(rawValue.value);

    if (isNaN(parsedValue)) {
      // No-op.
    } else if (parsedValue < props.min) {
      current.value = props.min;
    } else if (parsedValue > props.max) {
      current.value = props.max;
    } else {
      current.value = parsedValue;
    }
  }

  /* If the value the input is bound to hasn't changed as a result of this validation logic,
   * then the component won't be re-rendered. This leaves the possibility that the HTML input
   * element's internal value could diverge from the model value.
   *
   * An example:
   *
   * The input has a max value of 16, and the current model value is 16. The user's cursor
   * is in the input after the 6 and hits '2'. Now, the input has a value of 162. This
   * validation logic is triggered, finds that the value is greater than the max, and sets
   * the model value to the max i.e. 16. Effectively, the value hasn't changed, and so the
   * input does not re-render. We could have some counter that gets incremented every time
   * the validation runs, and bind the input's key to the counter. This would force a
   * re-render on validation; however, it is not a great user experience as it would cause
   * the input to lose focus.
   *
   * This is a fix to re-sync the input's value out-of-band of Vue's reactivity system.
   */
  (e.target as HTMLInputElement).value = current.value.toString();
};

const onKeyDown = (e: KeyboardEvent) => {
  // Drop valid number characters that we don't actually want.
  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
    e.preventDefault();
  }
};
</script>

<style lang="scss" scoped>
.modified {
  border: 1px dashed var(--q-primary);
}
</style>
