import { ref } from 'vue'
type ModalVariants = 'create-area' | 'update-area' | 'update-terminal' | 'create-terminal'

export const useModal = () => {
  const isModalOpen = ref<ModalVariants | ''>('')

  function openModal(value: ModalVariants) {
    isModalOpen.value = value
  }
  function closeModal() {
    isModalOpen.value = ''
  }

  return {
    isModalOpen,
    closeModal,
    openModal,
  }
}

export type ModalStore = ReturnType<typeof useModal>
