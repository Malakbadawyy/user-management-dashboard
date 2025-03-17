<template>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>User Management</h1>
          <p>Sign in to your account</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required 
              placeholder="Enter your email"
              :class="{ 'error': emailError }"
            />
            <span v-if="emailError" class="error-message">{{ emailError }}</span>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required 
              placeholder="Enter your password"
              :class="{ 'error': passwordError }"
            />
            <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
          </div>
          
          <div class="form-group">
            <button 
              type="submit" 
              class="btn btn-primary btn-block" 
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading-spinner-small"></span>
              <span v-else>Sign In</span>
            </button>
          </div>
          
          <div v-if="authError" class="auth-error">
            {{ authError }}
          </div>
        </form>
        
        <div class="demo-accounts">
          <h3>Demo Accounts</h3>
          <div class="account-list">
            <div class="account-item" @click="fillDemoAccount('admin')">
              <strong>Admin:</strong> admin@example.com / password
            </div>
            <div class="account-item" @click="fillDemoAccount('manager')">
              <strong>Manager:</strong> manager@example.com / password
            </div>
            <div class="account-item" @click="fillDemoAccount('viewer')">
              <strong>Viewer:</strong> viewer@example.com / password
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '../stores/auth';
  
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  
  // Form state
  const email = ref('');
  const password = ref('');
  const emailError = ref('');
  const passwordError = ref('');
  const authError = ref('');
  const isLoading = ref(false);
  
  // Methods
  function validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    emailError.value = '';
    passwordError.value = '';
    
    // Validate email
    if (!email.value) {
      emailError.value = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailError.value = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!password.value) {
      passwordError.value = 'Password is required';
      isValid = false;
    } else if (password.value.length < 6) {
      passwordError.value = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    return isValid;
  }
  
  async function handleLogin() {
    if (!validateForm()) return;
    
    authError.value = '';
    isLoading.value = true;
    
    try {
      await authStore.login(email.value, password.value);
      
      // Redirect to the intended page or dashboard
      const redirectPath = route.query.redirect as string || '/users';
      router.push(redirectPath);
    } catch (error: any) {
      authError.value = error.message || 'Failed to sign in. Please check your credentials.';
    } finally {
      isLoading.value = false;
    }
  }
  
  function fillDemoAccount(type: 'admin' | 'manager' | 'viewer') {
    switch (type) {
      case 'admin':
        email.value = 'admin@example.com';
        password.value = 'password';
        break;
      case 'manager':
        email.value = 'manager@example.com';
        password.value = 'password';
        break;
      case 'viewer':
        email.value = 'viewer@example.com';
        password.value = 'password';
        break;
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    background-color: var(--background-color);
  }
  
  .login-card {
    width: 100%;
    max-width: 400px;
    background-color: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .login-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
  
  .login-header p {
    color: var(--text-color);
    opacity: 0.8;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group label {
    font-weight: 500;
    color: var(--text-color);
  }
  
  .form-group input {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: border-color 0.2s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  .form-group input.error {
    border-color: #ef4444;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
  }
  
  .auth-error {
    padding: 0.75rem;
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 4px;
    color: #ef4444;
    text-align: center;
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
  
  .btn-block {
    width: 100%;
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
  
  .demo-accounts {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
  }
  
  .demo-accounts h3 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text-color);
    opacity: 0.8;
  }
  
  .account-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .account-item {
    font-size: 0.875rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .account-item:hover {
    background-color: var(--background-color);
  }
  </style>