<template>
  <button @click="fileInput?.click">
    Load
    <input ref="fileInput" @input="onFileUpload" accept="application/json" type="file" class="file-input" />
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

    const input = fileInput.value;

    if (input) {
      input.value = ''; // Clear input so that same file could be loaded again.
    }
  }
};
</script>

<style scoped>
.file-input {
  display: none;
}
</style>
