import { defineStore } from 'pinia';
import { mockApi } from '../services/mockApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isLoading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    userRole: (state) => state.user?.role || null
  },
  
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await mockApi.login(email, password);
        this.user = response.user;
        
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response.user;
      } catch (error: any) {
        this.error = error.message || 'Authentication failed';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async logout() {
      try {
        await mockApi.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    },
    
    initAuth() {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          this.user = JSON.parse(user);
        } catch (error) {
          this.logout();
        }
      }
    },
    
    checkSessionTimeout() {
      // Implement session timeout logic
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      let inactivityTimer: number;
      
      const resetTimer = () => {
        window.clearTimeout(inactivityTimer);
        inactivityTimer = window.setTimeout(() => {
          this.logout();
        }, sessionTimeout);
      };
      
      // Reset timer on user activity
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      
      // Initial timer start
      resetTimer();
    }
  }
});