<script lang="ts" setup>
import DescriptionCell from 'components/DescriptionCell.vue';
import type { OmxState } from 'src/access/composables';
import type { ConfigurationEntry } from 'src/types';
import type { DeepReadonly } from 'vue';
import { computed, onMounted, ref } from 'vue';
import DescriptionRow from 'components/DescriptionRow.vue';
import DescriptionRowHeader from 'components/DescriptionRowHeader.vue';
import StripedSpacer from 'components/StripedSpacer.vue';
import BorderRevealContainer from 'components/BorderRevealContainer.vue';
import { entranceAnimationsForSectionBorders } from 'src/utils';

export type DescriptionCellProps = { omxState: DeepReadonly<OmxState> };

const { omxState } = defineProps<DescriptionCellProps>();

const emit = defineEmits<{
  (e: 'border-reveals-complete'): void
}>();

const showInfo = ref(false);

const showMidi = ref(false);

const showMacro = ref(false);

const showScale = ref(false);

const showSequencer = ref(false);

const showPotentiometers = ref(false);


const count = entranceAnimationsForSectionBorders.length;

const active = ref(Array(count).fill(false))

const trigger = (i: number) => {
  if (i >= count) {
    return;
  }

  active.value[i] = true;
}

const timeouts = {
  info: 350,
  midi: 300,
  macro: 200,
  scale: 130,
  sequencer: 250,
  potentiometers: 50
}

onMounted(() => {
  setTimeout(() => showInfo.value = true, timeouts.info);
  setTimeout(() => showMidi.value = true, timeouts.midi);
  setTimeout(() => showMacro.value = true, timeouts.macro);
  setTimeout(() => showScale.value = true, timeouts.scale);
  setTimeout(() => showSequencer.value = true, timeouts.sequencer);
  setTimeout(() => showPotentiometers.value = true, timeouts.potentiometers);

  setTimeout(() => trigger(0), 700);
})

const configurationInfoEntries = computed(() => {
  const entries: ConfigurationEntry[] = [];

  entries.push(
    { name: 'Model', value: omxState.info.model },
    {
      name: 'Number',
      value: omxState.info.modelNum,
    },
    {
      name: "Version",
      value: omxState.info.version,
    },
    {
      name: "EEPROM",
      value: omxState.info.eepromVersion,
    });

  return entries.map(({ name, value }) => ({ name, value: value === '' ? undefined : value }))
});

const configurationMidiEntries = computed(() => {
  const entries: ConfigurationEntry[] = [];

  entries.push(
    { name: 'Channel', value: omxState.midi.channel },
    {
      name: 'Velocity',
      value: omxState.midi.defaultVelocity
    },
  );

  return entries.map(({ name, value }) => ({ name, value: value === '' ? undefined : value }))
});

const configurationMacroEntries = computed(() => {
  const entries: ConfigurationEntry[] = [];

  entries.push(
    { name: 'Channel', value: omxState.midi.macro.channel },
    {
      name: 'Type',
      value: omxState.midi.macro.type
    },
  );

  return entries.map(({ name, value }) => ({ name, value: value === '' ? undefined : value }))
});

const configurationScaleEntries = computed(() => {
  const entries: ConfigurationEntry[] = [];

  entries.push(
    { name: 'Root', value: omxState.scale.root },
    { name: 'Group', value: omxState.scale.group ? 'on' : 'off' },
    { name: 'Lock', value: omxState.scale.lock ? 'on' : 'off' },
    { name: 'Pattern', value: omxState.scale.pattern },
  );

  return entries.map(({ name, value }) => ({ name, value: value === '' ? undefined : value }))
});

const configurationSequencerEntries = computed(() => {
  const entries: ConfigurationEntry[] = [];

  entries.push(
    { name: 'Mode', value: omxState.sequencer.mode },
    { name: 'Playing Pattern', value: omxState.sequencer.playingPattern },
  );

  return entries.map(({ name, value }) => ({ name, value: value === '' ? undefined : value }))
});
</script>

