<template>
    <header class="app-header">
      <div class="header-left">
        <button class="menu-toggle" @click="toggleSidebar">
          <i class="icon-menu"></i>
        </button>
        <h1 class="app-title">User Management</h1>
      </div>
      
      <div class="header-right">
        <button class="theme-toggle" @click="toggleTheme">
          <i :class="isDarkMode ? 'icon-sun' : 'icon-moon'"></i>
        </button>
        
        <div class="user-dropdown" v-if="isAuthenticated">
          <button class="user-button">
            <div class="user-avatar">
              <span>{{ userInitials }}</span>
            </div>
            <span class="user-name">{{ userName }}</span>
            <i class="icon-chevron-down"></i>
          </button>
          
          <div class="dropdown-menu">
            <div class="dropdown-header">
              <div class="user-info">
                <div class="user-name">{{ userName }}</div>
                <div class="user-email">{{ userEmail }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="logout">
              <i class="icon-log-out"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  </template>
  
  <script setup lang="ts">
  import { computed, inject } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const isDarkMode = inject('isDarkMode', false);
  
  // Emits
  const emit = defineEmits(['toggle-theme']);
  
  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const userName = computed(() => authStore.user?.name || 'User');
  const userEmail = computed(() => authStore.user?.email || '');
  const userInitials = computed(() => {
    if (!authStore.user?.name) return 'U';
    
    const nameParts = authStore.user.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  });
  
  // Methods
  function toggleTheme() {
    emit('toggle-theme');
  }
  
  function toggleSidebar() {
    // This would typically use a store or emit an event to toggle the sidebar
    document.body.classList.toggle('sidebar-collapsed');
  }
  
  async function logout() {
    try {
      await authStore.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }



  </script>
  
  <style scoped>
  .app-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
  }
  
  .app-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
  }
  
  .user-dropdown {
    position: relative;
  }
  
  .user-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem;
    border-radius: 4px;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
  }
  
  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
  }
  
  .user-name {
    font-weight: 500;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    width: 200px;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    display: none;
  }
  
  .user-dropdown:hover .dropdown-menu {
    display: block;
  }
  
  .dropdown-header {
    padding: 1rem;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .user-email {
    font-size: 0.875rem;
    color: var(--text-color);
    opacity: 0.7;
  }
  
  .dropdown-divider {
    height: 1px;
    background-color: var(--border-color);
    margin: 0;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
  }
  
  .dropdown-item:hover {
    background-color: var(--background-color);
  }
  
  @media (max-width: 768px) {
    .user-name {
      display: none;
    }
  }

  </style>