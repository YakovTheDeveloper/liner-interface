<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
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
    </div>

    <div class="form-group">
      <label for="terminalId">Select Terminal ID:</label>
      <select id="terminalId" v-model="terminalId" required class="form-control">
        <option v-for="id in terminalIds" :key="id" :value="id">
          {{ id }}
        </option>
      </select>
    </div>

    <!-- Direction Picker -->
    <div class="direction-picker">
      <canvas ref="directionCanvas" width="200" height="200" @click="handleCanvasClick" />
    </div>

    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { TerminalPoint } from '../types'

const props = defineProps<{
  current: TerminalPoint
  onFinish: (direction: number, terminalId: number) => void
}>()

const direction = ref<number | null>(props.current.direction ?? null)
const terminalId = ref<number | null>(props.current.terminalId ?? null)
const terminalIds = ref<number[]>([1, 2, 3, 4, 5])

const handleSubmit = () => {
  console.log('Submitting with direction:', direction.value, 'terminalId:', terminalId.value)
  if (direction.value !== null && terminalId.value !== null) {
    props.onFinish(direction.value, terminalId.value)
  }
}

// Direction Picker Logic
const directionCanvas = ref<HTMLCanvasElement | null>(null)

const drawDirectionCircle = () => {
  const canvas = directionCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const radius = canvas.width / 2
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw base circle
  ctx.beginPath()
  ctx.arc(radius, radius, radius - 10, 0, 2 * Math.PI)
  ctx.strokeStyle = '#aaa'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw direction line
  if (direction.value !== null) {
    const angleRad = (direction.value * Math.PI) / 180
    const x = radius + Math.cos(angleRad) * (radius - 15)
    const y = radius + Math.sin(angleRad) * (radius - 15)

    ctx.beginPath()
    ctx.moveTo(radius, radius)
    ctx.lineTo(x, y)
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 10
    ctx.stroke()
  }
}

const handleCanvasClick = (e: MouseEvent) => {
  const canvas = directionCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  const dx = x - centerX
  const dy = y - centerY

  let angle = (Math.atan2(dy, dx) * 180) / Math.PI
  if (angle < 0) angle += 360

  direction.value = Math.round(angle)
}

onMounted(drawDirectionCircle)
watch(direction, drawDirectionCircle)
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
  border-radius: 50%;
  cursor: pointer;
}
</style>
