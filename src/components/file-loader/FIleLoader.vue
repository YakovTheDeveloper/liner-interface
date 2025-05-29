<script setup lang="ts">
import { useImageStore } from '@/stores/useImageStore'
import { ref } from 'vue'

const file = ref<File | null>(null)
const fileName = ref('')
const isLoading = ref(false)

// Access Pinia store
const imageStore = useImageStore()

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
    fileName.value = target.files[0].name

    imageStore.imageUrl = URL.createObjectURL(target.files[0])
  }
}

function handleSubmit() {
  if (!file.value) return
  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false
  }, 1500)
}
</script>

<template>
  <div class="file-upload-container">
    <p class="title">Карта</p>
    <form @submit.prevent="handleSubmit" class="file-form">
      <label class="file-label">
        <!-- Hidden actual file input -->
        <input type="file" @change="handleFileChange" class="file-input-hidden" />

        <!-- Custom styled button and file name display -->
        <span :class="['file-custom', fileName && 'file-custom_active']">
          {{ fileName || 'Выберите карту...' }}
        </span>
      </label>
    </form>
  </div>
</template>

<style scoped lang="scss">
.file-input-hidden {
  display: none;
}

.file-form{
    padding: 12px 0 24px;
}

.file-label {
  display: inline-block;
  cursor: pointer;
  width: 100%;
}
.title {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  padding: 0 0 8px;
  position: relative;
  width: fit-content;
}

.title::after {
  content: '';
  position: absolute;
  top: 3px;
  right: -7px;
  width: 4px;
  height: 4px;
  background-color: red;
  border-radius: 50%;
}

.file-custom {
  display: inline-block;
  padding: 3px 40px 3px 7px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  box-shadow: 0 1px 2px 0 #f8fafc;
  color: #333;
  transition: background-color 0.2s;
  width: 100%;

  &_active{
    font-weight: 600;
  }
}

.file-custom:hover {
  background-color: #e8e8e8;
}

.submit-btn {
  margin-left: 12px;
  padding: 8px 16px;
  font-size: 14px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
