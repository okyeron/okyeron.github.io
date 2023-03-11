<template>
  <span v-for="i in 3" :key="i" :class="{ 'visibility-hidden': i > sliceIndex }">.</span>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const sliceIndex = ref(0);

let intervalStop: number;

onMounted(() => {
  intervalStop = setInterval(() => (sliceIndex.value = (sliceIndex.value + 1) % 4), 250);
});

onUnmounted(() => clearInterval(intervalStop));
</script>
