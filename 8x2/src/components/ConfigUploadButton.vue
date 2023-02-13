<template>
  <button @click="fileInput?.click">
    Load Config
    <input ref="fileInput" @change="onFileUpload" accept="application/json" type="file" class="file-input" />
  </button>
</template>

<script setup lang="ts">
import { Mapping, MappingSchema } from '@/access/types';
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'load-config', value: Mapping): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const onFileUpload = async () => {
  const file = fileInput.value?.files?.[0];

  if (file) {
    const unvalidatedConfig = await file.text().then(JSON.parse);

    const parseResult = MappingSchema.safeParse(unvalidatedConfig);

    if (parseResult.success) {
      emit('load-config', parseResult.data);
    } else {
      // TODO: Emit load-failed event?
      console.error('Invalid config file');
    }
  }
};
</script>

<style scoped>
.file-input {
  display: none;
}
</style>
