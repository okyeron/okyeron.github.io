<template>
  <button @click="fileInput?.click">
    Load Config
    <input ref="fileInput" @change="onFileUpload" accept="application/json" type="file" class="file-input" />
  </button>
</template>

<script setup lang="ts">
import { Mapping } from '@/access/types';
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'load-config', value: Mapping): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const onFileUpload = async () => {
  const file = fileInput.value?.files?.[0];

  if (file) {
    // TODO: Validation of the data.
    const config: Mapping = await file.text().then(JSON.parse);

    emit('load-config', config);
  }
};
</script>

<style scoped>
.file-input {
  display: none;
}
</style>
