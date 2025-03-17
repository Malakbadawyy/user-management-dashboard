<template>
  <div class="app" :class="{ 'dark': isDarkMode }">
    <AppHeader @toggle-theme="toggleTheme" />
    <div class="app-container">
      <AppSideBar v-if="isAuthenticated" />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppHeader from './components/layout/AppHeader.vue';
import AppSideBar from './components/layout/AppSideBar.vue';

const authStore = useAuthStore();
const router = useRouter();
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Provide theme context to components
provide('isDarkMode', isDarkMode);

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}

onMounted(() => {
  // Check authentication status on app load
  if (!authStore.isAuthenticated && !router.currentRoute.value.meta.public) {
    router.push('/login');
  }
});
</script>

<style>
:root {
  --primary-color: #4f46e5;
  --secondary-color: #818cf8;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --border-color: #e5e7eb;
  --card-bg: #ffffff;
  --sidebar-bg: #f9fafb;
  --header-bg: #ffffff;
}

.dark {
  --primary-color: #6366f1;
  --secondary-color: #818cf8;
  --background-color: #111827;
  --text-color: #f9fafb;
  --border-color: #374151;
  --card-bg: #1f2937;
  --sidebar-bg: #1f2937;
  --header-bg: #111827;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>