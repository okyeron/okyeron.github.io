<template>
  <Teleport to="body">
    <Transition>
      <section v-show="showModal" @click="closeModal" class="overlay">
        <div v-show="showModal" @click.stop class="modal">
          <component :is="content" />

          <button @click="closeModal" class="close-button">x</button>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { useModal } from '@/composables/modal';
import { computed } from 'vue';

const { content, setModalContent } = useModal();

const showModal = computed(() => content.value != null);

const closeModal = () => setModalContent(null);
</script>

<style scoped>
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
.modal {
  background-color: var(--background-color);
  border: 1px dashed var(--border-color);
  border-radius: 1ch;
  padding: 1em;
  position: relative;
}
.overlay {
  align-items: center;
  background: rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(2px);
  bottom: 0;
  display: flex;
  left: 0;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
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
