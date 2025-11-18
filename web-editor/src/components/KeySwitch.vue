<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({
  name: 'KeySwitch',
});

const props = withDefaults(
  defineProps<{
    color?: string;
    disable?: boolean;
    note: string;
    pressed?: boolean;
  }>(),
  {
    color: 'secondary',
    disable: false,
    pressed: false,
  },
);

const borderColor = computed(() => `var(--q-${props.color})`);
</script>

<template>
  <div class="container">
    <q-btn v-ripple="{ color }" :disable="disable" :style="{ border: `1px solid ${borderColor}` }" square :class="[
      'fit key-switch rounded-borders',
      { 'bg-primary': pressed, pressed },
    ]" />
  </div>
</template>

<style lang="scss" scoped>
.container {
  --size: 5ch;
  grid-area: v-bind('$props.note');
  height: var(--size);
  width: var(--size);
}

.key-switch {
  transition: 0.2s ease background;
}
</style>
