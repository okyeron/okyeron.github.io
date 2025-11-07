<script lang="ts" setup>
export type StripedSpacerProps = {
  color?: string | { color: string; stop: number }[];
  endCapColor?: string | undefined;
  shadowed?: boolean;
};

const { color = 'white', endCapColor = 'white', shadowed = false } = defineProps<StripedSpacerProps>();

const formatter = Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  signDisplay: 'always',
  style: 'percent'
});

const format = (value: number) => formatter.format(value);

const beforeBackground = Array.isArray(color)
  ? `linear-gradient(to right, ${color.map(({ color, stop }) => `${color} ${format(stop)}`).join(', ')})`
  : 'currentColor';
</script>

<template>
  <div class="spacer" :style="{ '--color': Array.isArray(color) ? 'white' : color }">
    <div v-if="shadowed" class="depth-shadow" />
  </div>
</template>


<style lang="scss" scoped>
.spacer {
  border-right: 1px solid v-bind(endCapColor);
  color: var(--color, white);
  position: relative;
  width: 100%;

  &::before {
    background: v-bind(beforeBackground);
    bottom: 0;
    content: '';
    left: 0;
    mask-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='black' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
    position: absolute;
    right: 0;
    top: 0;
  }

  .depth-shadow {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.13) 10%, transparent 25%);
    bottom: 0;
    // box-shadow: inset 0px 0px 10px gold;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
