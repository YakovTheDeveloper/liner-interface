<template>
    <div v-if="isOpen" class="map-modal" @click="onClose">
        <div @click.stop>
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Point, TerminalPoint } from '../types'

const props = defineProps<{
    isOpen: boolean
    onClose: VoidFunction
}>()
</script>

<style scoped lang="scss">
.map-modal {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.534);
}
</style>
