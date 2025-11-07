<script setup lang="ts">
import DeviceConfigurationOverview from 'components/DeviceConfigurationOverview.vue';
import BorderRevealContainer from 'components/BorderRevealContainer.vue';
import DescriptionRowHeader from 'components/DescriptionRowHeader.vue';
import { useOmx27 } from 'src/access/composables';
import { onMounted, ref } from 'vue';
import KeyBedItty from 'components/KeyBedItty.vue';
import { entranceAnimationsForSectionBorders } from 'src/utils';

import PotConfiguration from 'components/PotConfiguration.vue';
import type { OmxBank } from 'access/types';

const {
  bank,
  keys,
  omxState,
  potentiometers,
  saveConfig,
} = useOmx27();

const showPotentiometers = ref(false);
const showKeyTest = ref(false);
const showRightBorder = ref(false);

const animateBorder = ref(false);

const rainbowColors = ["#ff7db5", "#ffb37d", "#fff67d", "#7DFF9D", '#7DC4FF', '#cd7dff'] as const;

const keyTestHeaderStripeColorStopDenominator = rainbowColors.length + 2;

const keyTestHeaderStripeColors = [
  { color: 'magenta', stop: 0 },
  ...rainbowColors.map((color, i) => ({ color, stop: (i + 1) * (1 / keyTestHeaderStripeColorStopDenominator) })),
  { color: 'magenta', stop: 1 }
];

const onBorderRevealsComplete = () => {
  animateBorder.value = true;

  showKeyTest.value = true;
}

onMounted(() => {
  setTimeout(() => showPotentiometers.value = true, 100);
})

const onSaveCcs = ({ bank, ccs }: { bank: OmxBank, ccs: number[] }) => {
  saveConfig({ bank, ccs });
}
</script>

<template>
  <div class="column justify-center items-center  relative-position">
    <div class="column q-col-gutter-y-sm relative-position space-around">
      <DeviceConfigurationOverview @border-reveals-complete="onBorderRevealsComplete" :omxState />

      <div :class="['fade full-width items-stretch row', { 'cloaked': !showPotentiometers }]">
        <PotConfiguration @save-ccs="onSaveCcs" v-if="showPotentiometers" v-model:bank="bank" :animate-border
          :potentiometers />
      </div>

      <div :class="['fade full-width items-stretch row', { 'cloaked': !showKeyTest }]">
        <BorderRevealContainer :active="showKeyTest" :duration="100" color="magenta" class="full-width">
          <DescriptionRowHeader :color="keyTestHeaderStripeColors"
            :spacerRevealDuration="entranceAnimationsForSectionBorders[4] ?? 0" end-cap-color="magenta"
            :show-spacer="showKeyTest">
            Key Test
          </DescriptionRowHeader>

          <div class="q-pt-sm" style="border: 1px solid white">
            <div class="fit q-mb-sm">
              <KeyBedItty :keys :reveal-content="showKeyTest" />
            </div>
          </div>
        </BorderRevealContainer>
      </div>
    </div>

    <transition appear name="border-reveal">
      <div v-show="showRightBorder" class="right-border" />
    </transition>
  </div>
</template>

<style lang="scss">
.border-reveal-enter-active {
  transition: height 0.67s ease;
}

.border-reveal-enter-from {
  height: 0;
}

.border-reveal-enter-to {
  // Account for top offset of .right-border
  height: calc(100% - 0.25em);
}

.cloaked {
  opacity: 0;
}

.fade {
  transition: opacity 0.67s ease;
}

.hold-space {
  min-height: 6em;
}

.reveal-enter-from,
.reveal-leave-to {
  width: 0;
}

.reveal-enter-to,
.reveal-leave-from {
  width: 100%;
}

.reveal-enter-active,
.reveal-leave-active {
  transition: width 0.5s ease;
}

.reveal {
  height: 100%;
}

.right-border {
  border-radius: 4px;
  background: white;
  bottom: 0;
  position: absolute;
  right: 0;
  top: 0.25em;
  width: 1px;
  filter: drop-shadow(0px 0px 1px white);
}
</style>
