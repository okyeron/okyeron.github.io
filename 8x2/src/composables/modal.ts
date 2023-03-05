import { Component, computed, shallowRef } from 'vue';

const modalContent = shallowRef<Component | null>(null);
const content = computed(() => modalContent.value);

export const useModal = () => {
  const setModalContent = (newContent: Component | null) => {
    modalContent.value = newContent;
  };

  return { content, setModalContent };
};
