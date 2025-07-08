<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-inputs">
      <!-- <div class="form-group">
        <label for="direction">Direction (0-360 degrees):</label>
        <input
          id="direction"
          type="number"
          v-model="direction"
          min="0"
          max="360"
          required
          class="form-control"
        />
      </div> -->
      <div>
        Выберите
        <div>x:{{ personPoint?.x }}</div>
        <div>y:{{ personPoint?.y }}</div>
      </div>

      <!-- <div class="form-group">
        <label for="terminalId">Select Terminal ID:</label>
        <select id="terminalId" v-model="terminalId" required class="form-control">
          <option v-for="id in terminalIds" :key="id" :value="id">
            {{ id }}
          </option>
        </select>
      </div> -->

      <!-- Direction Picker -->
      <!-- Canvas for displaying image -->
      <div class="direction-picker">
        <canvas
          ref="directionCanvas"
          :width="CANVAS_WIDTH"
          :height="CANVAS_HEIGHT"
          @click="onCanvasClick"
        />
      </div>
    </div>

    <FormActions @close="onClose" @submit="handleSubmit" />
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FormActions from './shared/form-actions.vue'
import { useImageStore } from '@/stores/useImageStore'
import { storeToRefs } from 'pinia'
import type { Point } from '../types'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

const props = defineProps<{
  current: { x: number; y: number }
  personPoint?: { x: number; y: number }
  onClose: VoidFunction
  onFinish: (personPoint: Point, terminalId?: number) => void
}>()

const personPoint = ref<Point | null>(props.personPoint || null)
const directionCanvas = ref<HTMLCanvasElement | null>(null)
const imageStore = storeToRefs(useImageStore())

const onCanvasClick = (event) => {
  const x = event.offsetX
  const y = event.offsetY
  const clickPoint = { x, y }
  personPoint.value = clickPoint
  drawImageCanvas()
}

const drawImageCanvas = () => {
  console.log(`output->draw`)
  const canvas = directionCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const image = new Image()
  image.src = imageStore.imageUrl.value
  image.width = 800
  image.height = 600
  const point = { x: props.current.x, y: props.current.y }
  image.onload = () => {
    const imageWidth = 800
    const imageHeight = 600

    const centerX = props.current.x
    const centerY = props.current.y

    // Crop top-left to center (centerX, centerY)
    let sx = centerX - CANVAS_WIDTH / 2
    let sy = centerY - CANVAS_HEIGHT / 2

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_WIDTH)

    ctx.beginPath()
    ctx.arc(point.x, point.y, 20, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()

    if (personPoint.value) {
      const angle = Math.atan2(
        props.current.y - personPoint.value.y,
        props.current.x - personPoint.value.x,
      )
      const size = 20

      ctx.beginPath()
      ctx.moveTo(
        personPoint.value.x + size * Math.cos(angle),
        personPoint.value.y + size * Math.sin(angle),
      )
      ctx.lineTo(
        personPoint.value.x + size * Math.cos(angle + 2.6),
        personPoint.value.y + size * Math.sin(angle + 2.6),
      )
      ctx.lineTo(
        personPoint.value.x + size * Math.cos(angle - 2.6),
        personPoint.value.y + size * Math.sin(angle - 2.6),
      )
      ctx.closePath()

      ctx.fillStyle = 'red'
      ctx.fill()
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}

const handleSubmit = () => {
  if (!personPoint.value) return
  props.onFinish(personPoint.value)
  // console.log('Submitting with direction:', direction.value, 'terminalId:', terminalId.value)
  // if (direction.value !== null && terminalId.value !== null) {
  //   props.onFinish(direction.value, terminalId.value)
  // }
}

onMounted(drawImageCanvas)
</script>

<style scoped lang="scss">
.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
}

.btn {
  margin-top: 1rem;
}

.direction-picker {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

canvas {
  border: 1px solid #ccc;
  // border-radius: 50%;
  transform: scale(0.5);
  cursor: pointer;
}
</style>
