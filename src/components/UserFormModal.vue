<template>
    <div class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit User' : 'Create User' }}</h2>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="formData.name" 
              required 
              :class="{ 'error': errors.name }"
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              required 
              :class="{ 'error': errors.email }"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="role">Role</label>
              <select 
                id="role" 
                v-model="formData.role" 
                required
                :class="{ 'error': errors.role }"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
              <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
            </div>
            
            <div class="form-group">
              <label for="status">Status</label>
              <select 
                id="status" 
                v-model="formData.status" 
                required
                :class="{ 'error': errors.status }"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="department">Department</label>
            <select 
              id="department" 
              v-model="formData.department" 
              required
              :class="{ 'error': errors.department }"
            >
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Support">Support</option>
            </select>
            <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner-small"></span>
              <span v-else>{{ isEditMode ? 'Save Changes' : 'Create User' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { User } from '../stores/users';
  
  const props = defineProps<{
    user: User | null;
    isEditMode: boolean;
  }>();
  
  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', userData: Partial<User>): void;
  }>();
  
  // Form state
  const formData = reactive({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    department: 'Engineering'
  });
  
  const errors = reactive({
    name: '',
    email: '',
    role: '',
    status: '',
    department: ''
  });
  
  const isSubmitting = ref(false);
  
  // Methods
  function closeModal() {
    emit('close');
  }
  
  function validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    Object.keys(errors).forEach(key => {
      errors[key as keyof typeof errors] = '';
    });
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate role
    if (!formData.role) {
      errors.role = 'Role is required';
      isValid = false;
    }
    
    // Validate status
    if (!formData.status) {
      errors.status = 'Status is required';
      isValid = false;
    }
    
    // Validate department
    if (!formData.department) {
      errors.department = 'Department is required';
      isValid = false;
    }
    
    return isValid;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isSubmitting.value = true;
    
    try {
      await emit('save', { ...formData });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      isSubmitting.value = false;
    }
  }
  
  // Initialize form data if editing
  onMounted(() => {
    if (props.isEditMode && props.user) {
      formData.name = props.user.name;
      formData.email = props.user.email;
      formData.role = props.user.role;
      formData.status = props.user.status as 'active' | 'inactive' | 'pending';
      formData.department = props.user.department;
    }
  });
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  
  .modal-container {
    background-color: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-color);
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .btn-close:hover {
    opacity: 1;
  }
  
  .modal-form {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .form-group label {
    font-weight: 500;
    color: var(--text-color);
  }
  
  .form-group input,
  .form-group select {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: border-color 0.2s;
  }
  
  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  .form-group input.error,
  .form-group select.error {
    border-color: #ef4444;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }
  
  .btn-primary:hover {
    background-color: var(--secondary-color);
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
  }
  
  .loading-spinner-small {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 576px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
  </style>