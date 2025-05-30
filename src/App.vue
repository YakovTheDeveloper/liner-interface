<script setup lang="ts">
import FIleLoader from '@/components/file-loader/FIleLoader.vue'
import VMap from '@/components/v-map/VMap.vue'
import { useMapStore } from './stores/useMapStore'
import { useMapObjectsPresentationStore } from './stores/useMapObjectsPresentation'

const mapStore = useMapStore()
const mapObjectsPresentationStore = useMapObjectsPresentationStore()
</script>

<template>
  <div class="container">
    <FIleLoader />
    <VMap v-if="mapStore.currentMap" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
</style>
