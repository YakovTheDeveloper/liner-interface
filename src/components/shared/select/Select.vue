<template>
  <div
    class="ts-wrapper form-select form-select-sm mb-4 mt-3 single has-options"
    @click="toggleDropdown"
    @blur="closeDropdown"
    tabindex="0"
  >
    <div class="ts-control">
      <input
        type="text"
        :value="selectedLabel"
        readonly
        autocomplete="off"
        size="1"
        placeholder="Выберите..."
        role="combobox"
        :aria-expanded="isOpen.toString()"
        aria-haspopup="listbox"
        :aria-controls="dropdownId"
      />
    </div>
    <div class="ts-dropdown single" v-show="isOpen">
      <div role="listbox" :id="dropdownId" class="ts-dropdown-content">
        <div
          v-for="(option, index) in options"
          :key="index"
          class="dropdown-item"
          role="option"
          @click.stop="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Define Option type
interface Option {
  value: string | number
  label: string
}

// Props definition
const props = defineProps<{
  options: Option[]
  modelValue: string | number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const isOpen = ref(false)

// Local reactive selected value synced with v-model
const selected = ref<string | number | null>(props.modelValue)

// Sync external modelValue to internal selected
watch(
  () => props.modelValue,
  (newVal) => {
    selected.value = newVal
  },
)

// Emit update when selection changes
function selectOption(option: Option) {
  selected.value = option.value
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

const dropdownId = 'objectSelect-ts-dropdown'

const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.value === selected.value)
  return found ? found.label : ''
})
</script>

<style scoped>
.ts-wrapper {
  position: relative;
  width: 250px;
  cursor: pointer;
}
.ts-control input {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
.ts-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  width: 100%;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}
.ts-dropdown-content .dropdown-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}
.ts-dropdown-content .dropdown-item:hover {
  background-color: #f1f1f1;
}
</style>
