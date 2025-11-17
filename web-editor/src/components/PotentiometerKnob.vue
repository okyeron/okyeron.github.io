<template>
  <div :class="['meter', { grow: grow, shake: atExtremity }]">
    <div class="value-container">
      <div class="radial-mask" />

      <div class="value">{{ modelValue === min ? '-' : modelValue }}</div>

      <div class="mark-container start stop">
        <div class="pip" />
      </div>

      <div class="end mark-container stop">
        <div class="pip" />
      </div>

      <div class="mark-container pip-container">
        <div class="pip tick" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'PotentiometerKnob',
});

const {
  grow = false,
  min = 0,
  max = 127,
  modelValue,
} = defineProps<{
  grow?: boolean;
  modelValue: number;
  min?: number;
  max?: number;
}>();

const POT_RANGE = 270;

// TODO: Migrate color palettes/usage of out to an external composable
// so that the active palette can be managed by the user somewhere up the
// the component chain.
const colors = [
  // [24, 255, 255],
  [62, 119, 168],
  [118, 255, 3],
  [245, 0, 87],
  // https://coolors.co/palette/ff595e-ffca3a-8ac926-1982c4-6a4c93
  // [106, 76, 147],
  // [25, 130, 196],
  // [138, 201, 38],
  // [255, 202, 58],
  // [255, 89, 94],

  // https://coolors.co/palette/5f0f40-9a031e-fb8b24-e36414-0f4c5c
  // [95, 15, 64],
  // [154, 3, 30],
  // [251, 139, 36],
  // [227, 100, 20],
  // [15, 76, 92],
];

const percentage = computed(() => {
  const range = max - min;
  const position = modelValue - min;

  return position / range;
});

const rotation = computed(() => percentage.value);

const colorStartIndex = computed(() =>
  Math.min(
    Math.floor(percentage.value * (colors.length - 1)),
    colors.length - 2,
  ),
);

const colorEndIndex = computed(() => colorStartIndex.value + 1);

const startColor = computed(() => colors[colorStartIndex.value]);

const endColor = computed(() => colors[colorEndIndex.value]);

const rangePercentage = computed(() => {
  const startPercentage = colorStartIndex.value / (colors.length - 1);
  const endPercentage = colorEndIndex.value / (colors.length - 1);
  const range = endPercentage - startPercentage;

  const position = percentage.value - startPercentage;

  return position / range;
});

const background = computed(() => {
  const [red, green, blue] = (startColor.value ?? [0, 0, 0]).map((channel, i) => {
    return (
      channel +
      Math.floor(rangePercentage.value * (((endColor.value ?? [0, 0, 0])[i] ?? 0) - channel))
    );
  });

  return `rgb(${red}, ${green}, ${blue})`;
});

const atExtremity = computed(() => {
  return modelValue === min || modelValue === max;
});

const valueNumberBorder = computed(() => {
  if (atExtremity.value) {
    return `1px dashed ${background.value}`;
  }

  return '1px solid transparent';
});

const radialBackground = computed(() => {
  const colorRange = 100 * (POT_RANGE / 360);
  const offset = (100 - colorRange) / 2;
  const colorStops: number[] = [];

  const rgbs = colors.map((channels, i) => {
    colorStops.push(offset + colorRange * ((i + 1) / colors.length));

    return `rgb(${channels.join(', ')})`;
  });

  const gradientValues = rgbs
    .map((color, i) => {
      const stop = `${colorStops[i]?.toFixed(2)}%`;

      return `${color} ${stop}`;
    })
    .join(', ');

  const offsetPercentage = `${offset.toFixed(2)}`;

  return `conic-gradient(from ${180}deg, rgba(0, 0, 0, 0.6) ${offsetPercentage}%, ${rgbs[0]
    } ${offsetPercentage}%, ${gradientValues}, transparent ${colorStops[colors.length - 1]?.toFixed(2)}%, transparent 0)`;
});

const radialMaskBackground = computed(() => {
  const colorRange = 100 * (POT_RANGE / 360);
  const offset = (100 - colorRange) / 2 + colorRange * percentage.value;

  const offsetPercentage = `${offset.toFixed(2)}`;

  return `conic-gradient(from ${180}deg, transparent ${offsetPercentage}%, ${background.value} ${offsetPercentage}%, ${background.value
    } ${(100 - (100 - colorRange) / 2).toFixed(2)}%, rgba(0, 0, 0, 0.6) ${(
      100 -
      (100 - colorRange) / 2
    ).toFixed(2)}%, rgba(0, 0, 0, 0.6) 100%)`;
});
</script>

<style scoped lang="scss">
/* TODO: Clean up the CSS a bit. */
@keyframes vertical-shaking {
  0% {
    transform: translateY(0);
  }

  25% {
    transform: translateY(var(--shake-delta));
  }

  50% {
    transform: translateY(calc(-1 * var(--shake-delta)));
  }

  75% {
    transform: translateY(var(--shake-delta));
  }

  100% {
    transform: translateY(0);
  }
}

.meter {
  --background-color: #2e2e2e;
  --shake-delta: 5px;
  --text-color: #efefef;
  --width: 5ch;
  background-color: v-bind(background);
  border-radius: calc(var(--width) / 2);
  color: var(--text-color);
  display: inline-block;
  font-weight: bold;
  position: relative;
  vertical-align: middle;
  width: var(--width);
}

.meter.grow {
  height: calc(var(--width) + v-bind(modelValue / (max - min)) * 100px);
}

.meter.shake .value-container .value {
  animation: vertical-shaking 0.15s;
}

.value-container {
  background: v-bind(radialBackground);
  border-radius: calc(var(--width) / 2);
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;
  width: var(--width);
  height: var(--width);
}

.value-container .radial-mask {
  background: v-bind(radialMaskBackground);
  border-radius: calc(var(--width) / 2);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
}

.value-container .value {
  align-items: center;
  background-color: var(--background-color);
  border: v-bind(valueNumberBorder);
  border-radius: calc(var(--width) / 2);
  box-shadow:
    rgba(0, 0, 0, 0.16) 0px 3px 6px,
    rgba(0, 0, 0, 0.23) 0px 3px 6px;
  display: flex;
  justify-content: center;
  transition: 0.15s ease border-color;
  user-select: none;
  width: 80%;
  height: 80%;
  z-index: 1;
}

.mark-container {
  height: calc(100% - 1ch);
  position: absolute;
  width: calc(100% - 1ch);
  z-index: 2;
}

.mark-container.stop.end {
  transform: rotate(calc((v-bind(POT_RANGE) + (360 - v-bind(POT_RANGE)) / 2) * 1deg));
}

.mark-container.stop.start {
  transform: rotate(calc(((360 - v-bind(POT_RANGE)) / 2) * 1deg));
}

.pip-container {
  transform: rotate(calc((((360 - v-bind(POT_RANGE)) / 2) + v-bind(rotation) * v-bind(POT_RANGE)) * 1deg));
}

.mark-container .pip {
  --dimension: 0.5ch;
  --width: var(--dimension);
  --height: var(--dimension);
  background-color: var(--background-color);
  border-radius: calc(var(--dimension) / 2);
  height: var(--height);
  width: var(--width);
  opacity: 1;
  position: relative;
  left: calc(50% - var(--width) / 2);
  top: calc(100% - var(--height) / 2);
}

.pip-container .pip {
  --width: var(--dimension);
  background-color: #fefefe;
  opacity: 1;
}

.pip-container .pip.tick {
  --height: calc(var(--dimension) * 2);
  background-color: #fefefe;
  opacity: 1;
  position: absolute;
}
</style>
