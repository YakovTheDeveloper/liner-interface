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
      <div
        class="ts-dropdown single"
        v-show="isOpen"
      >
        <div
          role="listbox"
          :id="dropdownId"
          class="ts-dropdown-content"
        >
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
  
  <script setup>
  import { computed, ref } from 'vue'
  
  const isOpen = ref(false)
  const selected = ref(null)
  
  const dropdownId = 'objectSelect-ts-dropdown'
  
  const options = [
    { value: 1, label: 'Опция 1' },
    { value: 2, label: 'Опция 2' },
    { value: 3, label: 'Опция 3' },
  ]
  
  const selectedLabel = computed(() => {
    const found = options.find(o => o.value === selected.value)
    return found ? found.label : ''
  })
  
  function toggleDropdown() {
    isOpen.value = !isOpen.value
  }
  
  function closeDropdown() {
    isOpen.value = false
  }
  
  function selectOption(option) {
    selected.value = option.value
    isOpen.value = false
  }
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
  