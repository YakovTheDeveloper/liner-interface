<template>
  <div class="form-actions">
    <button class="button button-primary" type="submit" @click="onAccept">Подтвердить</button>
    <button class="button button-secondary" @click="onCancel">Отмена</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  onClose: VoidFunction
  onSubmit: VoidFunction
  onCancel: VoidFunction
}>()

const onAccept = () => {
  props.onSubmit()
  props.onClose()
}
</script>
<style scoped lang="scss">
.button {
  margin: 0.25rem;
}
.form-actions {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  padding: 8px 10px;
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  border-top: 1px solid #e2e8f0;
}
</style>
