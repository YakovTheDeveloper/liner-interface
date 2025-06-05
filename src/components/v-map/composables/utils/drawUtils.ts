import type { Ref } from 'vue'
import type { Area, Point, TerminalPoint } from '../../types'
export const SNAP_DISTANCE = 15
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y
    const xj = polygon[j].x,
      yj = polygon[j].y

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function isPointUsedInLines(
  point: { x: number; y: number },
  lines: typeof lines.value,
): boolean {
  return lines.some((line) => line.from === point || line.to === point)
}

export function isPointNearLineSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
  threshold: number,
): boolean {
  const dx = b.x - a.x
  const dy = b.y - a.y

  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return distance(p, a) < threshold // a === b

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const closest = {
    x: a.x + t * dx,
    y: a.y + t * dy,
  }

  return distance(p, closest) < threshold
}

export function drawCanvas(
  canvas: Ref<HTMLCanvasElement | null>,
  img: Ref<HTMLImageElement>,
  canvasWidth: number,
  canvasHeight: number,
  areas: Ref<Area[]>,
  currentArea: Ref<Area | null>,
  lines: Ref<{ from: Point; to: Point; id?: number }[]>,
  points: Ref<Point[]>,
  terminalPoints: Ref<TerminalPoint[]>,
) {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.drawImage(img.value, 0, 0, canvasWidth, canvasHeight)

  areas.value.forEach((area) => {
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

  if (currentArea.value) {
    ctx.beginPath()
    currentArea.value.points.forEach((pt, index) => {
      if (index === 0) ctx.moveTo(pt.x, pt.y)
      else ctx.lineTo(pt.x, pt.y)
    })

    if (currentArea.value.points.length > 2) {
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 165, 0, 0.2)'
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

  lines.value.forEach(({ from, to }) => {
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  points.value.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  terminalPoints.value.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 3
    ctx.stroke()
    if (point.direction != null && point.direction !== -1) {
      const angleRad = (point.direction * Math.PI) / 180
      const lineLength = 20

      const endX = point.x + Math.cos(angleRad) * lineLength
      const endY = point.y + Math.sin(angleRad) * lineLength

      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  })
}
