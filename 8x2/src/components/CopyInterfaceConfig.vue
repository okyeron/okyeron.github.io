<template>
  <div class="copy-container">
    <div class="copy-link" />

    <div :class="['copy-direction-arrow', { reverse: interface === 'trs' }]">➛</div>

    <div :class="['copy-direction-arrow right', { reverse: interface === 'trs' }]">➛</div>

    <button @click="emit('click')" class="copy-button">Copy</button>
  </div>
</template>

<script setup lang="ts">
import { Interface } from '@/access/types';

defineProps<{
  interface: Interface;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<style scoped>
.copy-container {
  align-items: center;
  color: var(--border-color);
  display: flex;
  justify-content: center;
  user-select: none;
}

.copy-button {
  z-index: 1;
}

.copy-link {
  border-top-left-radius: 2ch;
  border-top-right-radius: 2ch;
  position: absolute;
  top: 50%;
  border-top: 1px dashed var(--border-color);
  width: 100%;
  height: 1em;
}

.copy-direction-arrow {
  left: 1.5ch;
  bottom: 0.5px;
  position: absolute;
}

.copy-direction-arrow.right {
  left: unset;
  right: 1.75ch;
}

.copy-direction-arrow.reverse {
  transform: rotate(180deg);
  bottom: -0.5px;
  top: unset;
}

.copy-container button {
  color: var(--border-color);
  border: 1px dashed transparent;
  padding: 0.125em 1ch;
}

.copy-container:hover button {
  border-color: var(--border-color);
  color: white;
}
.copy-container button:hover {
  border-color: var(--background-color);
  color: var(--background-color);
}

.copy-container:hover .copy-link {
  border-top: 1px solid white;
}

.copy-container:hover {
  color: white;
}
</style>
