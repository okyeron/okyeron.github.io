<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const { active, color, duration = 700 } = defineProps<{
  active?: boolean
  color?: string
  duration?: number | undefined
}>()

const emit = defineEmits<{
  (e: 'after-enter'): void
}>()

const showBorder = ref(false)

watchEffect(() => {
  if (active) {
    showBorder.value = true;
  }
})
</script>

<template>
  <div class="border-reveal-container column relative-position">
    <slot />

    <div class="absolute-right full-height column">
      <transition :duration="duration" @after-enter="emit('after-enter')" appear name="reveal">
        <div v-if="showBorder" class="border-to-reveal" :style="{ '--duration': `${duration}ms` }" />
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.border-reveal-container {
  :deep(.dimmed.spacer:after) {
    transition: background 0.5s ease;
  }

  &:hover {
    :deep(.dimmed.spacer:after) {
      background: unset !important;
      transition: background 0.15s ease;
    }
  }
}

.border-to-reveal {
  background: v-bind(color);
  border-radius: unset;
  bottom: 0;
  filter: drop-shadow(0px 0px 4px v-bind(color)) drop-shadow(0px 0px 4px v-bind(color));
  position: absolute;
  right: 0;
  top: 0.25em;
  width: 1px;
  z-index: 3;
}

.reveal-enter-active {
  transition: max-height var(--duration, 1000ms) ease-in;
  overflow: hidden;
}

.border-to-reveal.reveal-enter-to {
  max-height: 100%;
}

.border-to-reveal.reveal-enter-from {
  max-height: 0;
}
</style>
