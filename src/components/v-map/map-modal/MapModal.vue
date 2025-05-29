<template>
  <div v-if="isOpen" class="map-modal" @click="onClose">
    <div @click.stop class="map-modal-content">
      <header>
        <span class="title">Выберите объект</span>
        <button @click="onClose" class="button-close"><IconClose /></button>
      </header>
      <div class="map-modal-content-center">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconClose from '@/components/icons/IconClose.vue'
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
  display: flex;
  align-items: center;
  justify-content: start;
  flex-direction: column;

  &-content {
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    margin-top: 20px;
    width: 500px;
    background-color: #fff;

    header {
      display: flex;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;

      .title {
        font-size: 1.25rem;
        font-weight: 500;
        line-height: 1.2;
        color: #1e293b;
      }
    }

    &-center {
      //   padding: 1rem 1.25rem;
    }
  }

  .button-close {
    opacity: 0.5;

    &:hover{
        opacity: 1;
    }
  }
}
</style>
