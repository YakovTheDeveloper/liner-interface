<template>
    <div>
        <button @click="toggleRouteMode" :class="routeMode ? 'button_active' : ''">{{ routeMode ? 'Завершить маршрут' :
            'Создание маршрута' }}</button>
        <button v-if="areaMode === 'none'" @click="startCreateArea">Создание областей</button>
        <button v-if="areaMode === 'create'" @click="saveCurrentArea" class="button_active">Сохранить область</button>
        <button @click="startEditArea" v-if="areaMode === 'none'">Изменение областей</button>
        <button @click="commitAreaEdit" v-if="areaMode === 'edit'"
            :class="areaMode === 'edit' && 'button_active'">Сохранить изменение
            областей</button>
        <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" @click="handleClick"
            style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
interface Area {
    id: string;
    points: Point[];
    attachedRoutePoints: Point[];
    objectInfo?: any;
}
interface Point {
    x: number;
    y: number;
}
const lastPoint = ref<Point | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const canvasWidth = 800;
const canvasHeight = 600;
const imageSrc = '/mock-map.png';

const areas = ref<Area[]>([]);
const areaMode = ref<'none' | 'create' | 'edit'>('none');
const currentArea = ref<Area | null>(null); // For create or edit
const points = ref<Point[]>([]);
const lines = ref<{ from: Point; to: Point }[]>([]);
const routeMode = ref(false);
const tempPair = ref<Point[]>([]);

const img = new Image();
img.src = imageSrc;

// Distance check threshold for snapping/deletion
const SNAP_DISTANCE = 15;

// Toggle route creation mode
function toggleRouteMode() {
    routeMode.value = !routeMode.value;
    lastPoint.value = null;
}

function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function findNearbyPoint(p: Point): Point | null {
    return points.value.find((pt) => distance(pt, p) < SNAP_DISTANCE) || null;
}

function handleClick(event: MouseEvent) {
    if (!canvas.value) return;

    const x = event.offsetX;
    const y = event.offsetY;
    const clickPoint = { x, y };

    if (areaMode.value === 'edit') {
        if (!currentArea.value) {
            const hitArea = areas.value.find(area => isPointInPolygon(clickPoint, area.points));
            if (hitArea) {
                currentArea.value = {
                    id: hitArea.id,
                    points: [...hitArea.points],
                    attachedRoutePoints: [...hitArea.attachedRoutePoints],
                    objectInfo: hitArea.objectInfo
                };
            }
        } else {
            // In edit mode with selected area — allow adding/removing points
            const existing = currentArea.value.points.find(p => distance(p, clickPoint) < SNAP_DISTANCE);
            if (existing) {
                // Remove point if clicked on it
                currentArea.value.points = currentArea.value.points.filter(p => p !== existing);
            } else {
                // Add point to area
                currentArea.value.points.push(clickPoint);
            }
        }
        draw();
        return;
    }

    if (areaMode.value === 'create' && currentArea.value) {
        const exists = currentArea.value.points.find(p => distance(p, clickPoint) < SNAP_DISTANCE);
        if (exists) {
            currentArea.value.points = currentArea.value.points.filter(p => p !== exists);
        } else {
            currentArea.value.points.push(clickPoint);
        }
        draw();
        return;
    }

    // const rect = canvas.value.getBoundingClientRect();


    const hitPointIndex = points.value.findIndex((pt) => distance(pt, clickPoint) < SNAP_DISTANCE);
    if (hitPointIndex !== -1) {
        const hitPoint = points.value[hitPointIndex];

        // Remove point
        points.value.splice(hitPointIndex, 1);

        // Remove all lines connected to this point
        lines.value = lines.value.filter(
            (line) => line.from !== hitPoint && line.to !== hitPoint
        );

        // Reset lastPoint if it was this one
        if (lastPoint.value === hitPoint) {
            lastPoint.value = null;
        }

        draw();
        return;
    }

    const hitLine = lines.value.find((line) => {
        const d1 = distance(line.from, clickPoint);
        const d2 = distance(line.to, clickPoint);
        const lineLen = distance(line.from, line.to);
        return Math.abs(d1 + d2 - lineLen) < SNAP_DISTANCE;
    });
    if (hitLine) {
        lines.value = lines.value.filter((line) => line !== hitLine);
        draw();
        return;
    }

    if (!routeMode.value) return;

    // Snap to existing point if close
    const nearby = findNearbyPoint(clickPoint);
    const finalPoint = nearby || clickPoint;
    if (!nearby) points.value.push(finalPoint);

    if (lastPoint.value) {
        lines.value.push({ from: lastPoint.value, to: finalPoint });
    }
    lastPoint.value = finalPoint;

    draw();
}

