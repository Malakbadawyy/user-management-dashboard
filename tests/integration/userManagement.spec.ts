import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import App from '@/App.vue'
import UserList from '@/views/UserList.vue'
import UserDetail from '@/views/UserDetail.vue'
import { mockApi } from '@/services/mockApi'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

// Mock the API service
vi.mock('@/services/mockApi', () => ({
  mockApi: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn()
  }
}))

describe('User Management Integration', () => {
  let router: any
  let pinia: any
  let authStore: any
  let usersStore: any
  
  beforeEach(async () => {
    // Create fresh pinia instance
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Create router instance with routes
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: UserList },
        { path: '/users', component: UserList },
        { path: '/users/:id', component: UserDetail, props: true },
        { path: '/login', component: { template: '<div>Login Page</div>' } }
      ]
    })
    
    // Get store instances
    authStore = useAuthStore()
    usersStore = useUsersStore()
    
    // Mock auth store methods
    vi.spyOn(authStore, 'hasPermission').mockImplementation((permission) => {
      return ['users:read', 'users:create', 'users:update'].includes(permission)
    })
    
    // Set authenticated state
    authStore.$patch({
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' },
      token: 'mock-token',
      isAuthenticated: true
    })
    
    // Mock API responses
    vi.mocked(mockApi.getUsers).mockResolvedValue({
      users: [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'admin', status: 'active' },
        { id: '2', name: 'User 2', email: 'user2@example.com', role: 'user', status: 'active' }
      ],
      total: 2,
      page: 1,
      limit: 10
    })
    
    vi.mocked(mockApi.getUserById).mockImplementation(async (id) => {
      if (id === '1') {
        return { id: '1', name: 'User 1', email: 'user1@example.com', role: 'admin', status: 'active' }
      }
      throw new Error('User not found')
    })
  })
  
  afterEach(() => {
    vi.resetAllMocks()
  })
  
  it('should load and display user list', async () => {
    // Navigate to users page
    router.push('/users')
    await router.isReady()
    
    // Mount the app
    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Check if users are displayed
    expect(wrapper.text()).toContain('User 1')
    expect(wrapper.text()).toContain('User 2')
    expect(wrapper.text()).toContain('user1@example.com')
    
    // Check if API was called with correct parameters
    expect(mockApi.getUsers).toHaveBeenCalledWith(expect.objectContaining({
      page: 1,
      limit: 10
    }))
  })
  
  it('should navigate to user detail page', async () => {
    // Navigate to users page
    router.push('/users')
    await router.isReady()
    
    // Mount the app
    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Find and click on the first user's view button
    const viewButton = wrapper.find('[data-test="view-user-1"]')
    await viewButton.trigger('click')
    
    // Wait for navigation
    await flushPromises()
    
    // Check if we navigated to the user detail page
    expect(router.currentRoute.value.path).toBe('/users/1')
    
    // Check if user details API was called
    expect(mockApi.getUserById).toHaveBeenCalledWith('1')
    
    // Check if user details are displayed
    expect(wrapper.text()).toContain('User 1')
    expect(wrapper.text()).toContain('user1@example.com')
  })
  
  it('should filter users by search term', async () => {
    // Mock API response for search
    vi.mocked(mockApi.getUsers).mockResolvedValue({
      users: [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'admin', status: 'active' }
      ],
      total: 1,
      page: 1,
      limit: 10
    })
    
    // Navigate to users page
    router.push('/users')
    await router.isReady()
    
    // Mount the app
    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Wait for initial API calls to resolve
    await flushPromises()
    
    // Find search input and enter search term
    const searchInput = wrapper.find('[data-test="search-input"]')
    await searchInput.setValue('User 1')
    
    // Trigger search (debounced in real app)
    await usersStore.setSearch('User 1')
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Check if API was called with search parameter
    expect(mockApi.getUsers).toHaveBeenCalledWith(expect.objectContaining({
      search: 'User 1'
    }))
    
    // Check if filtered results are displayed
    expect(wrapper.text()).toContain('User 1')
    expect(wrapper.text()).not.toContain('User 2')
  })
  
  it('should create a new user', async () => {
    // Mock API response for create user
    vi.mocked(mockApi.createUser).mockResolvedValue({
      id: '3',
      name: 'New User',
      email: 'new@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    })
    
    // Navigate to users page
    router.push('/users')
    await router.isReady()
    
    // Mount the app
    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Find and click the add user button
    const addButton = wrapper.find('[data-test="add-user-button"]')
    await addButton.trigger('click')
    
    // Wait for modal to appear
    await nextTick()
    
    // Fill the form
    const nameInput = wrapper.find('input[name="name"]')
    const emailInput = wrapper.find('input[name="email"]')
    const roleSelect = wrapper.find('select[name="role"]')
    
    await nameInput.setValue('New User')
    await emailInput.setValue('new@example.com')
    await roleSelect.setValue('user')
    
    // Submit the form
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Check if API was called with correct data
    expect(mockApi.createUser).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New User',
      email: 'new@example.com',
      role: 'user'
    }))
    
    // Check if users are refreshed after creation
    expect(mockApi.getUsers).toHaveBeenCalledTimes(2)
  })
  
  it('should update an existing user', async () => {
    // Mock API response for update user
    vi.mocked(mockApi.updateUser).mockResolvedValue({
      id: '1',
      name: 'Updated User',
      email: 'user1@example.com',
      role: 'admin',
      status: 'active'
    })
    
    // Navigate to user detail page
    router.push('/users/1')
    await router.isReady()
    
    // Mount the app
    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Find and click the edit button
    const editButton = wrapper.find('[data-test="edit-user-button"]')
    await editButton.trigger('click')
    
    // Wait for modal to appear
    await nextTick()
    
    // Update the name
    const nameInput = wrapper.find('input[name="name"]')
    await nameInput.setValue('Updated User')
    
    // Submit the form
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Check if API was called with correct data
    expect(mockApi.updateUser).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated User'
    }))
    
    // Check if user details are refreshed after update
    expect(mockApi.getUserById).toHaveBeenCalledTimes(2)
  })
  
  it('should delete a user with confirmation', async () => {
    // Mock API response for delete user
    vi.mocked(mockApi.deleteUser).mockResolvedValue(undefined)
    
    // Navigate to users page
    router.push('/users')
    await router.isReady()
    
    // Mount the app
    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Find and click the delete button for the first user
    const deleteButton = wrapper.find('[data-test="delete-user-1"]')
    await deleteButton.trigger('click')
    
    // Wait for confirmation dialog to appear
    await nextTick()
    
    // Find and click the confirm button
    const confirmButton = wrapper.find('.confirmation-dialog-actions button:last-child')
    await confirmButton.trigger('click')
    
    // Wait for API calls to resolve
    await flushPromises()
    
    // Check if API was called with correct ID
    expect(mockApi.deleteUser).toHaveBeenCalledWith('1')
    
    // Check if users are refreshed after deletion
    expect(mockApi.getUsers).toHaveBeenCalledTimes(2)
  })
  
  it('should redirect to login page when not authenticated', async () => {
    // Set unauthenticated state
    authStore.$patch({
      user: null,
      token: null,
      isAuthenticated: false
    })
    
    // Navigate to users page
    router.push('/users')
    await router.isReady()
    
    // Mount the app
    mount(App, {
      global: {
        plugins: [router, pinia]
      }
    })
    
    // Wait for navigation
    await flushPromises()
    
    // Check if redirected to login page
    expect(router.currentRoute.value.path).toBe('/login')
  })
})