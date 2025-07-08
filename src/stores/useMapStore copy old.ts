import {
  getMaps as fetchMaps,
  getObjects,
  getTerminalObjects as fetchTerminalObjects,
} from '@/api/api-maps-objects'
import type { MapItself, ObjectsResponse } from '@/api/types'
import { defineStore } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import { useImageStore } from './useImageStore'

export const useMapStore = defineStore('map-store', () => {
  const imageStore = useImageStore()

  const maps = ref<MapItself[]>([])

  const currentMap = ref<MapItself | null>(null)

  const mapObjects = ref<Record<string, ObjectsResponse[]>>({})
  const mapTerminals = ref<Record<string, ObjectsResponse[]>>({})
  const currentMapObjects = computed(() => {
    if (!currentMap.value) return []
    return mapObjects.value[currentMap.value.ulid]
  })

  const setCurrentMap = (map: MapItself) => {
    currentMap.value = map
  }

  const getMaps = async () => {
    try {
      const result = await fetchMaps()
      maps.value = result.data
    } catch (error) {}
  }

  getMaps()

  const getMapObjects = async (mapId: string) => {
    try {
      const result = await getObjects(mapId)
      mapObjects.value = { ...mapObjects.value, [mapId]: result.data }
    } catch (error) {}
  }

  const getTerminals = async (mapId: string) => {
    try {
      const result = await fetchTerminalObjects(mapId)
      mapTerminals.value = { ...mapTerminals.value, [mapId]: result.data }
    } catch (error) {}
  }

  watchEffect(() => {
    if (!currentMap.value) return
    console.log(`output->currentMap`, currentMap.value)
    getMapObjects(currentMap.value.ulid)
    getTerminals(currentMap.value.ulid)
    imageStore.imageUrl = 'http://api.vdnh.test.itlabs.top' + currentMap.value.image
  })

  return {
    maps,
    currentMap,
    currentMapObjects,
    setCurrentMap,
  }
})
