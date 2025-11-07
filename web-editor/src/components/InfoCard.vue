<script lang="ts" setup>
import type { DeepReadonly } from 'vue';
import type { OmxState } from 'src/access/composables/omx-27';

const state = defineModel<DeepReadonly<OmxState>>('omxState', {
  required: true,
});
</script>

<template>
  <q-card class="q-py-md">
    <q-card-section class="q-pa-none">
      <q-list dense>
        <q-item-label header>Device Info</q-item-label>

        <q-item class="row space-evenly justify-center gap-16">
          <q-item-section>
            <q-item-label>Model</q-item-label>

            <q-item-label caption>{{ state.info.model }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>Number</q-item-label>

            <q-item-label caption>{{ state.info.modelNum }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="row space-evenly justify-center gap-16">
          <q-item-section>
            <q-item-label>Version</q-item-label>

            <q-item-label caption>{{ state.info.version }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>EEPROM</q-item-label>

            <q-item-label caption>{{ state.info.eepromVersion }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item-label header>MIDI</q-item-label>

        <q-item class="row space-evenly justify-center gap-16">
          <q-item-section>
            <q-item-label>Channel</q-item-label>

            <q-item-label caption>{{ state.midi.channel }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>Velocity</q-item-label>

            <q-item-label caption>
              {{ state.midi.defaultVelocity }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item-label header>Macro</q-item-label>

        <q-item class="row space-evenly justify-center gap-16">
          <q-item-section>
            <q-item-label>Channel</q-item-label>

            <q-item-label caption>{{ state.midi.macro.channel }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>Type</q-item-label>

            <q-item-label caption>{{ state.midi.macro.type }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item-label header>Scale</q-item-label>

        <q-item class="row space-evenly justify-center gap-16">
          <q-item-section>
            <q-item-label>Root</q-item-label>

            <q-item-label caption>{{ state.scale.root }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>Pattern</q-item-label>

            <q-item-label caption>{{ state.scale.pattern }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="row space-evenly justify-center gap-16">
          <q-item-section>
            <q-item-label>Group</q-item-label>

            <q-item-label caption>{{ state.scale.group }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>Lock</q-item-label>

            <q-item-label caption>{{ state.scale.lock }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item-label header>Sequencer</q-item-label>

        <q-item class="row space-evenly justify-center gap-16">
          <q-item-section>
            <q-item-label>Mode</q-item-label>

            <q-item-label caption>{{ state.sequencer.mode }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>Playing Pattern</q-item-label>

            <q-item-label caption>{{
              state.sequencer.playingPattern
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
