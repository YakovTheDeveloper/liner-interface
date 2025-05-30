import { getAreas, getRoads } from '@/api/api'
import type { AreaOutput, RoadOutput } from '@/api/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useMapStore } from './useMapStore'

export const useMapObjectsPresentationStore = defineStore('map-store-presentation', () => {
  const mapStore = useMapStore()

  const areas = ref<AreaOutput[]>([])
  const roads = ref<RoadOutput[]>([])

  const fetchAreas = async () => {
    try {
      const res = await getAreas()
      areas.value = res.data
    } catch (error) {}
  }

  const fetchRoads = async () => {
    try {
      const res = await getRoads()
      roads.value = res.data
    } catch (error) {}
  }

  fetchAreas()
  fetchRoads()

  const currentMapAreas = computed(() => {
    if (!mapStore.currentMap) return
    return areas.value.filter((area) => area.mapId === mapStore.currentMap?.ulid)
  })

  const currentMapRoads = computed(() => {
    if (!mapStore.currentMap) return
    return roads.value.filter((road) => road.mapId === mapStore.currentMap?.ulid)
  })

  return {
    currentMapAreas,
    currentMapRoads,
  }
})
