import { onMounted, ref, watch, watchEffect } from 'vue'
import type { Area, Point, TerminalPoint } from '../types'
import {
  distance,
  drawCanvas,
  isPointInPolygon,
  isPointNearLineSegment,
  isPointUsedInLines,
  SNAP_DISTANCE,
} from './utils/drawUtils'
import { useImageStore } from '@/stores/useImageStore'
import { useMapStore } from '@/stores/useMapStore'
import { createRoad, deleteRoad } from '@/api/api'
import { useLoadingStore } from '@/stores/loadingStore'
import type { Ref } from 'vue'
const DELETE_THRESHOLD = 6 // roughly equal to point radius
const JOIN_THRESHOLD = 12 // larger area to detect nearby point

export const useDrawTools = () => {
  const areas = ref<Area[]>([]),
    areaMode = ref<'none' | 'create' | 'edit'>('none'),
    currentArea = ref<Area | null>(null),
    points = ref<Point[]>([]),
    lines = ref<{ from: Point; to: Point; id?: number }[]>([]),
    routeMode = ref(false),
    tempPair = ref<Point[]>([]),
    terminalPoints = ref<TerminalPoint[]>([]),
    currentTerminalPoint = ref<TerminalPoint | null>(null),
    currentAreaToEdit = ref<Area | null>(null),
    currentAreaToCreate = ref<Area | null>(null),
    terminalPointMode = ref(false),
    imageStore = useImageStore()

  const lastPoint = ref<Point | null>(null)
  const canvas = ref<HTMLCanvasElement | null>(null)
  const canvasWidth = 800
  const canvasHeight = 600
  const img = ref(new Image())
  const mapStore = useMapStore()
  const loadingStore = useLoadingStore()
  const draw = () =>
    drawCanvas(
      canvas,
      img,
      canvasWidth,
      canvasHeight,
      areas,
      currentArea,
      lines,
      points,
      terminalPoints,
    )

  function findNearbyPoint(p: Point): Point | null {
    return points.value.find((pt) => distance(pt, p) < SNAP_DISTANCE) || null
  }

  async function handleClick(event: MouseEvent) {
    if (!canvas.value) return

    const x = event.offsetX
    const y = event.offsetY
    const clickPoint = { x, y }

    if (areaMode.value === 'edit') {
      if (!currentArea.value) {
        const hitArea = areas.value.find((area) => isPointInPolygon(clickPoint, area.points))
        if (hitArea) {
          currentArea.value = {
            id: hitArea.id,
            points: [...hitArea.points],
            objectId: hitArea.objectId,
          }
        }
      } else {
        // In edit mode with selected area — allow adding/removing points
        const existing = currentArea.value.points.find(
          (p) => distance(p, clickPoint) < SNAP_DISTANCE,
        )
        if (existing) {
          // Remove point if clicked on it
          currentArea.value.points = currentArea.value.points.filter((p) => p !== existing)
        } else {
          // Add point to area
          currentArea.value.points.push(clickPoint)
        }
      }
      draw()
      return
    }

    if (areaMode.value === 'create' && currentArea.value) {
      const exists = currentArea.value.points.find((p) => distance(p, clickPoint) < SNAP_DISTANCE)
      if (exists) {
        currentArea.value.points = currentArea.value.points.filter((p) => p !== exists)
      } else {
        currentArea.value.points.push(clickPoint)
      }
      draw()
      return
    }

    //terminals
    if (terminalPointMode.value) {
      const exists = terminalPoints.value.find((p) => distance(p, clickPoint) < SNAP_DISTANCE)
      if (exists) {
        terminalPoints.value = terminalPoints.value.filter((p) => p !== exists)
      } else {
        terminalPoints.value.push({
          ...clickPoint,
          direction: -1,
          terminalId: -1,
        })
      }
      draw()
      return
    }

    // 1. DELETE: Exact (or close) click on point = delete
    const exactPoint = points.value.find((pt) => distance(pt, clickPoint) < DELETE_THRESHOLD)
    const clickedLine = lines.value.find((line) =>
      isPointNearLineSegment(clickPoint, line.from, line.to, DELETE_THRESHOLD),
    )

    if (clickedLine) {
      try {
        loadingStore.setIsLoading(true)
        await deleteRoad(clickedLine.id)
        lines.value = lines.value.filter((line) => line.id !== clickedLine.id)
        const maybeOrphanedPoints = [clickedLine.from, clickedLine.to]

        maybeOrphanedPoints.forEach((pt) => {
          const stillUsed = isPointUsedInLines(pt, lines.value)
          if (!stillUsed) {
            points.value = points.value.filter((p) => p !== pt)
            if (lastPoint.value === pt) {
              lastPoint.value = null
            }
          }
        })
      } catch (error) {
        console.error('Failed to delete road (join):', error)
      } finally {
        loadingStore.setIsLoading(false)
      }
      return
    }

    if (exactPoint) {
      points.value = points.value.filter((pt) => pt !== exactPoint)
      lines.value = lines.value.filter((line) => line.from !== exactPoint && line.to !== exactPoint)

      try {
        loadingStore.setIsLoading(true)
      } catch (error) {
        console.error('Failed to create road (join):', error)
      } finally {
        loadingStore.setIsLoading(false)
        lastPoint.value = null
      }

      if (lastPoint.value === exactPoint) {
        lastPoint.value = null
      }

      draw()
      return
    }

    const nearbyPoint = points.value.find(
      (pt) =>
        distance(pt, clickPoint) >= DELETE_THRESHOLD && distance(pt, clickPoint) < JOIN_THRESHOLD,
    )

    if (nearbyPoint && lastPoint.value) {
      const newRoad = {
        from: lastPoint.value,
        to: nearbyPoint,
      }

      const target = nearbyPoint
      const source = { x: newRoad.from.x, y: newRoad.from.y }
      const roadPayload = {
        mapId: mapStore.currentMap?.ulid,
        source,
        target,
      }

      try {
        loadingStore.setIsLoading(true)
        const createdPoint = await createRoad(roadPayload)
        points.value.push(target)
        lines.value.push({ ...newRoad, id: createdPoint.data.id })
      } catch (error) {
        console.error('Failed to create road (join):', error)
      } finally {
        loadingStore.setIsLoading(false)
        lastPoint.value = null
      }

      draw()
      return
    }

    if (nearbyPoint) {
      lastPoint.value = nearbyPoint
      draw()
      return
    }

    if (!nearbyPoint && lastPoint.value) {
      const newRoad = {
        from: lastPoint.value,
        to: clickPoint,
      }

      const target = clickPoint
      const source = { x: newRoad.from.x, y: newRoad.from.y }
      const roadPayload = {
        mapId: mapStore.currentMap?.ulid,
        source,
        target,
      }

      try {
        loadingStore.setIsLoading(true)
        const createdPoint = await createRoad(roadPayload)
        points.value.push(target)
        lines.value.push({ ...newRoad, id: createdPoint.data.id })
      } catch (error) {
        console.error('Failed to create road (join):', error)
      } finally {
        loadingStore.setIsLoading(false)
        lastPoint.value = null
      }

      draw()
      return
    }

    if (!nearbyPoint && !lastPoint.value) {
      points.value.push(clickPoint)
      lastPoint.value = clickPoint
      draw()
      return
    }
  }

  function toggleRouteMode() {
    routeMode.value = !routeMode.value

    if (routeMode.value) {
      lastPoint.value = null
    }
  }

  onMounted(() => {
    img.value.onload = draw
  })

  watchEffect(() => {
    img.value.src = imageStore.imageUrl || ''
    draw()
  })

  watch(points, draw, { deep: true })
  watch(lines, draw, { deep: true })

  return {
    canvas,
    currentAreaToEdit,
    currentTerminalPoint,
    routeMode,
    lastPoint,
    terminalPointMode,
    currentArea,
    areas,
    areaMode,
    terminalPoints,
    draw,
    canvasWidth,
    toggleRouteMode,
    points,
    lines,
    canvasHeight,
    findNearbyPoint,
    handleClick,
  }
}
