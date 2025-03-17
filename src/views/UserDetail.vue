<template>
    <div class="user-detail-container">
      <div class="header">
        <div class="back-button">
          <button class="btn btn-icon" @click="goBack">
            <i class="icon-arrow-left"></i>
          </button>
        </div>
        <h1>User Details</h1>
        <div class="actions">
          <button 
            v-permission="{ role: ['admin', 'manager'] }" 
            class="btn btn-primary" 
            @click="editUser"
          >
            Edit User
          </button>
          <button 
            v-permission="{ role: 'admin' }" 
            class="btn btn-danger" 
            @click="confirmDeleteUser"
          >
            Delete User
          </button>
        </div>
      </div>
      
      <div v-if="usersStore.isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading user details...</p>
      </div>
      
      <div v-else-if="usersStore.error" class="error-container">
        <p class="error-message">{{ usersStore.error }}</p>
        <button class="btn btn-secondary" @click="fetchUserDetails">
          Retry
        </button>
      </div>
      
      <div v-else-if="!user" class="error-container">
        <p>User not found</p>
        <button class="btn btn-secondary" @click="goBack">
          Go Back
        </button>
      </div>
      
      <div v-else class="user-profile">
        <div class="profile-header">
          <div class="avatar-container">
            <img :src="user.avatar" :alt="user.name" class="user-avatar" />
          </div>
          <div class="user-info">
            <h2>{{ user.name }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <div class="badges">
              <span class="badge" :class="'role-' + user.role">
                {{ user.role }}
              </span>
              <span class="badge" :class="'status-' + user.status">
                {{ user.status }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="profile-details">
          <div class="detail-card">
            <h3>Account Information</h3>
            <div class="detail-row">
              <span class="detail-label">Department:</span>
              <span class="detail-value">{{ user.department }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date Joined:</span>
              <span class="detail-value">{{ user.dateJoined }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Last Login:</span>
              <span class="detail-value">{{ user.lastLogin }}</span>
            </div>
          </div>
          
          <div class="detail-card">
            <h3>Permissions</h3>
            <div class="permissions-list">
              <div v-for="(permission, index) in userPermissions" :key="index" class="permission-item">
                <i class="icon-check"></i>
                <span>{{ permission }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Edit User Modal -->
      <UserFormModal 
        v-if="showUserModal"
        :user="user"
        :is-edit-mode="true"
        @close="closeUserModal"
        @save="saveUser"
      />
      
      <!-- Confirmation Dialog -->
      <ConfirmationDialog
        v-if="confirmationStore.isOpen"
        :title="confirmationStore.options.title"
        :message="confirmationStore.options.message"
        :confirm-text="confirmationStore.options.confirmText"
        :cancel-text="confirmationStore.options.cancelText"
        :type="confirmationStore.options.type"
        @confirm="confirmationStore.handleConfirm"
        @cancel="confirmationStore.handleCancel"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUsersStore, User } from '../stores/users';
  import { useConfirmation } from '../composables/useConfirmation';
  import UserFormModal from '../components/UserFormModal.vue';
  import ConfirmationDialog from '../components/ConfirmationDialog.vue';
  
  const route = useRoute();
  const router = useRouter();
  const usersStore = useUsersStore();
  const confirmationStore = useConfirmation();
  
  // Local state
  const showUserModal = ref(false);
  
  // Computed properties
  const userId = computed(() => route.params.id as string);
  
  const user = computed(() => usersStore.selectedUser);
  
  const userPermissions = computed(() => {
    if (!user.value) return [];
    
    switch (user.value.role) {
      case 'admin':
        return ['View all users', 'Create users', 'Edit users', 'Delete users', 'Manage roles'];
      case 'manager':
        return ['View all users', 'Create users', 'Edit users'];
      case 'viewer':
        return ['View all users'];
      default:
        return [];
    }
  });
  
  // Methods
  function fetchUserDetails() {
    if (userId.value) {
      usersStore.fetchUserById(userId.value);
    }
  }
  
  function goBack() {
    router.push('/users');
  }
  
  function editUser() {
    showUserModal.value = true;
  }
  
  function closeUserModal() {
    showUserModal.value = false;
  }
  
  async function saveUser(userData: Partial<User>): Promise<void> {
    try {
      if (user.value) {
        await usersStore.updateUser(user.value.id, userData);
      }
      closeUserModal();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }
  
  async function confirmDeleteUser(): Promise<void> {
    const confirmed = await confirmationStore.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        if (user.value) {
          await usersStore.deleteUser(user.value.id);
          router.push('/users');
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  }
  
  // Lifecycle hooks
  onMounted(() => {
    fetchUserDetails();
  });
  </script>
  
  <style scoped>
  .user-detail-container {
    background-color: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  .header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .back-button {
    margin-right: 1rem;
  }
  
  .header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    flex: 1;
  }
  
  .actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }
  
  .loading-spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 3px solid var(--primary-color);
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    color: #ef4444;
    margin-bottom: 1rem;
  }
  
  .user-profile {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .avatar-container {
    flex-shrink: 0;
  }
  
  .user-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--primary-color);
  }
  
  .user-info {
    flex: 1;
  }
  
  .user-info h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .user-email {
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 1rem;
  }
  
  .badges {
    display: flex;
    gap: 0.5rem;
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .role-admin {
    background-color: #818cf8;
    color: white;
  }
  
  .role-manager {
    background-color: #60a5fa;
    color: white;
  }
  
  .role-viewer {
    background-color: #93c5fd;
    color: white;
  }
  
  .status-active {
    background-color: #10b981;
    color: white;
  }
  
  .status-inactive {
    background-color: #f87171;
    color: white;
  }
  
  .status-pending {
    background-color: #f59e0b;
    color: white;
  }
  
  .profile-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .detail-card {
    background-color: var(--background-color);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .detail-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .detail-row:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    font-weight: 500;
    color: var(--text-color);
    opacity: 0.7;
  }
  
  .detail-value {
    font-weight: 500;
  }
  
  .permissions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .permission-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .permission-item i {
    color: #10b981;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
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
  
  .btn-secondary {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
  }
  
  .btn-danger {
    background-color: #ef4444;
    color: white;
  }
  
  .btn-icon {
    padding: 0.25rem;
    width: 32px;
    height: 32px;
  }
  
  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .header {
      flex-wrap: wrap;
    }
    
    .actions {
      margin-top: 1rem;
      width: 100%;
    }
  }
  </style>