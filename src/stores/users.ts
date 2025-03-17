import { defineStore } from 'pinia';
import { mockApi } from '../services/mockApi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  dateJoined: string;
  lastLogin: string;
  department: string;
  avatar?: string;
}

interface UsersState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  filterRole: string;
  filterStatus: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  selectedUserIds: string[];
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    totalUsers: 0,
    currentPage: 1,
    itemsPerPage: 10,
    searchQuery: '',
    filterRole: '',
    filterStatus: '',
    sortBy: 'name',
    sortDirection: 'asc',
    selectedUserIds: []
  }),
  
  getters: {
    filteredUsers: (state) => {
      return state.users;
    },
    
    paginationInfo: (state) => {
      return {
        currentPage: state.currentPage,
        totalPages: Math.ceil(state.totalUsers / state.itemsPerPage),
        itemsPerPage: state.itemsPerPage,
        totalItems: state.totalUsers
      };
    }
  },
  
  actions: {
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await mockApi.getUsers({
          page: this.currentPage,
          limit: this.itemsPerPage,
          search: this.searchQuery,
          role: this.filterRole,
          status: this.filterStatus,
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
        });
        
        this.users = response.users;
        this.totalUsers = response.total;
        return response;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch users';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchUserById(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const user = await mockApi.getUserById(id);
        this.selectedUser = user;
        return user;
      } catch (error: any) {
        this.error = error.message || `Failed to fetch user with ID: ${id}`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateUser(id: string, userData: Partial<User>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Optimistic update
        if (this.selectedUser && this.selectedUser.id === id) {
          this.selectedUser = { ...this.selectedUser, ...userData };
        }
        
        const updatedUser = await mockApi.updateUser(id, userData);
        
        // Update user in the list if present
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        
        return updatedUser;
      } catch (error: any) {
        this.error = error.message || `Failed to update user with ID: ${id}`;
        
        // Revert optimistic update
        if (id) {
          await this.fetchUserById(id);
        }
        
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createUser(userData: Omit<User, 'id'>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const newUser = await mockApi.createUser(userData);
        
        // Add to list if on first page
        if (this.currentPage === 1) {
          this.users = [newUser, ...this.users.slice(0, this.itemsPerPage - 1)];
          this.totalUsers++;
        } else {
          // Just update the count
          this.totalUsers++;
        }
        
        return newUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to create user';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteUser(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Optimistic delete
        const userIndex = this.users.findIndex(user => user.id === id);
        const deletedUser = this.users[userIndex];
        
        if (userIndex !== -1) {
          this.users.splice(userIndex, 1);
          this.totalUsers--;
        }
        
        await mockApi.deleteUser(id);
        return true;
      } catch (error: any) {
        this.error = error.message || `Failed to delete user with ID: ${id}`;
        
        // Revert optimistic delete
        await this.fetchUsers();
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async bulkDeleteUsers() {
      if (!this.selectedUserIds.length) return;
      
      this.isLoading = true;
      this.error = null;
      
      try {
        // Optimistic update
        const usersToDelete = this.users.filter(user => 
          this.selectedUserIds.includes(user.id)
        );
        
        this.users = this.users.filter(user => 
          !this.selectedUserIds.includes(user.id)
        );
        this.totalUsers -= this.selectedUserIds.length;
        
        await mockApi.bulkDeleteUsers(this.selectedUserIds);
        this.selectedUserIds = [];
        return true;
      } catch (error: any) {
        this.error = error.message || 'Failed to delete selected users';
        
        // Revert optimistic delete
        await this.fetchUsers();
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    setPage(page: number) {
      this.currentPage = page;
      this.fetchUsers();
    },
    
    setItemsPerPage(items: number) {
      this.itemsPerPage = items;
      this.currentPage = 1;
      this.fetchUsers();
    },
    
    setSearchQuery(query: string) {
      this.searchQuery = query;
      this.currentPage = 1;
      this.fetchUsers();
    },
    
    setFilters(role: string, status: string) {
      this.filterRole = role;
      this.filterStatus = status;
      this.currentPage = 1;
      this.fetchUsers();
    },
    
    setSorting(field: string) {
      if (this.sortBy === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = field;
        this.sortDirection = 'asc';
      }
      this.fetchUsers();
    },
    
    toggleUserSelection(userId: string) {
      const index = this.selectedUserIds.indexOf(userId);
      if (index === -1) {
        this.selectedUserIds.push(userId);
      } else {
        this.selectedUserIds.splice(index, 1);
      }
    },
    
    selectAllUsers() {
      if (this.selectedUserIds.length === this.users.length) {
        this.selectedUserIds = [];
      } else {
        this.selectedUserIds = this.users.map(user => user.id);
      }
    },
    
    clearSelections() {
      this.selectedUserIds = [];
    },
    
    async exportUsersToCsv() {
      try {
        const users = this.selectedUserIds.length > 0 
          ? await mockApi.getUsersByIds(this.selectedUserIds)
          : await mockApi.getAllUsers();
        
        // Convert users to CSV
        const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Department', 'Date Joined', 'Last Login'];
        const csvRows = [headers.join(',')];
        
        for (const user of users) {
          const row = [
            user.id,
            `"${user.name}"`,
            user.email,
            user.role,
            user.status,
            `"${user.department}"`,
            user.dateJoined,
            user.lastLogin
          ];
          csvRows.push(row.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Failed to export users';
        throw error;
      }
    }
  }
});