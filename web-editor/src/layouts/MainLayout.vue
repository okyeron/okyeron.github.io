<script setup lang="ts">
import { useWebMidi } from 'src/access/composables/webMidi';
import { watch } from 'vue';
import router from 'src/router';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'MainLayout',
});

const route = useRoute();

const hachiNi = useWebMidi('denki-oto', 'hachi-ni', [() => { }]);

watch(hachiNi.connected, () => {
  if (hachiNi.connected.value) {
    router.push('/hachi-ni');
  } else if (route.name === 'hachi-ni') {
    router.push('/')
  }
}, { immediate: true, });

const omx27 = useWebMidi('denki-oto', 'omx-27', [() => { }]);

watch(omx27.connected, () => {
  if (omx27.connected.value) {
    router.push('/omx-27');
  } else if (route.name === 'omx-27') {
    router.push('/')
  }
}, { immediate: true, });
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-grey-10">
      <q-toolbar class="toolbar">
        <q-tabs active-color="white" active-class="text-glow" indicator-color="white" dense
          style="color: rgb(163 198 228)">
          <q-route-tab v-if="hachiNi.connected.value" :ripple="false" name="hachi-ni" to="hachi-ni"> 八x二 </q-route-tab>

          <q-route-tab v-if="omx27.connected.value" :ripple="false" name="omx-27" to="omx-27"> OMX-27 </q-route-tab>
        </q-tabs>

        <q-space />

        <!-- TODO: reflow at smaller screen width -->
        <a href="#/" style="color: inherit; text-decoration: none">
          <q-toolbar-title shrink class="non-selectable" style="text-transform: none">
            <span class="text-primary">denki-oto</span> WebMIDI Editor
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
.toolbar {
  min-height: unset;
}
</style>
