<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirmation-dialog-backdrop" @click="handleBackdropClick">
      <div class="confirmation-dialog" @click.stop>
        <h3 class="confirmation-dialog-title">{{ title }}</h3>
        <p class="confirmation-dialog-message">{{ message }}</p>
        <div class="confirmation-dialog-actions">
          <button 
            class="btn btn-secondary" 
            @click="cancel"
            ref="cancelButton"
          >
            {{ cancelText }}
          </button>
          <button 
            class="btn btn-danger" 
            @click="confirm"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  closeOnBackdropClick: {
    type: Boolean,
    default: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const cancelButton = ref<HTMLButtonElement | null>(null);

// Handle escape key to close dialog
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isVisible) {
    cancel();
  }
};

// Handle backdrop click
const handleBackdropClick = () => {
  if (props.closeOnBackdropClick) {
    cancel();
  }
};

// Focus the cancel button when dialog opens
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    // Prevent scrolling on the body when dialog is open
    document.body.style.overflow = 'hidden';
    
    // Focus the cancel button after the dialog is rendered
    nextTick(() => {
      if (cancelButton.value) {
        cancelButton.value.focus();
      }
    });
  } else {
    // Restore scrolling when dialog is closed
    document.body.style.overflow = '';
  }
});

// Emit confirm event
const confirm = () => {
  if (!props.isLoading) {
    emit('confirm');
  }
};

// Emit cancel event
const cancel = () => {
  if (!props.isLoading) {
    emit('cancel');
  }
};

// Add and remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  // Ensure we restore scrolling if component is unmounted while visible
  document.body.style.overflow = '';
});
</script>

<style scoped>
.confirmation-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* High z-index to ensure it's above other content */
  animation: fadeIn 0.2s ease-out;
}

.confirmation-dialog {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.confirmation-dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.confirmation-dialog-message {
  margin-bottom: 1.5rem;
  color: var(--text-color);
  line-height: 1.5;
}

.confirmation-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5rem;
}

.btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--border-color);
  color: var(--text-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: #d1d5db;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>