<template>
  <div>
    <div class="form-inputs">
      <Select />
    </div>
    <FormActions @close="onClose" @submit="onFinish(modelValue)" />
  </div>
</template>

<script setup lang="ts">
import Select from '@/components/shared/select/Select.vue'
import FormActions from './shared/form-actions.vue'
import { ref } from 'vue'
defineProps<{
  onClose: VoidFunction
  onFinish: (objectId: number) => void
}>()

const modelValue = ref(-1)
</script>

<style scoped></style>
