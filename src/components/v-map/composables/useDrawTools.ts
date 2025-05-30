import { onMounted, ref, watch, watchEffect } from 'vue'
import type { Area, Point, TerminalPoint } from '../types'
import { distance, isPointInPolygon, SNAP_DISTANCE } from './utils/drawUtils'
import { useImageStore } from '@/stores/useImageStore'
import { useMapStore } from '@/stores/useMapStore'
import { createRoad, deleteRoad } from '@/api/api'

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

  function findNearbyPoint(p: Point): Point | null {
    return points.value.find((pt) => distance(pt, p) < SNAP_DISTANCE) || null
  }

  function handleClick(event: MouseEvent) {
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

    const hitPointIndex = points.value.findIndex((pt) => distance(pt, clickPoint) < SNAP_DISTANCE)
    if (hitPointIndex !== -1) {
      const hitPoint = points.value[hitPointIndex]

      points.value.splice(hitPointIndex, 1)

      lines.value = lines.value.filter((line) => line.from !== hitPoint && line.to !== hitPoint)

      // Reset lastPoint if it was this one
      if (lastPoint.value === hitPoint) {
        lastPoint.value = null
      }

      draw()
      return
    }

    const hitLine = lines.value.find((line) => {
      const d1 = distance(line.from, clickPoint)
      const d2 = distance(line.to, clickPoint)
      const lineLen = distance(line.from, line.to)
      return Math.abs(d1 + d2 - lineLen) < SNAP_DISTANCE
    })

    if (hitLine) {
      if (hitLine.id !== undefined) {
        deleteRoad(hitLine.id)
      }
      const newLines = lines.value.filter(
        (line) =>
          line !== hitLine &&
          line.id !== hitLine.id &&
          !(
            line.from.x === hitLine.from.x &&
            line.from.y === hitLine.from.y &&
            line.to.x === hitLine.to.x &&
            line.to.y === hitLine.to.y
          ),
      )
      lines.value = newLines

      console.log(`output-lines.value`, lines.value.length, newLines.length)
      draw()
      return
    }

    if (!routeMode.value) return

    const nearby = findNearbyPoint(clickPoint)
    const finalPoint = nearby || clickPoint

    if (!nearby) {
      points.value.push(finalPoint)
    }

    // If we already have a starting point, draw a road from it to this new point
    if (lastPoint.value) {
      const newRoad = {
        from: lastPoint.value,
        to: finalPoint,
      }

      lines.value.push(newRoad)

      // Optional: send road to backend
      const roadPayload = {
        mapId: mapStore.currentMap?.ulid,
        source: { x: newRoad.from.x, y: newRoad.from.y },
        target: { x: newRoad.to.x, y: newRoad.to.y },
      }

      console.log('Sending road:', JSON.stringify(roadPayload, null, 2))

      createRoad(roadPayload)

      // sendToBackend(roadPayload) // implement this if needed

      // Make the end point the new start
      lastPoint.value = finalPoint
    } else {
      // First point selected
      lastPoint.value = finalPoint
    }

    draw()
  }

  function draw() {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.drawImage(img.value, 0, 0, canvasWidth, canvasHeight)

    areas.value.forEach((area) => {
      const ctx = canvas.value!.getContext('2d')!
      ctx.beginPath()
      area.points.forEach((pt, index) => {
        if (index === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })
      ctx.closePath()
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
      ctx.fill()
      ctx.strokeStyle = 'green'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw current area in creation/edit mode
    // Draw current area in creation/edit mode
    if (currentArea.value) {
      ctx.beginPath()
      currentArea.value.points.forEach((pt, index) => {
        if (index === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })

      // 👇 Automatically close the polygon when more than 2 points
      if (currentArea.value.points.length > 2) {
        ctx.closePath()
        ctx.fillStyle = 'rgba(255, 165, 0, 0.2)' // light orange
        ctx.fill()
      }

      ctx.strokeStyle = 'orange'
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])

      currentArea.value.points.forEach((pt) => {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = 'orange'
        ctx.fill()
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    // Draw lines
    lines.value.forEach(({ from, to }) => {
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 3
      ctx.stroke()
    })

    // Draw points
    points.value.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = 'red'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    terminalPoints.value.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI)
      ctx.fillStyle = 'blue'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 3
      ctx.stroke()
      if (point.direction != null && point.direction !== -1) {
        const angleRad = (point.direction * Math.PI) / 180 // convert to radians
        const lineLength = 20

        const endX = point.x + Math.cos(angleRad) * lineLength
        const endY = point.y + Math.sin(angleRad) * lineLength

        ctx.beginPath()
        ctx.moveTo(point.x, point.y)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
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
