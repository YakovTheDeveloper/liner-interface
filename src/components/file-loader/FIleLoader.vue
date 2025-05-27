<script setup lang="ts">
import { ref } from 'vue';

const file = ref<File | null>(null);
const fileName = ref('');
const isLoading = ref(false);

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        file.value = target.files[0];
        fileName.value = target.files[0].name;
    }
}

function handleSubmit() {
    if (!file.value) return;
    isLoading.value = true;
    // Simulate file loading
    setTimeout(() => {
        isLoading.value = false;
        alert(`Loaded: ${fileName.value}`);
    }, 1500);
}
</script>

<template>
    <div class="file-upload-container">
        <form @submit.prevent="handleSubmit" class="file-form">
            <label class="file-label">
                <input type="file" @change="handleFileChange" class="file-input" />
                <span class="file-custom">
                    {{ fileName || 'Choose a file...' }}
                </span>
            </label>
            <button type="submit" class="submit-btn" :disabled="!file || isLoading">
                <span v-if="isLoading" class="loader"></span>
                <span v-else>Load File</span>
            </button>
        </form>
    </div>
</template>

<style scoped>
.file-upload-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
}

.file-form {
    background: #fff;
    padding: 2rem 2.5rem;
    border-radius: 1.2rem;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    min-width: 320px;
}

.file-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.file-input {
    display: none;
}

.file-custom {
    padding: 0.7rem 1.2rem;
    border: 2px dashed #7f9cf5;
    border-radius: 0.7rem;
    background: #f7fafc;
    color: #4a5568;
    font-size: 1rem;
    transition: border 0.2s;
}

.file-label:hover .file-custom {
    border-color: #5a67d8;
}

.submit-btn {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 0.7rem;
    padding: 0.7rem 1.5rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(118, 75, 162, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
}

.submit-btn:disabled {
    background: #c3cfe2;
    cursor: not-allowed;
}

.loader {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    animation: spin 0.8s linear infinite;
    margin-right: 0.5rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
