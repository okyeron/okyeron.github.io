<!-- <script setup lang="ts"></script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style> -->
<template>
  <router-view />
</template>

<script setup lang="ts">
defineOptions({
  name: 'Denki Oto Web MIDI Configurator'
});
</script>
