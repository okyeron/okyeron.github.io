<template>
  <h1 class="header">Settings</h1>

  <hr />

  <ul class="settings-list">
    <li>
      <SettingsMenuSetting caption="TBD" label="👀">
        <input type="checkbox" />
      </SettingsMenuSetting>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import SettingsMenuSetting from '@/components/SettingsMenuSetting.vue';
</script>

<style scoped>
.header {
  font-size: 1.25em;
  margin-top: 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  row-gap: 1em;
}

.settings-list h2 {
  font-size: 1em;
  margin: 0;
}

.settings-list li div:first-of-type {
  padding-left: 0.5ch;
}

:deep(.label) {
  white-space: nowrap;
}
</style>
