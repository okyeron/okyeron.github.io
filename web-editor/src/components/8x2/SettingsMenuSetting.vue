<template>
  <div class="row align-start justify-between setting">
    <div class="text-container">
      <h2>{{ label }}</h2>

      <div class="caption">{{ caption }}</div>
    </div>

    <div class="control">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  caption: string;
  label: string;
}>();
</script>

<style scoped>
.caption {
  opacity: 0.8;
  padding-left: 0.5ch;
}

.setting h2 {
  font-size: 1em;
  margin: 0;
}

.text-container {
  padding-right: 2ch;
}
</style>
