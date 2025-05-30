<script setup lang="ts">
import { useImageStore } from '@/stores/useImageStore'
import { useMapStore } from '@/stores/useMapStore'
import { computed, ref } from 'vue'

const mapStore = useMapStore()

const selectedMap = computed({
  get: () => mapStore.currentMap,
  set: (value) => (mapStore.currentMap = value),
})
</script>

<template>
  <div class="file-upload-container">
    <p class="title">Карта</p>
    <form class="file-form">
      <select v-model="selectedMap" class="map-select">
        <option disabled value="">Выберите карту...</option>
        <option v-for="map in mapStore.maps" :key="map.ulid" :value="map">
          {{ map.name }}
        </option>
      </select>
    </form>
    <button @click="mapStore.currentMap = null">reset</button>
  </div>
</template>

<style scoped lang="scss">
.map-select {
  width: 100%;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e8e8e8;
  }
}

.file-input-hidden {
  display: none;
}

.file-form {
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

  &_active {
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
