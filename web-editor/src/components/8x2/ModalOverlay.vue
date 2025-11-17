<template>
  <Teleport to="body">
    <Transition>
      <section v-show="showModal" @click="close(false)" :class="['overlay', { cover: modalConfig.cover }]">
        <div v-show="showModal" @click.stop class="modal">
          <div v-if="typeof content === 'string'" class="string-content">
            {{ content }}
          </div>

          <component v-else :is="content" />

          <div v-show="modalConfig.confirm" class="row align-center justify-end actions">
            <button @click="close(true)" class="okay">Okay</button>

            <button @click="close(false)">Cancel</button>
          </div>

          <button @click="close(false)" class="close-button">x</button>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useModalContainer } from 'composables';

const { closeModal, content, modalConfig } = useModalContainer();

const showModal = computed(() => content.value != null);

const close = (confirmState = false) => {
  closeModal(confirmState);
};
</script>

<style scoped>
.actions {
  gap: 1ch;
  margin-top: 0.5em;
}

.okay {
  border: none;
}

.close-button {
  background: none;
  border: none;
  height: 3ch;
  padding: 0;
  position: absolute;
  right: -1.5ch;
  text-align: center;
  top: -1.5ch;
  vertical-align: middle;
  width: 3ch;
}

.close-button:hover {
  background-color: var(--background-color);
  border: 1px solid white;
  color: white;
}

.modal {
  background-color: var(--background-color);
  border: 1px dashed var(--border-color);
  border-radius: 1ch;
  padding: 1em;
  position: relative;
  width: min(600px, 100%);
}

.modal:has(.string-content) {
  width: min(300px, 100%);
}

.overlay {
  align-items: center;
  bottom: 0;
  display: flex;
  left: 0;
  justify-content: center;
  overflow: scroll;
  overscroll-behavior: contain;
  padding: 1em;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 3;
}

.overlay.cover {
  background: rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(2px);
}

.string-content {
  text-align: center;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.125s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
