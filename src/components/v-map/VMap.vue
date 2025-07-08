<template>
  <div>
    <!-- Route Mode Button -->
    <div class="buttons">
      <button
        @click="toggleRouteMode"
        :class="routeMode ? 'button_active' : ''"
        :disabled="areaMode === 'create' || areaMode === 'edit' || terminalPointMode"
      >
        {{ routeMode ? 'Завершить маршрут' : 'Создание маршрута' }}
      </button>

      <!-- Create Area Button -->
      <button
        v-if="areaMode === 'none'"
        @click="startCreateArea"
        :disabled="routeMode || areaMode === 'edit' || terminalPointMode"
      >
        Создание областей
      </button>

      <!-- Save Area Button -->
      <button v-if="areaMode === 'create'" @click="onAreaSaveClick" class="button_active">
        Сохранить область
      </button>

      <!-- Edit Area Button -->
      <button
        @click="startEditArea"
        v-if="areaMode === 'none'"
        :disabled="routeMode || areaMode === 'create' || terminalPointMode"
      >
        Изменение областей
      </button>

      <!-- Commit Area Edit Button -->
      <button
        @click="commitAreaEdit"
        v-if="areaMode === 'edit'"
        :style="{ width: '303px' }"
        :class="{ button_active: areaMode === 'edit' }"
      >
        Сохранить изменение областей
      </button>

      <!-- Terminal Mode Button -->
      <button
        @click="toggleTerminalCreationMode"
        :class="terminalPointMode ? 'button_active' : ''"
        :disabled="routeMode || areaMode === 'create' || areaMode === 'edit'"
      >
        {{ terminalPointMode ? 'Завершить создание терминалов' : 'Создание терминалов' }}
      </button>

      <!-- <button
        @click="
          () => {
            terminalPointMode = false
            routeMode = false
            areaMode = 'none'
          }
        "
      >
        Отмена
      </button> -->
    </div>

    <!-- Canvas -->
    <div class="canvas-container">
      <div v-if="loadingStore.isLoading" class="canvas-container-overlay">Строим маршрут...</div>
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @click="handleClick"
        style="border: 1px solid #ccc; cursor: crosshair"
      ></canvas>
      <MapModal :isOpen="modalStore.isModalOpen.value === 'update-terminal'" @close="onModalClose">
        <TerminalForm
          v-if="currentTerminalPoint"
          :current="currentTerminalPoint"
          @finish="onTerminalEdit"
          @close="onModalClose"
        />
      </MapModal>
      <MapModal :isOpen="modalStore.isModalOpen.value === 'create-terminal'" @close="onModalClose">
        <TerminalForm
          v-if="draftTerminalPoint"
          :current="draftTerminalPoint"
          @finish="onTerminalCreate"
          @close="onModalClose"
        />
      </MapModal>
      <MapModal :isOpen="modalStore.isModalOpen.value === 'update-area'" @close="onModalClose">
        <AreaForm @finish="onAreaEdit" @close="onModalClose" />
      </MapModal>
      <MapModal :isOpen="modalStore.isModalOpen.value === 'create-area'" @close="onModalClose">
        <AreaForm @finish="saveCurrentArea" @close="onModalClose" @cancel="cancelNewAreaCreation" />
      </MapModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, watch } from 'vue'
import MapModal from './map-modal/MapModal.vue'
import type { Area, Point, TerminalPoint } from './types'
import TerminalForm from './forms/terminal-form.vue'
import AreaForm from './forms/area-form.vue'
import { v4 as uuidv4 } from 'uuid'
import { createArea, createTerminal } from '@/api/api'
import { useDrawTools } from './composables/useDrawTools'
import { distance, isPointInPolygon, SNAP_DISTANCE } from './composables/utils/drawUtils'
import { useMapStore } from '@/stores/useMapStore'
import { useMapObjectsPresentationStore } from '@/stores/useMapObjectsPresentation'
import { useLoadingStore } from '@/stores/loadingStore'
import type { Terminal } from '@/entities/terminal'
import { useModal } from './composables/useModal'
const modalStore = useModal()

