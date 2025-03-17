import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Lazy-loaded components
const UserList = () => import('../views/UserList.vue');
const UserDetail = () => import('../views/UserDetail.vue');
const Login = () => import('../views/Login.vue');
const NotFound = () => import('../views/NotFound.vue');
const Unauthorized = () => import('../views/Unauthorized.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/users'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/users',
    name: 'UserList',
    component: UserList,
    meta: { requiresAuth: true, roles: ['admin', 'manager', 'viewer'] }
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: UserDetail,
    meta: { requiresAuth: true, roles: ['admin', 'manager'] }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { public: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }
  
  // Check role-based access
  if (to.meta.roles && isAuthenticated) {
    if (Array.isArray(to.meta.roles) && !to.meta.roles.includes(userRole)) {
      next({ name: 'Unauthorized' });
      return;
    }
  }
  
  next();
});

export default router;