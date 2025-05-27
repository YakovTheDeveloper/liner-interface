<template>
    <div>
        <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" @click="addPoint"
            style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const imageSrc = ref('/mock-map.png');
const points = ref<{ x: number; y: number }[]>([]);
const canvasWidth = 800;
const canvasHeight = 600;

const img = new window.Image();
img.src = imageSrc.value;

function draw() {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    points.value.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function addPoint(event: MouseEvent) {
    if (!canvas.value) return;
    const rect = canvas.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    points.value.push({ x, y });
    draw();
}

onMounted(() => {
    img.onload = () => {
        draw();
    };
});

watch(points, draw, { deep: true });
watch(imageSrc, () => {
    img.src = imageSrc.value;
});
</script>

<style scoped>
canvas {
    display: block;
    max-width: 100%;
    height: auto;
}
</style>