<script lang="ts" setup>
defineOptions({ name: 'KeySwitch' });

const { hide = false, revealDelay = 0, ...props } = defineProps<{
  hide?: boolean
  note: string;
  pressed?: boolean;
  revealDelay?: number;
  startColor: string; // random starting border color
}>();
</script>

<template>
  <div class="container">
    <div :class="['fit key-switch', { 'fade-border': !hide, pressed }]"
      :style="{ '--delay': `${Math.floor(500 * Math.random())}ms`, '--start-color': props.startColor }" />
  </div>
</template>

<style lang="scss">
.container {
  --size: 1.5ch;
  grid-area: v-bind('$props.note');
  height: var(--size);
  width: var(--size);
}

@keyframes fade-border {
  from {
    opacity: 0;
    border-color: var(--start-color);
  }

  to {
    opacity: 1;
    border-color: white;
  }
}

.fade-border {
  animation: fade-border var(--duration) ease-in var(--delay) 1 forwards;
}

.key-switch {
  --delay: v-bind(revealDelay)ms;
  --duration: 1000ms;
  border: 1px solid var(--start-color);
  opacity: 0;
  transition: background-color 0.5s ease;

  &.pressed {
    background-color: var(--start-color);
    filter: drop-shadow(0px 0px 4px var(--start-color));
    transition: background-color 0.1s ease;
  }
}
</style>
