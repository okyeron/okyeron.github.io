<template>
  <button @click="fileInput?.click">
    Load Config
    <input ref="fileInput" @change="onFileUpload" accept="application/json" type="file" class="file-input" />
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'load-config', value: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const onFileUpload = async () => {
  const file = fileInput.value?.files?.[0];

  if (file) {
    emit('load-config', file);
  }
};
</script>

<style scoped>
.file-input {
  display: none;
}
</style>
