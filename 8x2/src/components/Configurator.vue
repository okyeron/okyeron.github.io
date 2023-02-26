<template>
  <div>
    <div ref="interfaceSelectorContainer" :class="['interface-selector-container', { scrolling: scrolling }]">
      <TabsSelector
        v-model="midiInterface"
        :options="['usb', 'trs']"
        label="Interface"
        padding="4ch"
        shrink
        :class="['selector interface-selector', { scrolling: scrolling }]"
      />

      <ConfigUploadButton @load-config="$emit('load-config', $event)" class="config-upload-button" />
    </div>

    <div :class="['configurator-body', { scrolling: scrolling }]">
      <div class="row">
        <TabsSelector
          v-if="midiBank != null"
          ref="bankSelector"
          v-model="midiBank"
          :options="Banks"
          label="Bank"
          vertical
          class="bank-selector selector"
        />

        <div class="pots-config">
          <MappingsGroup
            v-model:ccs="firstEightCcs"
            v-model:channels="firstEightChannels"
            :on-device-ccs="onDeviceFirstEightCcs"
            :on-device-channels="onDeviceFirstEightChannels"
            :potentiometers="firstEightPotentiometers"
          />

          <div style="width: 100%; margin-top: 2rem" />

          <MappingsGroup
            v-model:ccs="lastEightCcs"
            v-model:channels="lastEightChannels"
            :on-device-ccs="onDeviceLastEightCcs"
            :on-device-channels="onDeviceLastEightChannels"
            :potentiometers="lastEightPotentiometers"
            :count-offset="8"
          />
        </div>
      </div>

      <div class="bottom-border-container row align-center justify-between">
        <header class="title">
          <HachiNi class="japanese" />

          <div class="ayy-by-two">
            <span>({{ info?.model ?? '8x2' }})</span> <span>v{{ info?.version }}</span>
          </div>
        </header>

        <div class="buttons row align-center">
          <div v-show="configDiverged" class="button-container">
            <button @click="$emit('reset-config')">Reset</button>
          </div>

          <div class="button-container">
            <button class="save-menu-button">
              <div class="row align-center">
                <div>Save</div>

                <div class="split-arrow">↑</div>
              </div>

              <div class="column save-menu">
                <button @click="$emit('export-config')">Export to File</button>

                <button @click="$emit('save-config')" :disabled="disableSave">Save to Device</button>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import ConfigUploadButton from '@/components/ConfigUploadButton.vue';
import HachiNi from '@/components/HachiNi.vue';
import MappingsGroup from '@/components/MappingsGroup.vue';
import TabsSelector from '@/components/TabsSelector.vue';
import { Bank, Banks, Info, Interface } from '@/access/types';

const props = defineProps<{
  bank: Bank;
  ccs: number[];
  channels: number[];
  disableSave: boolean;
  interface: Interface;
  info: Info | null;
  onDeviceCcs: readonly number[];
  onDeviceChannels: readonly number[];
  potentiometers: readonly number[];
}>();

const emit = defineEmits<{
  (e: 'export-config'): void;
  (e: 'load-config', value: File): void;
  (e: 'reset-config'): void;
  (e: 'update:bank', value: Bank): void;
  (e: 'update:ccs', value: number[]): void;
  (e: 'update:channels', value: number[]): void;
  (e: 'update:interface', value: Interface): void;
  (e: 'save-config'): void;
}>();

const midiBank = computed({
  get() {
    return props.bank;
  },
  set(value) {
    emit('update:bank', value);
  },
});

const midiInterface = computed({
  get() {
    return props.interface;
  },
  set(value) {
    emit('update:interface', value);
  },
});

const firstEightPotentiometers = computed(() => props.potentiometers.slice(0, 8));

const lastEightPotentiometers = computed(() => props.potentiometers.slice(8));

// TODO: Splitting the values in two like this is really gross, but
// comes from wanting to render two rows of knobs when screen space allows.
// Potentially a cleaner way of doing this, though.
const firstEightCcs = computed({
  get() {
    return props.ccs.slice(0, 8);
  },
  set(value) {
    emit('update:ccs', [...value, ...props.ccs.slice(8)]);
  },
});

const onDeviceFirstEightCcs = computed(() => props.onDeviceCcs.slice(0, 8));

const lastEightCcs = computed({
  get() {
    return props.ccs.slice(8);
  },
  set(value) {
    emit('update:ccs', [...props.ccs.slice(0, 8), ...value]);
  },
});

