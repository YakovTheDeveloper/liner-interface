<script setup lang="ts">
import FIleLoader from '@/components/file-loader/FIleLoader.vue';
import VMap from '@/components/v-map/VMap.vue';

</script>

<template>
  <div class="container">
    <FIleLoader />
    <VMap />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
</style>
