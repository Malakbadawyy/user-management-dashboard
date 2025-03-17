import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockApi } from '@/services/mockApi'
import { UserRole } from '@/types'

describe('Mock API Service', () => {
  beforeEach(() => {
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'auth_token') return 'mock-token'
      return null
    })
    
    // Mock setTimeout
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should authenticate with valid credentials', async () => {
    const result = await mockApi.login('admin@example.com', 'password')
    
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('token')
    expect(result).toHaveProperty('expiresIn')
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe(UserRole.ADMIN)
  })

  it('should reject with invalid credentials', async () => {
    await expect(mockApi.login('wrong@example.com', 'wrong')).rejects.toThrow('Invalid email or password')
  })

  it('should get current user with valid token', async () => {
    const user = await mockApi.getCurrentUser('mock-token')
    
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('role')
  })

  it('should reject with invalid token', async () => {
    await expect(mockApi.getCurrentUser('invalid-token')).rejects.toThrow('Invalid or expired token')
  })

  it('should fetch users with pagination', async () => {
    const result = await mockApi.getUsers({
      page: 1,
      limit: 10
    })
    
    expect(result).toHaveProperty('users')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('page')
    expect(result).toHaveProperty('limit')
    expect(Array.isArray(result.users)).toBe(true)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('should filter users by search term', async () => {
    const result = await mockApi.getUsers({
      page: 1,
      limit: 10,
      search: 'admin'
    })
    
    expect(result.users.length).toBeGreaterThan(0)
    expect(result.users.every(user => 
      user.name.toLowerCase().includes('admin') || 
      user.email.toLowerCase().includes('admin')
    )).toBe(true)
  })

  it('should filter users by role', async () => {
    const result = await mockApi.getUsers({
      page: 1,
      limit: 10,
      role: UserRole.ADMIN
    })
    
    expect(result.users.length).toBeGreaterThan(0)
    expect(result.users.every(user => user.role === UserRole.ADMIN)).toBe(true)
  })

  it('should filter users by status', async () => {
    const result = await mockApi.getUsers({
      page: 1,
      limit: 10,
      status: 'active'
    })
    
    expect(result.users.length).toBeGreaterThan(0)
    expect(result.users.every(user => user.status === 'active')).toBe(true)
  })

  it('should sort users by field', async () => {
    const result = await mockApi.getUsers({
      page: 1,
      limit: 10,
      sortField: 'name',
      sortDirection: 'asc'
    })
    
    const sortedUsers = [...result.users].sort((a, b) => a.name.localeCompare(b.name))
    expect(result.users).toEqual(sortedUsers)
  })

  it('should get user by id', async () => {
    // First get a list of users to find a valid ID
    const { users } = await mockApi.getUsers({ page: 1, limit: 1 })
    const userId = users[0].id
    
    const user = await mockApi.getUserById(userId)
    
    expect(user).toHaveProperty('id', userId)
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('role')
  })

  it('should reject with invalid user id', async () => {
    await expect(mockApi.getUserById('invalid-id')).rejects.toThrow('User not found')
  })

  it('should create a new user', async () => {
    const newUser = {
      name: 'New Test User',
      email: 'newtest@example.com',
      role: UserRole.USER,
      status: 'active'
    }
    
    const createdUser = await mockApi.createUser(newUser)
    
    expect(createdUser).toHaveProperty('id')
    expect(createdUser.name).toBe(newUser.name)
    expect(createdUser.email).toBe(newUser.email)
    expect(createdUser.role).toBe(newUser.role)
    expect(createdUser.status).toBe(newUser.status)
    expect(createdUser).toHaveProperty('createdAt')
  })

  it('should update an existing user', async () => {
    // First get a list of users to find a valid ID
    const { users } = await mockApi.getUsers({ page: 1, limit: 1 })
    const userId = users[0].id
    
    const updates = {
      name: 'Updated Name',
      status: 'inactive'
    }
    
    const updatedUser = await mockApi.updateUser(userId, updates)
    
    expect(updatedUser).toHaveProperty('id', userId)
    expect(updatedUser.name).toBe(updates.name)
    expect(updatedUser.status).toBe(updates.status)
  })

  it('should delete a user', async () => {
    // First create a user to delete
    const newUser = {
      name: 'User to Delete',
      email: 'delete@example.com',
      role: UserRole.USER,
      status: 'active'
    }
    
    const createdUser = await mockApi.createUser(newUser)
    
    // Then delete the user
    await mockApi.deleteUser(createdUser.id)
    
    // Verify user is deleted
    await expect(mockApi.getUserById(createdUser.id)).rejects.toThrow('User not found')
  })

  it('should perform bulk delete', async () => {
    // First create users to delete
    const user1 = await mockApi.createUser({
      name: 'Bulk Delete 1',
      email: 'bulk1@example.com',
      role: UserRole.USER,
      status: 'active'
    })
    
    const user2 = await mockApi.createUser({
      name: 'Bulk Delete 2',
      email: 'bulk2@example.com',
      role: UserRole.USER,
      status: 'active'
    })
    
    // Perform bulk delete
    await mockApi.bulkDeleteUsers([user1.id, user2.id])
    
    // Verify users are deleted
    await expect(mockApi.getUserById(user1.id)).rejects.toThrow('User not found')
    await expect(mockApi.getUserById(user2.id)).rejects.toThrow('User not found')
  })

  it('should export users to CSV', async () => {
    const csvData = await mockApi.exportUsersToCSV({})
    
    expect(typeof csvData).toBe('string')
    expect(csvData).toContain('id,name,email,role,status,lastLogin,createdAt')
    
    // CSV should have header row and at least one data row
    const rows = csvData.split('\n')
    expect(rows.length).toBeGreaterThan(1)
  })

  it('should simulate network latency', async () => {
    const startTime = Date.now()
    
    const promise = mockApi.getUsers({ page: 1, limit: 10 })
    
    // Fast-forward time
    vi.advanceTimersByTime(300)
    
    await promise
    
    // Should take at least the simulated latency time
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(200)
  })

  it('should handle random errors', async () => {
    // Mock Math.random to simulate error
    const originalRandom = Math.random
    Math.random = vi.fn().mockReturnValue(0.001) // Very low value to trigger error
    
    try {
      await expect(mockApi.getUsers({ page: 1, limit: 10 })).rejects.toThrow('Server error')
    } finally {
      // Restore original Math.random
      Math.random = originalRandom
    }
  })
})