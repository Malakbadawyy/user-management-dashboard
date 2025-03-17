import { User } from '../stores/users';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random latency between 300-800ms
const randomLatency = () => Math.floor(Math.random() * 500) + 300;

// Simulate random failures (10% chance)
const simulateRandomFailure = (failureRate = 0.1) => {
  if (Math.random() < failureRate) {
    throw new Error('API request failed. Please try again.');
  }
};

// Mock user data
const generateMockUsers = (count: number): User[] => {
  const roles = ['admin', 'manager', 'viewer'];
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Support'];
  
  return Array.from({ length: count }, (_, i) => {
    const id = `user-${i + 1}`;
    const role = roles[Math.floor(Math.random() * roles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    
    // Generate a date between 1-3 years ago
    const daysAgo = Math.floor(Math.random() * 1000) + 100;
    const dateJoined = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Last login between 0-30 days ago
    const loginDaysAgo = Math.floor(Math.random() * 30);
    const lastLogin = new Date(Date.now() - loginDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      id,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role,
      status,
      department,
      dateJoined,
      lastLogin,
      avatar: `https://i.pravatar.cc/150?u=${id}`
    };
  });
};

// Create mock users
const mockUsers = generateMockUsers(55);

// Mock roles data
const mockRoles = [
  { id: 'admin', name: 'Administrator', permissions: ['read', 'write', 'delete', 'manage_users'] },
  { id: 'manager', name: 'Manager', permissions: ['read', 'write', 'limited_delete'] },
  { id: 'viewer', name: 'Viewer', permissions: ['read'] }
];

// Mock API implementation
export const mockApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Mock authentication logic
    if (email === 'admin@example.com' && password === 'password') {
      return {
        user: {
          id: 'admin-user',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        },
        token: 'mock-jwt-token-for-admin'
      };
    } else if (email === 'manager@example.com' && password === 'password') {
      return {
        user: {
          id: 'manager-user',
          name: 'Manager User',
          email: 'manager@example.com',
          role: 'manager'
        },
        token: 'mock-jwt-token-for-manager'
      };
    } else if (email === 'viewer@example.com' && password === 'password') {
      return {
        user: {
          id: 'viewer-user',
          name: 'Viewer User',
          email: 'viewer@example.com',
          role: 'viewer'
        },
        token: 'mock-jwt-token-for-viewer'
      };
    }
    
    throw new Error('Invalid email or password');
  },
  
  async logout() {
    await delay(randomLatency());
    return { success: true };
  },
  
  // User endpoints
  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    let filteredUsers = [...mockUsers];
    
    // Apply search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role filter
    if (params.role) {
      filteredUsers = filteredUsers.filter(user => user.role === params.role);
    }
    
    // Apply status filter
    if (params.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status);
    }
    
    // Apply sorting
    if (params.sortBy) {
      filteredUsers.sort((a: any, b: any) => {
        const aValue = a[params.sortBy as keyof User];
        const bValue = b[params.sortBy as keyof User];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return params.sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return params.sortDirection === 'asc' 
          ? (aValue > bValue ? 1 : -1) 
          : (aValue < bValue ? 1 : -1);
      });
    }
    
    // Calculate pagination
    const total = filteredUsers.length;
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit)
    };
  },
  
  async getUserById(id: string) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    const user = mockUsers.find(user => user.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  },
  
  async getUsersByIds(ids: string[]) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    return mockUsers.filter(user => ids.includes(user.id));
  },
  
  async getAllUsers() {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    return mockUsers;
  },
  
  async updateUser(id: string, userData: Partial<User>) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    // Update user data
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    
    return mockUsers[userIndex];
  },
  
  async createUser(userData: Omit<User, 'id'>) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    // Generate new ID
    const id = `user-${mockUsers.length + 1}`;
    
    const newUser: User = {
      id,
      ...userData
    };
    
    mockUsers.unshift(newUser);
    
    return newUser;
  },
  
  async deleteUser(id: string) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    mockUsers.splice(userIndex, 1);
    
    return { success: true };
  },
  
  async bulkDeleteUsers(ids: string[]) {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    for (const id of ids) {
      const userIndex = mockUsers.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
      }
    }
    
    return { success: true };
  },
  
  // Role endpoints
  async getRoles() {
    await delay(randomLatency());
    simulateRandomFailure(0.05);
    
    return mockRoles;
  }
};