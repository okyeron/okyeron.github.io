<script setup lang="ts">
import { useSlots } from 'vue'

defineProps<{ color?: string }>();

const slots = useSlots();
</script>

<template>
  <div class="column">
    <div v-if="slots.header" class="description-row--header non-selectable">
      <slot name="header" />
    </div>

    <dl class="col-auto description-row--content row">
      <slot />
    </dl>
  </div>
</template>


<style lang="scss" scoped>
.description-row {
  --color: v-bind(color);

  &--content {
    margin-block-end: unset;
    margin-block-start: unset;

    ::v-deep(:nth-child(1 of .description-cell)) {
      dt {
        border-left: 1px solid var(--color, white);
      }
    }

    ::v-deep(:nth-last-child(1 of .description-cell)) {
      dt {
        border-right: 1px solid var(--color, white);
      }
    }
  }

  &--header {
    font-family: monospace;
  }
}
</style>
