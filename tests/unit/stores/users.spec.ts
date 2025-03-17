import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { mockApi } from '@/services/mockApi'
import { UserRole } from '@/types'

// Mock the mockApi service
vi.mock('@/services/mockApi', () => ({
  mockApi: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    bulkDeleteUsers: vi.fn(),
    exportUsersToCSV: vi.fn()
  }
}))

describe('Users Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance and make it active
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.mocked(mockApi.getUsers).mockReset()
    vi.mocked(mockApi.getUserById).mockReset()
    vi.mocked(mockApi.createUser).mockReset()
    vi.mocked(mockApi.updateUser).mockReset()
    vi.mocked(mockApi.deleteUser).mockReset()
    vi.mocked(mockApi.bulkDeleteUsers).mockReset()
    vi.mocked(mockApi.exportUsersToCSV).mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default state', () => {
    const usersStore = useUsersStore()
    
    expect(usersStore.users).toEqual([])
    expect(usersStore.currentUser).toBeNull()
    expect(usersStore.isLoading).toBe(false)
    expect(usersStore.error).toBeNull()
    expect(usersStore.pagination.page).toBe(1)
    expect(usersStore.pagination.limit).toBe(10)
    expect(usersStore.pagination.total).toBe(0)
    expect(usersStore.filters.search).toBe('')
    expect(usersStore.filters.role).toBe('')
    expect(usersStore.filters.status).toBe('')
    expect(usersStore.sort.field).toBe('createdAt')
    expect(usersStore.sort.direction).toBe('desc')
    expect(usersStore.selectedUserIds).toEqual([])
  })

  it('should fetch users with correct parameters', async () => {
    const usersStore = useUsersStore()
    const mockUsers = [
      { id: '1', name: 'User 1', email: 'user1@example.com', role: UserRole.ADMIN },
      { id: '2', name: 'User 2', email: 'user2@example.com', role: UserRole.USER }
    ]
    
    vi.mocked(mockApi.getUsers).mockResolvedValue({
      users: mockUsers,
      total: 2,
      page: 1,
      limit: 10
    })
    
    await usersStore.fetchUsers()
    
    expect(mockApi.getUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: '',
      role: '',
      status: '',
      sortField: 'createdAt',
      sortDirection: 'desc'
    })
    
    expect(usersStore.users).toEqual(mockUsers)
    expect(usersStore.pagination.total).toBe(2)
    expect(usersStore.isLoading).toBe(false)
  })

  it('should handle fetch users error', async () => {
    const usersStore = useUsersStore()
    const errorMessage = 'Failed to fetch users'
    
    vi.mocked(mockApi.getUsers).mockRejectedValue(new Error(errorMessage))
    
    await expect(usersStore.fetchUsers()).rejects.toThrow(errorMessage)
    
    expect(usersStore.isLoading).toBe(false)
    expect(usersStore.error).toBe(errorMessage)
  })

  it('should fetch user by id', async () => {
    const usersStore = useUsersStore()
    const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com', role: UserRole.ADMIN }
    
    vi.mocked(mockApi.getUserById).mockResolvedValue(mockUser)
    
    await usersStore.fetchUserById('1')
    
    expect(mockApi.getUserById).toHaveBeenCalledWith('1')
    expect(usersStore.currentUser).toEqual(mockUser)
    expect(usersStore.isLoading).toBe(false)
  })

  it('should create a new user', async () => {
    const usersStore = useUsersStore()
    const newUser = { name: 'New User', email: 'new@example.com', role: UserRole.USER, status: 'active' }
    const createdUser = { id: '3', ...newUser, createdAt: '2023-01-01T00:00:00Z' }
    
    vi.mocked(mockApi.createUser).mockResolvedValue(createdUser)
    
    // Mock fetchUsers to avoid actual API call
    vi.spyOn(usersStore, 'fetchUsers').mockResolvedValue()
    
    await usersStore.createUser(newUser)
    
    expect(mockApi.createUser).toHaveBeenCalledWith(newUser)
    expect(usersStore.fetchUsers).toHaveBeenCalled()
  })

  it('should update an existing user', async () => {
    const usersStore = useUsersStore()
    const userId = '1'
    const updates = { name: 'Updated Name', email: 'updated@example.com' }
    const updatedUser = { id: userId, ...updates, role: UserRole.ADMIN, status: 'active' }
    
    vi.mocked(mockApi.updateUser).mockResolvedValue(updatedUser)
    
    // Mock fetchUsers to avoid actual API call
    vi.spyOn(usersStore, 'fetchUsers').mockResolvedValue()
    
    await usersStore.updateUser(userId, updates)
    
    expect(mockApi.updateUser).toHaveBeenCalledWith(userId, updates)
    expect(usersStore.fetchUsers).toHaveBeenCalled()
  })

  it('should delete a user', async () => {
    const usersStore = useUsersStore()
    const userId = '1'
    
    vi.mocked(mockApi.deleteUser).mockResolvedValue(undefined)
    
    // Mock fetchUsers to avoid actual API call
    vi.spyOn(usersStore, 'fetchUsers').mockResolvedValue()
    
    await usersStore.deleteUser(userId)
    
    expect(mockApi.deleteUser).toHaveBeenCalledWith(userId)
    expect(usersStore.fetchUsers).toHaveBeenCalled()
  })

  it('should perform bulk delete', async () => {
    const usersStore = useUsersStore()
    const userIds = ['1', '2']
    
    // Set selected user IDs
    usersStore.$patch({ selectedUserIds: userIds })
    
    vi.mocked(mockApi.bulkDeleteUsers).mockResolvedValue(undefined)
    
    // Mock fetchUsers to avoid actual API call
    vi.spyOn(usersStore, 'fetchUsers').mockResolvedValue()
    
    await usersStore.bulkDeleteUsers()
    
    expect(mockApi.bulkDeleteUsers).toHaveBeenCalledWith(userIds)
    expect(usersStore.fetchUsers).toHaveBeenCalled()
    expect(usersStore.selectedUserIds).toEqual([])
  })

  it('should export users to CSV', async () => {
    const usersStore = useUsersStore()
    const csvData = 'id,name,email,role\n1,User 1,user1@example.com,admin'
    
    vi.mocked(mockApi.exportUsersToCSV).mockResolvedValue(csvData)
    
    // Mock global URL.createObjectURL and document.createElement
    global.URL.createObjectURL = vi.fn()
    global.URL.revokeObjectURL = vi.fn()
    
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      style: { display: '' }
    }
    
    document.createElement = vi.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink
      return {}
    })
    
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
    
    await usersStore.exportUsers()
    
    expect(mockApi.exportUsersToCSV).toHaveBeenCalledWith({
      search: '',
      role: '',
      status: '',
      sortField: 'createdAt',
      sortDirection: 'desc'
    })
    
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('should update pagination', async () => {
    const usersStore = useUsersStore()
    
    // Mock fetchUsers to avoid actual API call
    vi.spyOn(usersStore, 'fetchUsers').mockResolvedValue()
    
    await usersStore.setPage(2)
    
    expect(usersStore.pagination.page).toBe(2)
    expect(usersStore.fetchUsers).toHaveBeenCalled()
    
    await usersStore.setLimit(20)
    
    expect(usersStore.pagination.limit).toBe(20)
    expect(usersStore.pagination.page).toBe(1) // Should reset to page 1
    expect(usersStore.fetchUsers).toHaveBeenCalledTimes(2)
  })

  it('should update filters', async () => {
    const usersStore = useUsersStore()
    
    // Mock fetchUsers to avoid actual API call
    vi.spyOn(usersStore, 'fetchUsers').mockResolvedValue()
    
    await usersStore.setSearch('test')
    
    expect(usersStore.filters.search).toBe('test')
    expect(usersStore.pagination.page).toBe(1) // Should reset to page 1
    expect(usersStore.fetchUsers).toHaveBeenCalled()
    
    await usersStore.setRoleFilter('admin')
    
    expect(usersStore.filters.role).toBe('admin')
    expect(usersStore.pagination.page).toBe(1)
    expect(usersStore.fetchUsers).toHaveBeenCalledTimes(2)
    
    await usersStore.setStatusFilter('active')
    
    expect(usersStore.filters.status).toBe('active')
    expect(usersStore.pagination.page).toBe(1)
    expect(usersStore.fetchUsers).toHaveBeenCalledTimes(3)
  })

  it('should update sorting', async () => {
    const usersStore = useUsersStore()
    
    // Mock fetchUsers to avoid actual API call
    vi.spyOn(usersStore, 'fetchUsers').mockResolvedValue()
    
    await usersStore.setSorting('name', 'asc')
    
    expect(usersStore.sort.field).toBe('name')
    expect(usersStore.sort.direction).toBe('asc')
    expect(usersStore.fetchUsers).toHaveBeenCalled()
    
    // Toggle same field should reverse direction
    await usersStore.setSorting('name')
    
    expect(usersStore.sort.field).toBe('name')
    expect(usersStore.sort.direction).toBe('desc')
    expect(usersStore.fetchUsers).toHaveBeenCalledTimes(2)
  })

  it('should toggle user selection', () => {
    const usersStore = useUsersStore()
    
    // Select a user
    usersStore.toggleUserSelection('1')
    expect(usersStore.selectedUserIds).toEqual(['1'])
    
    // Select another user
    usersStore.toggleUserSelection('2')
    expect(usersStore.selectedUserIds).toEqual(['1', '2'])
    
    // Deselect a user
    usersStore.toggleUserSelection('1')
    expect(usersStore.selectedUserIds).toEqual(['2'])
  })

  it('should toggle all users selection', () => {
    const usersStore = useUsersStore()
    const mockUsers = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
      { id: '3', name: 'User 3' }
    ]
    
    // Set users
    usersStore.$patch({ users: mockUsers })
    
    // Select all
    usersStore.toggleSelectAll(true)
    expect(usersStore.selectedUserIds).toEqual(['1', '2', '3'])
    
    // Deselect all
    usersStore.toggleSelectAll(false)
    expect(usersStore.selectedUserIds).toEqual([])
  })

  it('should check if all users are selected', () => {
    const usersStore = useUsersStore()
    const mockUsers = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
      { id: '3', name: 'User 3' }
    ]
    
    // Set users
    usersStore.$patch({ users: mockUsers })
    
    // None selected
    expect(usersStore.areAllSelected).toBe(false)
    
    // Some selected
    usersStore.toggleUserSelection('1')
    expect(usersStore.areAllSelected).toBe(false)
    
    // All selected
    usersStore.toggleUserSelection('2')
    usersStore.toggleUserSelection('3')
    expect(usersStore.areAllSelected).toBe(true)
  })
})