<template>
  <div class="layout">
    <div class="configurator">
      <slot name="configurator" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.layout {
  align-items: stretch;
  display: grid;
  grid-template-areas:
    '.'
    'configurator'
    '.';

  grid-template-rows: 1fr auto 1fr;
  height: 100%;
}

.layout .configurator {
  grid-area: configurator;
  margin: 0 auto;
  max-width: 1280px;
}
</style>
