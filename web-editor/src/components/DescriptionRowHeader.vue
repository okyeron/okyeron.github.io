<script lang="ts" setup>
import type { StripedSpacerProps } from 'components/StripedSpacer.vue';
import StripedSpacer from 'components/StripedSpacer.vue';

export type DescriptionRowHeaderProps = Pick<StripedSpacerProps, 'color' | 'endCapColor'> & { showSpacer?: boolean; spacerRevealDuration?: number }

const { color = 'white', endCapColor, showSpacer = true, spacerRevealDuration = 500 } = defineProps<DescriptionRowHeaderProps>();
</script>

<template>
  <div class="col-auto items-center row q-gutter-xs">
    <div class="text-bold" :style="{ color: Array.isArray(color) ? color[0]?.color ?? 'white' : color }">
      <slot />
    </div>

    <div class="col">
      <transition appear name="reveal">
        <StripedSpacer v-show="showSpacer" :color :end-cap-color="endCapColor"
          :style="`--spacer-reveal-duration: ${spacerRevealDuration}ms; height:0.75em; transform: translateY(-1px)`" />
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reveal-enter-from,
.reveal-leave-to {
  color: white;
  width: 0;
}

.reveal-enter-to,
.reveal-leave-from {
  width: 100%;
}

.reveal-enter-active,
.reveal-leave-active {
  transition: color 1.5s ease, width var(--spacer-reveal-duration) ease;
}

.reveal {
  height: 100%;
}
</style>
