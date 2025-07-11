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

  const mapObjects = ref<ObjectsResponse[]>([])
  const mapTerminals = ref<ObjectsResponse[]>([])

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

  const getMapObjects = async () => {
    try {
      const result = await getObjects()
      mapObjects.value = result.data
    } catch (error) {}
  }

  const getTerminals = async () => {
    try {
      const result = await fetchTerminalObjects()
      mapTerminals.value = result.data
    } catch (error) {}
  }

  watchEffect(() => {
    if (!currentMap.value) return
    console.log(`output->currentMap`, currentMap.value)
    imageStore.imageUrl = 'http://api.vdnh.test.itlabs.top' + currentMap.value.image
  })

  getMapObjects()
  getTerminals()

  return {
    maps,
    currentMap,
    currentMapObjects: mapObjects,
    setCurrentMap,
  }
})