const mapStore = useMapStore()
const loadingStore = useLoadingStore()
const {
  areaMode,
  areas,
  currentArea,
  currentAreaToEdit,
  currentTerminalPoint,
  draftTerminalPoint,
  draw,
  lastPoint,
  routeMode,
  terminalPointMode,
  terminalPoints,
  canvas,
  canvasHeight,
  canvasWidth,
  handleClick,
  points,
  lines,
  toggleRouteMode,
  findNearbyPoint,
} = useDrawTools(modalStore)

const mapObjectsPresentationStore = useMapObjectsPresentationStore()

const onModalClose = () => {
  currentAreaToEdit.value = null
  currentTerminalPoint.value = null
  draftTerminalPoint.value = null
  currentTerminalPoint.value = null
  modalStore.closeModal()
}

function toggleTerminalCreationMode() {
  terminalPointMode.value = !terminalPointMode.value
}

function onTerminalEdit(direction: number, terminalId: number) {
  if (!currentTerminalPoint.value) return
  currentTerminalPoint.value.direction = direction
  currentTerminalPoint.value.terminalId = terminalId
  currentTerminalPoint.value = null
  modalStore.closeModal()
  draw()
}

async function onTerminalCreate(personPoint: Point) {
  console.log(`output->wtf`, draftTerminalPoint.value)
  if (!draftTerminalPoint.value) return
  modalStore.closeModal()
  const { x, y } = draftTerminalPoint.value
  try {
    loadingStore.setIsLoading(true)

    // требует terminalId для создания терминала
    const result = await createTerminal({
      x,
      y,
      mapId: mapStore.currentMap?.ulid!,
      personPoint,
    })
    terminalPoints.value.push({
      ...result.data,
      direction: personPoint,
    })
  } catch (error) {
  } finally {
    loadingStore.setIsLoading(false)
  }
  draw()
}

function openObjectSelector(area: Area) {
  modalStore.openModal('update-area')
  currentAreaToEdit.value = area
  //   const selectedObject = prompt('Введите объект для области:')
  //   if (selectedObject) {
  //     area.objectId = selectedObject

  //     // Optionally: attach nearby route points
  //     area.attachedRoutePoints = points.value.filter((p) => isPointInPolygon(p, area.points))

  //     draw()
  //   }
}

function editTerminal(point: TerminalPoint) {
  currentTerminalPoint.value = point
  modalStore.openModal('update-terminal')
  console.log(`output->point`, point)

  draw()
}

function onAreaSaveClick() {
  modalStore.openModal('create-area')
}

async function saveCurrentArea(objectId: number) {
  if (currentArea.value && mapStore.currentMap) {
    try {
      const result = await createArea({
        cords: [[...currentArea.value.points]],
        mapId: mapStore.currentMap.ulid,
        objectId,
      })

      const newArea: Area = {
        id: result.data.id.toString(),
        points: [...currentArea.value.points],
        attachedRoutePoints: [...currentArea.value.attachedRoutePoints],
        objectId,
      }
      areas.value.push(newArea)
    } catch (error) {}
    modalStore.closeModal()
    currentArea.value = null
    areaMode.value = 'none'
    draw()
  }
}

const cancelNewAreaCreation = () => {
  currentArea.value = null
  areaMode.value = 'none'
  modalStore.closeModal()
  draw()
}

function onAreaEdit() {
  if (!currentAreaToEdit.value) return

  currentAreaToEdit.value = null
  modalStore.closeModal()
  draw()
}

onMounted(() => {
  canvas.value?.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    const x = event.offsetX
    const y = event.offsetY
    const clickPoint = { x, y }

    const clickedTermial = terminalPoints.value.find((p) => distance(p, clickPoint) < SNAP_DISTANCE)
    if (clickedTermial) {
      editTerminal(clickedTermial)
    }

    const clickedArea = areas.value.find((area) => isPointInPolygon(clickPoint, area.points))
    if (clickedArea) {
      openObjectSelector(clickedArea)
    }
  })
})

