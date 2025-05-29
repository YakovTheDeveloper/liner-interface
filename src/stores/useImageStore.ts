import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useImageStore = defineStore('image', () => {
  const imageUrl = ref<string | null>(null);
  return { imageUrl };
});
