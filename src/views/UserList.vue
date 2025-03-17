<template>
    <div class="user-list-container">
      <div class="header">
        <h1>User Management</h1>
        <div class="actions">
          <button 
            v-permission="{ role: ['admin', 'manager'] }" 
            class="btn btn-primary" 
            @click="openCreateUserModal"
          >
            Add User
          </button>
          
          <div class="dropdown" v-if="usersStore.selectedUserIds.length > 0">
            <button class="btn btn-secondary">
              Bulk Actions ({{ usersStore.selectedUserIds.length }})
            </button>
            <div class="dropdown-menu">
              <button class="dropdown-item" @click="exportSelectedUsers">
                Export to CSV
              </button>
              <button 
                v-permission="{ role: 'admin' }" 
                class="dropdown-item danger" 
                @click="confirmBulkDelete"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="filters">
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchInput" 
            placeholder="Search users..." 
            class="search-input"
          />
        </div>
        
        <div class="filter-group">
          <select v-model="roleFilter" class="filter-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>
          
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th class="checkbox-cell">
                <input 
                  type="checkbox" 
                  :checked="isAllSelected" 
                  @change="toggleSelectAll"
                />
              </th>
              <th @click="sortUsers('name')" class="sortable">
                Name
                <span v-if="usersStore.sortBy === 'name'" class="sort-icon">
                  {{ usersStore.sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Email</th>
              <th @click="sortUsers('role')" class="sortable">
                Role
                <span v-if="usersStore.sortBy === 'role'" class="sort-icon">
                  {{ usersStore.sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortUsers('status')" class="sortable">
                Status
                <span v-if="usersStore.sortBy === 'status'" class="sort-icon">
                  {{ usersStore.sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortUsers('dateJoined')" class="sortable">
                Date Joined
                <span v-if="usersStore.sortBy === 'dateJoined'" class="sort-icon">
                  {{ usersStore.sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usersStore.isLoading" class="loading-row">
              <td colspan="7" class="text-center">
                <div class="loading-spinner"></div>
                <p>Loading users...</p>
              </td>
            </tr>
            
            <tr v-else-if="usersStore.error" class="error-row">
              <td colspan="7" class="text-center">
                <p class="error-message">{{ usersStore.error }}</p>
                <button class="btn btn-secondary" @click="usersStore.fetchUsers()">
                  Retry
                </button>
              </td>
            </tr>
            
            <tr v-else-if="usersStore.users.length === 0" class="empty-row">
              <td colspan="7" class="text-center">
                <p>No users found</p>
              </td>
            </tr>
            
            <tr v-for="user in usersStore.users" :key="user.id" class="user-row">
              <td class="checkbox-cell">
                <input 
                  type="checkbox" 
                  :checked="isSelected(user.id)" 
                  @change="toggleUserSelection(user.id)"
                />
              </td>
              <td class="user-cell">
                <div class="user-info">
                  <img :src="user.avatar" :alt="user.name" class="user-avatar" />
                  <span>{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="'role-' + user.role">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="badge" :class="'status-' + user.status">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ user.dateJoined }}</td>
              <td class="actions-cell">
                <button 
                  class="btn btn-icon" 
                  @click="viewUserDetails(user.id)"
                  title="View Details"
                >
                  <i class="icon-eye"></i>
                </button>
                
                <button 
                  v-permission="{ role: ['admin', 'manager'] }"
                  class="btn btn-icon" 
                  @click="editUser(user.id)"
                  title="Edit User"
                >
                  <i class="icon-edit"></i>
                </button>
                
                <button 
                  v-permission="{ role: 'admin' }"
                  class="btn btn-icon danger" 
                  @click="confirmDeleteUser(user.id)"
                  title="Delete User"
                >
                  <i class="icon-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <div class="pagination-info">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ usersStore.totalUsers }} users
        </div>
        
        <div class="pagination-controls">
          <button 
            class="btn btn-icon" 
            :disabled="usersStore.currentPage === 1"
            @click="changePage(usersStore.currentPage - 1)"
          >
            <i class="icon-chevron-left"></i>
          </button>
          
          <span class="page-number">{{ usersStore.currentPage }}</span>
          
          <button 
            class="btn btn-icon" 
            :disabled="usersStore.currentPage >= totalPages"
            @click="changePage(usersStore.currentPage + 1)"
          >
            <i class="icon-chevron-right"></i>
          </button>
        </div>
        
        <div class="items-per-page">
          <select v-model="itemsPerPage" class="filter-select">
            <option :value="10">10 per page</option>
            <option :value="20">20 per page</option>
            <option :value="50">50 per page</option>
          </select>
        </div>
      </div>
      
      <!-- Create/Edit User Modal -->
      <UserFormModal 
        v-if="showUserModal"
        :user="selectedUser"
        :is-edit-mode="isEditMode"
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
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUsersStore, User } from '../stores/users';
  import { useDebounce } from '../composables/useDebounce';
  import { useConfirmation } from '../composables/useConfirmation';
  import UserFormModal from '../components/UserFormModal.vue';
  import ConfirmationDialog from '../components/ConfirmationDialog.vue';
  
  const router = useRouter();
  const usersStore = useUsersStore();
  const confirmationStore = useConfirmation();
  
  // Local state
  const searchInput = ref('');
  const roleFilter = ref('');
  const statusFilter = ref('');
  const itemsPerPage = ref(10);
  const showUserModal = ref(false);
  const isEditMode = ref(false);
  const selectedUser = ref<User | null>(null);
  
  // Apply debounce to search input
  const { debouncedValue: debouncedSearch } = useDebounce(searchInput, 500);
  
  // Computed properties
  const isAllSelected = computed(() => {
    return usersStore.users.length > 0 && 
           usersStore.selectedUserIds.length === usersStore.users.length;
  });
  
  const totalPages = computed(() => {
    return Math.ceil(usersStore.totalUsers / usersStore.itemsPerPage);
  });
  
  const paginationStart = computed(() => {
    return (usersStore.currentPage - 1) * usersStore.itemsPerPage + 1;
  });
  
  const paginationEnd = computed(() => {
    return Math.min(
      usersStore.currentPage * usersStore.itemsPerPage,
      usersStore.totalUsers
    );
  });
  
  // Methods
  function isSelected(userId: string): boolean {
    return usersStore.selectedUserIds.includes(userId);
  }
  
  function toggleUserSelection(userId: string): void {
    usersStore.toggleUserSelection(userId);
  }
  
  function toggleSelectAll(): void {
    usersStore.selectAllUsers();
  }
  
  function sortUsers(field: string): void {
    usersStore.setSorting(field);
  }
  
  function changePage(page: number): void {
    if (page < 1 || page > totalPages.value) return;
    usersStore.setPage(page);
  }
  
  function viewUserDetails(userId: string): void {
    router.push(`/users/${userId}`);
  }
  
  function editUser(userId: string): void {
    const user = usersStore.users.find(u => u.id === userId);
    if (user) {
      selectedUser.value = { ...user };
      isEditMode.value = true;
      showUserModal.value = true;
    }
  }
  
  function openCreateUserModal(): void {
    selectedUser.value = null;
    isEditMode.value = false;
    showUserModal.value = true;
  }
  
  function closeUserModal(): void {
    showUserModal.value = false;
  }
  
  async function saveUser(userData: Partial<User>): Promise<void> {
    try {
      if (isEditMode.value && selectedUser.value) {
        await usersStore.updateUser(selectedUser.value.id, userData);
      } else {
        await usersStore.createUser(userData as Omit<User, 'id'>);
      }
      closeUserModal();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }
  
  async function confirmDeleteUser(userId: string): Promise<void> {
    const confirmed = await confirmationStore.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        await usersStore.deleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  }
  
  async function confirmBulkDelete(): Promise<void> {
    const confirmed = await confirmationStore.confirm({
      title: 'Delete Selected Users',
      message: `Are you sure you want to delete ${usersStore.selectedUserIds.length} users? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        await usersStore.bulkDeleteUsers();
      } catch (error) {
        console.error('Failed to delete users:', error);
      }
    }
  }
  
  async function exportSelectedUsers(): Promise<void> {
    try {
      await usersStore.exportUsersToCsv();
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  }
  
  // Watchers
  watch(debouncedSearch, (newValue) => {
    usersStore.setSearchQuery(newValue);
  });
  
  watch([roleFilter, statusFilter], () => {
    usersStore.setFilters(roleFilter.value, statusFilter.value);
  });
  
  watch(itemsPerPage, (newValue) => {
    usersStore.setItemsPerPage(newValue);
  });
  
  // Lifecycle hooks
  onMounted(() => {
    usersStore.fetchUsers();
  });
  </script>
  
  <style scoped>
  .user-list-container {
    background-color: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
  }
  
  .actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .filters {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .search-container {
    flex: 1;
    min-width: 250px;
  }
  
  .search-input {
    width: 100%;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
  }
  
  .filter-group {
    display: flex;
    gap: 0.75rem;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
  }
  
  .table-container {
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .users-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  .users-table th {
    font-weight: 600;
    color: var(--text-color);
    background-color: var(--background-color);
  }
  
  .sortable {
    cursor: pointer;
    user-select: none;
  }
  
  .sort-icon {
    margin-left: 0.25rem;
  }
  
  .checkbox-cell {
    width: 40px;
    text-align: center;
  }
  
  .user-cell {
    min-width: 200px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
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
  
  .actions-cell {
    white-space: nowrap;
    width: 120px;
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
  
  .btn-icon {
    padding: 0.25rem;
    width: 32px;
    height: 32px;
  }
  
  .danger {
    color: #ef4444;
  }
  
  .loading-row,
  .error-row,
  .empty-row {
    height: 200px;
  }
  
  .loading-spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 3px solid var(--primary-color);
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    color: #ef4444;
    margin-bottom: 1rem;
  }
  
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .page-number {
    padding: 0 0.5rem;
  }
  
  .dropdown {
    position: relative;
    display: inline-block;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    min-width: 160px;
    padding: 0.5rem 0;
    margin-top: 0.25rem;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: none;
  }
  
  .dropdown:hover .dropdown-menu {
    display: block;
  }
  
  .dropdown-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color);
  }
  
  .dropdown-item:hover {
    background-color: var(--background-color);
  }
  
  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
    }
    
    .pagination {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  }
  </style>