const onDeviceLastEightCcs = computed(() => props.onDeviceCcs.slice(8));

const firstEightChannels = computed({
  get() {
    return props.channels.slice(0, 8);
  },
  set(value) {
    emit('update:channels', [...value, ...props.channels.slice(8)]);
  },
});

const onDeviceFirstEightChannels = computed(() => props.onDeviceChannels.slice(0, 8));

const lastEightChannels = computed({
  get() {
    return props.channels.slice(8);
  },
  set(value) {
    emit('update:channels', [...props.channels.slice(0, 8), ...value]);
  },
});

const onDeviceLastEightChannels = computed(() => props.onDeviceChannels.slice(8));

const configDiverged = computed(
  () =>
    props.ccs.some((cc, i) => cc !== props.onDeviceCcs[i]) ||
    props.channels.some((channel, i) => channel !== props.onDeviceChannels[i])
);

const interfaceSelectorContainer = ref(null);

const observer = ref();
const scrolling = ref(false);

onMounted(() => {
  observer.value = new IntersectionObserver(([e]) => (scrolling.value = e.intersectionRatio < 1), {
    threshold: 0.999,
    root: null,
  });

  observer.value.observe(interfaceSelectorContainer.value);
});

onBeforeUnmount(() => {
  observer.value?.unobserve(interfaceSelectorContainer.value);
});
</script>

<style>
.configurator-body {
  --title-font-size: 2em;
  border: 1px dashed var(--border-color);
  border-radius: 2.5ch;
  padding: 2rem 4rem 3rem 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 0.15ch;
  position: relative;
  justify-content: center;
}

.selector {
  margin-right: 2ch;
}

.interface-selector {
  flex: 1 0 auto;
  padding-left: 1ch;
}

.pots-config {
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 0.15ch;
  justify-content: center;
}

.title {
  --padding: 1ch;
  font-size: 1.25em;
  background: var(--background-color);

  padding: 0 var(--padding) 0 var(--padding);

  margin: 0;
  display: flex;
  gap: 0.5ch;
  align-items: center;
}

.buttons {
  gap: 1ch;
}

.button-container {
  --padding: 1ch;

  background-color: var(--background-color);
  padding: 0 var(--padding) 0 var(--padding);
}

.ayy-by-two {
  font-family: monospace;
  user-select: none;
}

.japanese {
  height: var(--title-font-size);
}

.side-title .japanese {
  writing-mode: vertical-lr;
}

.bottom-border-container {
  --bottom-offset: 1.25em;
  --horizontal-padding: 5ch;
  position: absolute;
  right: var(--horizontal-padding);
  left: var(--horizontal-padding);
  bottom: calc(-1 * var(--bottom-offset));
  white-space: nowrap;
}

.save-menu-button {
  position: relative;
}

.save-menu {
  position: absolute;
  right: 0;
  row-gap: 0.25em;
  top: calc(-200% - 0.85em);
  visibility: hidden;
  width: min-content;
  z-index: 2;
}

.split-arrow {
  border-left: 1px solid currentColor;
  margin-left: 5px;
  padding-left: 5px;
}

.save-menu-button:focus .save-menu {
  visibility: visible;
}

.save-menu:focus-within {
  visibility: visible;
}

.interface-selector-container {
  display: flex;
  flex-wrap: nowrap;
}

.config-upload-button {
  border-bottom: unset;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-right: 2ch;
  padding: 0 1ch 0 1ch;
}

@media screen and (max-width: 640px) {
  .title {
    flex-direction: column;
    font-size: 0.5em;
  }

  .japanese {
    height: 3em;
  }

  .bank-selector {
    padding-top: 3em;
    max-height: 20em;
    position: sticky;
    top: 0;
  }

  .interface-selector-container {
    padding-top: 1em;
    background: var(--background-color);
    position: sticky;
    top: -1px;
    z-index: 3;
  }

  .bottom-border-container {
    --button-border-width: 1px;
    --bottom-offset: calc(1.25em + 2 * var(--button-border-width));
    --horizontal-padding: 1ch;
  }

  .configurator-body {
    padding-right: 3ch;
  }

  .pots-config {
    margin-left: auto;
    margin-right: auto;
  }

  .interface-selector-container.scrolling {
    border-bottom: 1px dashed var(--border-color);
  }
}
</style>
