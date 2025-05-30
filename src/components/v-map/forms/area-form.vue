<template>
  <div>
    <div class="form-inputs">
      <Select :options="selectOptions" v-model="modelValue" />
    </div>
    <FormActions @close="onClose" @submit="onFinish(modelValue)" @cancel="onCancel" />
  </div>
</template>

<script setup lang="ts">
import Select from '@/components/shared/select/Select.vue'
import FormActions from './shared/form-actions.vue'
import { computed, ref } from 'vue'
import { useMapStore } from '@/stores/useMapStore'

const mapStore = useMapStore()

const selectOptions = computed(() => {
  return (
    mapStore.currentMapObjects?.map((obj) => ({
      value: obj.ulid,
      label: obj.title,
    })) || []
  )
})

defineProps<{
  onClose: VoidFunction
  onFinish: (objectId: number) => void
  onCancel: () => void
}>()

const modelValue = ref<string | null>('')
</script>

<style scoped></style>