function openObjectSelector(area: Area) {
    const selectedObject = prompt('Введите объект для области:');
    if (selectedObject) {
        area.objectInfo = selectedObject;

        // Optionally: attach nearby route points
        area.attachedRoutePoints = points.value.filter(p =>
            isPointInPolygon(p, area.points)
        );

        draw();
    }
}
function saveCurrentArea() {
    if (currentArea.value) {
        const newArea: Area = {
            id: currentArea.value.id,
            points: [...currentArea.value.points],
            attachedRoutePoints: [...currentArea.value.attachedRoutePoints],
            objectInfo: currentArea.value.objectInfo // assuming it's a string or plain data
        };
        areas.value.push(newArea);
        currentArea.value = null;
        areaMode.value = 'none';
        draw();
    }
}


onMounted(() => {
    img.onload = draw;

    canvas.value?.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const rect = canvas.value!.getBoundingClientRect();
        const x = event.offsetX;
        const y = event.offsetY;
        const clickPoint = { x, y };

        const clickedArea = areas.value.find(area => isPointInPolygon(clickPoint, area.points));
        if (clickedArea) {
            openObjectSelector(clickedArea);
        }
    });
});

function draw() {
    if (!canvas.value) return;

    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    areas.value.forEach(area => {
        const ctx = canvas.value!.getContext('2d')!;
        ctx.beginPath();
        area.points.forEach((pt, index) => {
            if (index === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw current area in creation/edit mode
    // Draw current area in creation/edit mode
    if (currentArea.value) {
        ctx.beginPath();
        currentArea.value.points.forEach((pt, index) => {

            if (index === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });



        // 👇 Automatically close the polygon when more than 2 points
        if (currentArea.value.points.length > 2) {
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 165, 0, 0.2)'; // light orange
            ctx.fill();
        }

        ctx.strokeStyle = 'orange';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        currentArea.value.points.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'orange';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }


    // Draw lines
    lines.value.forEach(({ from, to }) => {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.stroke();
    });

    // Draw points
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


function startCreateArea() {
    areaMode.value = 'create';
    currentArea.value = {
        id: crypto.randomUUID(),
        points: [],
        attachedRoutePoints: [],
    };
}

function startEditArea() {
    areaMode.value = 'edit';
    currentArea.value = null;
}

function commitAreaEdit() {
    if (!currentArea.value) return;
    const index = areas.value.findIndex(a => a.id === currentArea.value!.id);
    if (index !== -1) {
        areas.value[index] = currentArea.value!;
    }
    currentArea.value = null;
    areaMode.value = 'none';
    draw();
}

function isPointInPolygon(point: Point, polygon: Point[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

onMounted(() => {
    img.onload = draw;
});

watch(points, draw, { deep: true });
watch(lines, draw, { deep: true });
</script>

<style scoped>
canvas {
    display: block;
    max-width: 100%;
    height: auto;
    margin-top: 1rem;
}

button {
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    font-weight: bold;
}

.button_active {
    background-color: rgb(36, 120, 36);
    color: white;
}
</style>
