<script lang="ts" setup>
import type { ConfigurationEntry } from 'src/types';
import { useSlots } from 'vue';

export type DescriptionCellProps = ConfigurationEntry & {
  color?: string;
}

const { color = 'white' } = defineProps<DescriptionCellProps>();

const slots = useSlots();
</script>

<template>
  <div class="description-cell">
    <dt>
      <span v-if="!slots.name" class="non-selectable q-px-sm text-black text-center text-uppercase">{{ name }}</span>

      <div v-else>
        <slot name="name" />
      </div>
    </dt>


    <!-- <dt v-if="!slots.name" class="non-selectable q-px-sm text-black text-center text-uppercase">
      {{ name }}
    </dt>

    <slot v-else name="name" /> -->

    <dd class="non-selectable relative-position text-bold text-center text-uppercase">
      <slot name="value" :value="value">
        <span class="q-px-xs">{{ value }}</span>
      </slot>
    </dd>
  </div>
</template>

<style lang="scss">
.description-cell {
  --color: white;
  --color-transition: background-color var(--color-transition-duration) ease, border-color var(--color-transition-duration) ease, color var(--color-transition-duration) ease;
  --color-transition-duration: 1s;
  
  &:hover {
    --color-transition-duration: 0.15s;
    --color: v-bind(color);
  }

  dd {
    border-bottom: 1px solid var(--color, white);
    border-left: 0.5px solid var(--color, white);
    border-right: 0.5px solid var(--color, white);
    color: var(--color, white);
    font-family: monospace;
    margin-inline-start: unset;
    transition: var(--color-transition);
  }

  dt {
    background: var(--color, white);
    border-left: 0.5px solid black;
    border-right: 0.5px solid black;
    font-family: monospace;
    white-space: nowrap;
    transition: var(--color-transition);
  }
}
</style>
