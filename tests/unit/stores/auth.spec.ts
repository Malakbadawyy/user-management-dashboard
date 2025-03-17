import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockApi } from '@/services/mockApi'

// Mock the mockApi service
vi.mock('@/services/mockApi', () => ({
  mockApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance and make it active
    setActivePinia(createPinia())
    
    // Reset localStorage mock
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'auth_token') return null
      if (key === 'auth_expiry') return null
      return null
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {})
    
    // Reset mocks
    vi.mocked(mockApi.login).mockReset()
    vi.mocked(mockApi.logout).mockReset()
    vi.mocked(mockApi.getCurrentUser).mockReset()
    
    // Mock Date.now
    vi.spyOn(Date, 'now').mockImplementation(() => 1625097600000) // 2021-07-01
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default state', () => {
    const authStore = useAuthStore()
    
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.isLoading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('should login successfully', async () => {
    const authStore = useAuthStore()
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' }
    const mockToken = 'mock-token'
    
    vi.mocked(mockApi.login).mockResolvedValue({
      user: mockUser,
      token: mockToken,
      expiresIn: 3600 // 1 hour
    })
    
    await authStore.login('test@example.com', 'password')
    
    expect(mockApi.login).toHaveBeenCalledWith('test@example.com', 'password')
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.token).toBe(mockToken)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isLoading).toBe(false)
    expect(authStore.error).toBeNull()
    
    // Check localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken)
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_expiry', expect.any(String))
  })

  it('should handle login failure', async () => {
    const authStore = useAuthStore()
    const errorMessage = 'Invalid credentials'
    
    vi.mocked(mockApi.login).mockRejectedValue(new Error(errorMessage))
    
    await expect(authStore.login('wrong@example.com', 'wrong')).rejects.toThrow(errorMessage)
    
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.isLoading).toBe(false)
    expect(authStore.error).toBe(errorMessage)
  })

  it('should logout successfully', async () => {
    const authStore = useAuthStore()
    
    // Set initial authenticated state
    authStore.$patch({
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' },
      token: 'mock-token',
      isAuthenticated: true
    })
    
    vi.mocked(mockApi.logout).mockResolvedValue(undefined)
    
    await authStore.logout()
    
    expect(mockApi.logout).toHaveBeenCalled()
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
    
    // Check localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_expiry')
  })

  it('should initialize auth from localStorage', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' }
    const mockToken = 'stored-token'
    const mockExpiry = (Date.now() + 3600000).toString() // 1 hour from now
    
    // Mock localStorage to return stored values
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'auth_token') return mockToken
      if (key === 'auth_expiry') return mockExpiry
      return null
    })
    
    vi.mocked(mockApi.getCurrentUser).mockResolvedValue(mockUser)
    
    const authStore = useAuthStore()
    await authStore.initAuth()
    
    expect(mockApi.getCurrentUser).toHaveBeenCalledWith(mockToken)
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.token).toBe(mockToken)
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('should handle expired token during initialization', async () => {
    const mockToken = 'expired-token'
    const mockExpiry = (Date.now() - 1000).toString() // Expired
    
    // Mock localStorage to return stored values
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'auth_token') return mockToken
      if (key === 'auth_expiry') return mockExpiry
      return null
    })
    
    const authStore = useAuthStore()
    await authStore.initAuth()
    
    // Should not call getCurrentUser for expired token
    expect(mockApi.getCurrentUser).not.toHaveBeenCalled()
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
    
    // Should clear localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_expiry')
  })

  it('should handle session timeout', () => {
    const authStore = useAuthStore()
    const mockToken = 'token'
    const mockExpiry = (Date.now() + 5000).toString() // 5 seconds from now
    
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'auth_token') return mockToken
      if (key === 'auth_expiry') return mockExpiry
      return null
    })
    
    // Mock logout
    const logoutSpy = vi.spyOn(authStore, 'logout').mockImplementation(async () => {})
    
    // Set initial state
    authStore.$patch({
      token: mockToken,
      isAuthenticated: true
    })
    
    // Start session timeout check
    authStore.checkSessionTimeout()
    
    // Fast-forward time
    vi.useFakeTimers()
    vi.advanceTimersByTime(6000) // 6 seconds
    vi.useRealTimers()
    
    // Should call logout after expiry
    expect(logoutSpy).toHaveBeenCalled()
  })

  it('should check user permissions correctly', () => {
    const authStore = useAuthStore()
    
    // Admin user
    authStore.$patch({
      user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
      isAuthenticated: true
    })
    
    expect(authStore.hasPermission('users:read')).toBe(true)
    expect(authStore.hasPermission('users:create')).toBe(true)
    expect(authStore.hasPermission('users:update')).toBe(true)
    expect(authStore.hasPermission('users:delete')).toBe(true)
    
    // Manager user
    authStore.$patch({
      user: { id: '2', name: 'Manager', email: 'manager@example.com', role: 'manager' },
      isAuthenticated: true
    })
    
    expect(authStore.hasPermission('users:read')).toBe(true)
    expect(authStore.hasPermission('users:create')).toBe(true)
    expect(authStore.hasPermission('users:update')).toBe(true)
    expect(authStore.hasPermission('users:delete')).toBe(false)
    
    // User role
    authStore.$patch({
      user: { id: '3', name: 'User', email: 'user@example.com', role: 'user' },
      isAuthenticated: true
    })
    
    expect(authStore.hasPermission('users:read')).toBe(true)
    expect(authStore.hasPermission('users:create')).toBe(false)
    expect(authStore.hasPermission('users:update')).toBe(false)
    expect(authStore.hasPermission('users:delete')).toBe(false)
  })
})