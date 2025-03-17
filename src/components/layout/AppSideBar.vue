<template>
    <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">UM</span>
          <span class="logo-text">User Management</span>
        </div>
        <button class="collapse-button" @click="toggleSidebar">
          <i class="icon-chevron-left"></i>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item" :class="{ 'active': isActive('/users') }">
            <router-link to="/users" class="nav-link">
              <i class="icon-users"></i>
              <span class="nav-text">Users</span>
            </router-link>
          </li>
          <li v-permission="{ role: ['admin'] }" class="nav-item" :class="{ 'active': isActive('/roles') }">
            <router-link to="/roles" class="nav-link">
              <i class="icon-shield"></i>
              <span class="nav-text">Roles</span>
            </router-link>
          </li>
          <li v-permission="{ role: ['admin'] }" class="nav-item" :class="{ 'active': isActive('/settings') }">
            <router-link to="/settings" class="nav-link">
              <i class="icon-settings"></i>
              <span class="nav-text">Settings</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <ndiv class="user-info">
          <div class="user-avatar">
            <span>{{ userInitials }}</span>
          </div>
          <div class="user-details">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </ndiv>
      </div>
    </aside>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuthStore } from '../../stores/auth';
  
  const route = useRoute();
  const authStore = useAuthStore();
  
  // State
  const isSidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true');
  
  // Computed properties
  const userName = computed(() => authStore.user?.name || 'User');
  const userRole = computed(() => {
    const role = authStore.user?.role || '';
    return role.charAt(0).toUpperCase() + role.slice(1);
  });
  const userInitials = computed(() => {
    if (!authStore.user?.name) return 'U';
    
    const nameParts = authStore.user.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  });
  
  // Methods
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    localStorage.setItem('sidebar_collapsed', isSidebarCollapsed.value.toString());
  }
  
  function isActive(path: string): boolean {
    return route.path.startsWith(path);
  }
  </script>
  
  <style scoped>
  .sidebar {
    width: 250px;
    height: 100%;
    background-color: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
  }
  
  .sidebar.collapsed {
    width: 70px;
  }
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
  }
  
  .logo-text {
    font-weight: 600;
    color: var(--text-color);
    white-space: nowrap;
    transition: opacity 0.3s ease;
  }
  
  .collapse-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .sidebar.collapsed .collapse-button {
    transform: rotate(180deg);
  }
  
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
  }
  
  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .nav-item {
    margin-bottom: 0.25rem;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-color);
    text-decoration: none;
    border-radius: 4px;
    margin: 0 0.5rem;
    transition: background-color 0.2s;
  }
  
  .nav-link:hover {
    background-color: var(--background-color);
  }
  
  .nav-item.active .nav-link {
    background-color: var(--primary-color);
    color: white;
  }
  
  .nav-text {
    white-space: nowrap;
    transition: opacity 0.3s ease;
  }
  
  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .user-details {
    overflow: hidden;
    transition: opacity 0.3s ease;
  }
  
  .user-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .user-role {
    font-size: 0.75rem;
    color: var(--text-color);
    opacity: 0.7;
    white-space: nowrap;
  }
  
  /* Collapsed state styles */
  .sidebar.collapsed .logo-text,
  .sidebar.collapsed .nav-text,
  .sidebar.collapsed .user-details {
    opacity: 0;
    visibility: hidden;
  }
  
  .sidebar.collapsed .nav-link {
    justify-content: center;
    padding: 0.75rem;
  }
  
  .sidebar.collapsed .user-info {
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      z-index: 100;
      transform: translateX(-100%);
    }
    
    .sidebar.active {
      transform: translateX(0);
    }
  }
  </style>