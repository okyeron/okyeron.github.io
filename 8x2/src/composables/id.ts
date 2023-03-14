import { ref } from 'vue';

const id = ref(0);

export const useUniqueId = () => {
  id.value += 1;

  return id.value;
};
