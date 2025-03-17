import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { vPermission } from './directives/permission';
import { useAuthStore } from './stores/auth';
import './assets/styles/main.css';

// Create the app
const app = createApp(App);

// Set up Pinia
const pinia = createPinia();
app.use(pinia);

// Initialize auth state
const authStore = useAuthStore(pinia); // Pass pinia instance
authStore.initAuth();
authStore.checkSessionTimeout();

// Set up router
app.use(router);

// Register custom directives
app.directive('permission', vPermission);

// Mount the app
app.mount('#app');