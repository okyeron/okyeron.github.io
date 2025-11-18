<script setup lang="ts">
import DeviceConfigurationOverview from 'components/DeviceConfigurationOverview.vue';
import BorderRevealContainer from 'components/BorderRevealContainer.vue';
import DescriptionRowHeader from 'components/DescriptionRowHeader.vue';
import LoadingEllipsis from 'components/LoadingEllipsis.vue';
import { useOmx27 } from 'src/access/composables';
import { computed, onMounted, ref, watch } from 'vue';
import KeyBedItty from 'components/KeyBedItty.vue';
import { entranceAnimationsForSectionBorders } from 'src/utils';

import PotConfiguration from 'components/PotConfiguration.vue';
import type { OmxBank } from 'src/access/types';
import { usePageTitle } from 'composables';

const {
  access,
  bank,
  connected,
  connecting,
  keys,
  omxState,
  potentiometers,
  saveConfig,
} = useOmx27();

usePageTitle('OMX-27');

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
  setTimeout(() => showPotentiometers.value = true, 350);

  document.documentElement.style.setProperty('--background-color', 'var(--q-dark-page)');
})

const onSaveCcs = ({ bank, ccs }: { bank: OmxBank, ccs: number[] }) => {
  saveConfig({ bank, ccs });
}

const negotiatingAccess = computed(() => (access.value === 'pending' || access.value === 'requesting'));

const a = ref(Date.now());

watch(negotiatingAccess, (value, oldValue) => {
  if (!oldValue && value) {
    a.value = Date.now()
  }
})

const showNegotiatingAccessContent = computed(() => (negotiatingAccess.value && ((Date.now() - a.value) >= 1000)));
</script>

<template>
  <q-page class="column justify-center">
    <section class=" row fit items-center justify-evenly">
      <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
        <div v-if="connecting" class="col-12 text-center">
          <p>
            <span>Connecting to OMX-27</span>

            <LoadingEllipsis />
          </p>
        </div>

        <div v-else-if="connected" class="column justify-center items-center relative-position">
          <div class="column q-col-gutter-y-sm relative-position space-around">
            <DeviceConfigurationOverview @border-reveals-complete="onBorderRevealsComplete" :omxState />

            <div :class="['fade full-width items-stretch row', { 'cloaked': !showPotentiometers }]">
              <PotConfiguration @save-ccs="onSaveCcs" v-model:bank="bank" :animate-border :potentiometers />
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

        <div v-else-if="negotiatingAccess">
          <div v-if="showNegotiatingAccessContent" class="text-center">
            <p>Requesting access to device.</p>

            <q-spinner-puff />
          </div>
        </div>

        <div v-else class="text-center">
          <p>
            No device detected.
          </p>

          <p class="text-grey-6">
            Did you plug it in?
          </p>

          <p class="text-grey-8">
            ...Did you turn it on?
          </p>
        </div>
      </transition>
    </section>
  </q-page>
</template>

<style lang="scss" scoped>
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