function startCreateArea() {
  areaMode.value = 'create'
  currentArea.value = {
    id: uuidv4(),
    points: [],
    attachedRoutePoints: [],
  }
}

function startEditArea() {
  areaMode.value = 'edit'
  currentArea.value = null
}

function commitAreaEdit() {
  if (!currentArea.value) {
    areaMode.value = 'none'
    return
  }
  const index = areas.value.findIndex((a) => a.id === currentArea.value!.id)
  if (index !== -1) {
    areas.value[index] = currentArea.value!
  }
  currentArea.value = null
  areaMode.value = 'none'
  draw()
}

function seedRoadsFromBackend(
  roadsFromBackend: {
    id: number
    mapId: string
    source: Point
    target: Point
  }[],
) {
  roadsFromBackend.forEach(({ source, target, id }) => {
    const existingSource = findNearbyPoint(source) || { ...source }
    const existingTarget = findNearbyPoint(target) || { ...target }

    if (!findNearbyPoint(source)) points.value = [...points.value, existingSource]
    if (!findNearbyPoint(target)) points.value = [...points.value, existingTarget]

    // Add road to lines
    lines.value = [
      ...lines.value,
      {
        id,
        from: existingSource,
        to: existingTarget,
      },
    ]
  })

  draw()
}

function seedTerminalsFromBackend(terminalsFromBackend: Terminal[]) {
  terminalPoints.value = terminalsFromBackend.map(({ terminalId, x, y }) => ({
    direction: -1,
    x,
    y,
    terminalId,
  }))

  draw()
}

watch(
  () => mapObjectsPresentationStore.currentMapAreas,
  () => {
    console.log(
      `output->mapObjectsPresentationStore.currentMapAreas`,
      mapObjectsPresentationStore.currentMapAreas,
    )

    areas.value =
      mapObjectsPresentationStore.currentMapAreas?.map(
        ({ cords, id, mapId, nodeId, objectId }) => ({
          id,
          mapId,
          nodeId,
          objectId,
          points: cords[0],
        }),
      ) || []
  },
)

watch(
  () => mapObjectsPresentationStore.currentMapRoads,
  (roads) => roads && seedRoadsFromBackend(roads),
  { immediate: true },
)

watch(
  () => mapObjectsPresentationStore.currentMapTerminals,
  (terminals) => terminals && seedTerminalsFromBackend(terminals),
  { immediate: true },
)
</script>

<style scoped lang="scss">
canvas {
  display: block;
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
}

.canvas-container {
  position: relative;

  &-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    z-index: 10;
  }
}

.buttons {
  display: flex;
  gap: 8px;
}

button {
  cursor: pointer;
  padding: 4px 8px;
  background-color: #fff;
  color: #334155;
  transition-property: box-shadow;
  transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
  font-size: 14px;
  border: 0;
  line-height: 1.5;
  border-radius: 4px;
  box-shadow:
    0 0 0 1px #cbd5e1,
    0 1px 1px 0 rgba(15, 23, 41, 0.1),
    0 2px 5px 0 rgba(52, 66, 86, 0.1);
  &:disabled {
    opacity: 0.5;
    cursor: default;
    &:hover {
      box-shadow:
        0 0 0 1px #cbd5e1,
        0 1px 1px 0 rgba(15, 23, 41, 0.1),
        0 2px 5px 0 rgba(52, 66, 86, 0.1);
    }
  }

  &:hover {
    box-shadow:
      0 0 0 1px #cbd5e1,
      0 1px 1px 0 rgba(15, 23, 41, 0.1),
      0 2px 5px 0 rgba(52, 66, 86, 0.1),
      0 3px 9px 0 rgba(52, 66, 86, 0.1);
  }
}

.button_active {
  background-color: #5368d5;
  color: #fff;
}
</style>
