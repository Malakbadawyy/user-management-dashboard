import { describe, it, expect, vi, beforeEach } from 'vitest'
import { vPermission } from '@/directives/permission'
import { useAuthStore } from '@/stores/auth'

// Mock Pinia store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

describe('Permission Directive', () => {
  let mockEl: HTMLElement
  let mockBinding: any
  let mockAuthStore: any
  
  beforeEach(() => {
    // Create a mock element
    mockEl = document.createElement('div')
    
    // Create a mock binding
    mockBinding = {
      value: 'users:read',
      oldValue: null
    }
    
    // Create a mock auth store
    mockAuthStore = {
      hasPermission: vi.fn()
    }
    
    // Mock the useAuthStore to return our mock store
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
  })

  it('should hide element when user does not have permission', () => {
    // Mock hasPermission to return false
    mockAuthStore.hasPermission.mockReturnValue(false)
    
    // Call the directive's mounted hook
    vPermission.mounted(mockEl, mockBinding)
    
    // Element should be hidden
    expect(mockEl.style.display).toBe('none')
    expect(mockAuthStore.hasPermission).toHaveBeenCalledWith('users:read')
  })

  it('should show element when user has permission', () => {
    // Mock hasPermission to return true
    mockAuthStore.hasPermission.mockReturnValue(true)
    
    // Call the directive's mounted hook
    vPermission.mounted(mockEl, mockBinding)
    
    // Element should be visible
    expect(mockEl.style.display).not.toBe('none')
    expect(mockAuthStore.hasPermission).toHaveBeenCalledWith('users:read')
  })

  it('should update visibility when binding value changes', () => {
    // Initially user has permission
    mockAuthStore.hasPermission.mockReturnValue(true)
    
    // Mount the directive
    vPermission.mounted(mockEl, mockBinding)
    expect(mockEl.style.display).not.toBe('none')
    
    // Update binding to a permission user doesn't have
    mockBinding.value = 'users:delete'
    mockAuthStore.hasPermission.mockReturnValue(false)
    
    // Call the directive's updated hook
    vPermission.updated(mockEl, mockBinding)
    
    // Element should now be hidden
    expect(mockEl.style.display).toBe('none')
    expect(mockAuthStore.hasPermission).toHaveBeenCalledWith('users:delete')
  })

  it('should handle array of permissions with OR logic', () => {
    // Set binding value to array of permissions
    mockBinding.value = ['users:read', 'users:create']
    
    // User has one of the permissions
    mockAuthStore.hasPermission.mockImplementation((permission) => {
      return permission === 'users:read'
    })
    
    // Call the directive's mounted hook
    vPermission.mounted(mockEl, mockBinding)
    
    // Element should be visible if user has ANY of the permissions
    expect(mockEl.style.display).not.toBe('none')
    expect(mockAuthStore.hasPermission).toHaveBeenCalledTimes(2)
  })

  it('should handle object with AND logic', () => {
    // Set binding value to object with AND logic
    mockBinding.value = { and: ['users:read', 'users:create'] }
    
    // User has only one of the permissions
    mockAuthStore.hasPermission.mockImplementation((permission) => {
      return permission === 'users:read'
    })
    
    // Call the directive's mounted hook
    vPermission.mounted(mockEl, mockBinding)
    
    // Element should be hidden if user doesn't have ALL permissions
    expect(mockEl.style.display).toBe('none')
    
    // Now user has all permissions
    mockAuthStore.hasPermission.mockReturnValue(true)
    
    // Call the directive's updated hook
    vPermission.updated(mockEl, mockBinding)
    
    // Element should be visible
    expect(mockEl.style.display).not.toBe('none')
  })

  it('should handle object with OR logic', () => {
    // Set binding value to object with OR logic
    mockBinding.value = { or: ['users:read', 'users:create'] }
    
    // User has none of the permissions
    mockAuthStore.hasPermission.mockReturnValue(false)
    
    // Call the directive's mounted hook
    vPermission.mounted(mockEl, mockBinding)
    
    // Element should be hidden
    expect(mockEl.style.display).toBe('none')
    
    // Now user has one permission
    mockAuthStore.hasPermission.mockImplementation((permission) => {
      return permission === 'users:read'
    })
    
    // Call the directive's updated hook
    vPermission.updated(mockEl, mockBinding)
    
    // Element should be visible
    expect(mockEl.style.display).not.toBe('none')
  })

  it('should handle complex nested permission objects', () => {
    // Set binding value to complex nested object
    mockBinding.value = {
      and: [
        'users:read',
        { or: ['users:create', 'users:update'] }
      ]
    }
    
    // User has users:read and users:update
    mockAuthStore.hasPermission.mockImplementation((permission) => {
      return permission === 'users:read' || permission === 'users:update'
    })
    
    // Call the directive's mounted hook
    vPermission.mounted(mockEl, mockBinding)
    
    // Element should be visible
    expect(mockEl.style.display).not.toBe('none')
    
    // Now user only has users:read
    mockAuthStore.hasPermission.mockImplementation((permission) => {
      return permission === 'users:read'
    })
    
    // Call the directive's updated hook
    vPermission.updated(mockEl, mockBinding)
    
    // Element should be hidden
    expect(mockEl.style.display).toBe('none')
  })
})