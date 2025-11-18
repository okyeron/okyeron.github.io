<script setup lang="ts">
import { useWebMidi } from 'src/access/composables/webMidi';
import { ref, watch } from 'vue';
import router from 'src/router';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'MainLayout',
});

const route = useRoute();

const tabs = ref<{
  label: string;
  name: string;
  to: string;
}[]>([]);

const setupMidiDeviceTab = (
  device: ReturnType<typeof useWebMidi>,
  { label, name }: Pick<(typeof tabs)['value'][number], 'label' | 'name'>
) => {
  watch(
    device.connected,
    (connected) => {
      if (connected) {
        console.log('hachi-ni connected');
        router.push(`/${name}`);

        tabs.value.push({ label, name, to: name });
      } else {
        const index = tabs.value.findIndex((t) => t.name === name);

        if (index !== -1) {
          tabs.value.splice(index, 1);
        }

        if (route.name === name) {
          router.push('/');
        }
      }
    },
    { immediate: true }
  );
}

setupMidiDeviceTab(useWebMidi('denki-oto', 'hachi-ni', [() => { }]), {
  label: '八x二',
  name: 'hachi-ni',
});

setupMidiDeviceTab(useWebMidi('denki-oto', 'omx-27', [() => { }]), {
  label: 'OMX-27',
  name: 'omx-27',
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header">
      <q-toolbar class="toolbar">
        <q-tabs active-color="white" active-class="text-glow" indicator-color="white" dense
          style="color: rgb(163 198 228)">
          <q-route-tab v-for="{ label, name, to } in tabs" :key="name" :name :ripple="false" :to>
            {{ label }}
          </q-route-tab>
        </q-tabs>

        <q-space />

        <a href="#/" style="color: inherit; text-decoration: none">
          <q-toolbar-title shrink class="non-selectable" style="text-transform: none">
            <div v-if="$q.screen.lt.sm" class="text-subtitle1" style="line-height: 1em">
              <div><span class="text-primary">denki oto</span></div>

              <div>Web MIDI Editor</div>
            </div>

            <span v-else><span class="text-primary">denki oto</span> Web MIDI Editor</span>
          </q-toolbar-title>
        </a>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.header {
  background: #111111;
}

.toolbar {
  height: 2.25rem;
  min-height: unset;
}
</style>
