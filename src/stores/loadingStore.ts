import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading-store', () => {
  const isLoading = ref(false)
  const setIsLoading = (value: boolean) => (isLoading.value = value)
  return { setIsLoading, isLoading }
})