<template>
  <div class="column justify-start q-gutter-y-sm">
    <BorderRevealContainer :active="active[0]" :duration="entranceAnimationsForSectionBorders[0]"
      @after-enter="trigger(1)" color="#ff7db5">
      <DescriptionRow color="#ff7db5" :class="['col fade', { 'cloaked': !showInfo }]">
        <template #header>
          <DescriptionRowHeader :show-spacer="showInfo" color="#ff7db5">Device Info</DescriptionRowHeader>
        </template>

        <DescriptionCell v-for="{ name, value } in configurationInfoEntries" :key="name" :name="name" :value="value"
          color="#ff7db5" />

        <div class="col">
          <transition appear name="reveal">
            <StripedSpacer v-show="showInfo" shadowed class="dimmed full-height" />
          </transition>
        </div>
      </DescriptionRow>
    </BorderRevealContainer>

    <BorderRevealContainer :active="active[1]" :duration="entranceAnimationsForSectionBorders[1]"
      @after-enter="trigger(2)" color="#fff67d" class="col">
      <div class="q-col-gutter-x-xs row">
        <BorderRevealContainer :active="active[1]" :duration="entranceAnimationsForSectionBorders[1]" color="#ffb37d">
          <DescriptionRow color="#ffb37d" :class="['col-auto fade', { 'cloaked': !showMidi }]">
            <template #header>
              <DescriptionRowHeader :show-spacer="showMidi" color="#ffb37d">MIDI</DescriptionRowHeader>
            </template>

            <DescriptionCell v-for="{ name, value } in configurationMidiEntries" :key="name" :name="name" :value="value"
              color="#ffb37d" />
          </DescriptionRow>
        </BorderRevealContainer>

        <DescriptionRow color="#fff67d" :class="['col fade', { 'cloaked': !showMacro }]">
          <template #header>
            <DescriptionRowHeader v-if="showMacro" color="#fff67d">Macro</DescriptionRowHeader>
          </template>

          <DescriptionCell v-for="{ name, value } in configurationMacroEntries" :key="name" :name="name" :value="value"
            color="#fff67d" />

          <div class="col">
            <transition appear name="reveal">
              <StripedSpacer v-show="showMacro" shadowed class="dimmed full-height" />
            </transition>
          </div>
        </DescriptionRow>
      </div>
    </BorderRevealContainer>

    <BorderRevealContainer :active="active[2]" :duration="entranceAnimationsForSectionBorders[2]"
      @after-enter="trigger(3)" color="#7DFF9D">
      <DescriptionRow color="#7DFF9D" :class="['col-auto fade', { 'cloaked': !showScale }]">
        <template #header>
          <DescriptionRowHeader :show-spacer="showScale" color="#7DFF9D">Scale</DescriptionRowHeader>
        </template>

        <DescriptionCell v-for="{ name, value } in configurationScaleEntries" :key="name" :name="name" :value="value"
          color="#7DFF9D" />

        <div class="col">
          <transition appear name="reveal">
            <StripedSpacer v-show="showScale" shadowed class="dimmed full-height" />
          </transition>
        </div>
      </DescriptionRow>
    </BorderRevealContainer>

    <BorderRevealContainer @after-enter="emit('border-reveals-complete')" :active="active[3]"
      :duration="entranceAnimationsForSectionBorders[3]" color="#cd7dff" class="col">
      <div class="q-col-gutter-x-xs row">
        <BorderRevealContainer :active="active[3]" :duration="entranceAnimationsForSectionBorders[3]" color="#7DC4FF">
          <DescriptionRow color="#7DC4FF" :class="['col-auto fade', { 'cloaked': !showSequencer }]">
            <template #header>
              <DescriptionRowHeader :show-spacer="showSequencer" color="#7DC4FF">Mode</DescriptionRowHeader>
            </template>

            <DescriptionCell v-for="{ name, value } in [configurationSequencerEntries[0]!]" :key="name" :name="name"
              :value="value" color="#7DC4FF" />
          </DescriptionRow>
        </BorderRevealContainer>

        <DescriptionRow color="#cd7dff" :class="['col fade', { 'cloaked': !showSequencer }]">
          <template #header>
            <DescriptionRowHeader v-if="showSequencer" color="#cd7dff">Pattern</DescriptionRowHeader>
          </template>

          <DescriptionCell v-for="{ name, value } in [configurationSequencerEntries[1]!]" :key="name" :name="name"
            :value="value" color="#cd7dff" />

          <div class="col">
            <transition appear name="reveal">
              <StripedSpacer v-show="showMacro" shadowed class="dimmed full-height" />
            </transition>
          </div>
        </DescriptionRow>
      </div>
    </BorderRevealContainer>
  </div>
</template>

<style lang="scss" scoped>
.device-configuration-overview {
  &--spacer {
    border-right: 1px solid white;
    color: var(--color, white);
    position: relative;
    width: 100%;

    &::before {
      bottom: 0;
      background-color: currentColor;
      content: '';
      left: 0;
      mask-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='black' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}

.cloaked {
  opacity: 0;
}

.fade {
  transition: opacity 0.67s ease;
}

.mode-pattern-spacer {
  background: linear-gradient(to right, #7DC4FF 0%, #cd7dff 70%);
  background-color: unset;
  --color: '';
}

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
  transition: color 1.5s ease, width 0.5s ease;
}

.reveal {
  height: 100%;
}
</style>
