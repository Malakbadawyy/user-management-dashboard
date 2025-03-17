import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserFormModal from '@/components/UserFormModal.vue'
import { User, UserRole } from '@/types'

describe('UserFormModal.vue', () => {
  let mockUser: User
  
  beforeEach(() => {
    mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: UserRole.USER,
      status: 'active',
      lastLogin: '2023-01-01T12:00:00Z',
      createdAt: '2022-01-01T12:00:00Z'
    }
  })

  it('renders correctly with user data', () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        user: mockUser,
        isLoading: false,
        mode: 'edit'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Check form fields are populated with user data
    expect(wrapper.find('input[name="name"]').element.value).toBe(mockUser.name)
    expect(wrapper.find('input[name="email"]').element.value).toBe(mockUser.email)
    expect(wrapper.find('select[name="role"]').element.value).toBe(mockUser.role)
    expect(wrapper.find('select[name="status"]').element.value).toBe(mockUser.status)
  })
  
  it('renders empty form in create mode', () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        isLoading: false,
        mode: 'create'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Check form fields are empty
    expect(wrapper.find('input[name="name"]').element.value).toBe('')
    expect(wrapper.find('input[name="email"]').element.value).toBe('')
  })
  
  it('validates required fields', async () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        isLoading: false,
        mode: 'create'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Submit form without filling required fields
    await wrapper.find('form').trigger('submit.prevent')
    
    // Check validation errors
    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Email is required')
  })
  
  it('validates email format', async () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        isLoading: false,
        mode: 'create'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Fill invalid email
    await wrapper.find('input[name="name"]').setValue('John Doe')
    await wrapper.find('input[name="email"]').setValue('invalid-email')
    
    // Submit form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Check validation error
    expect(wrapper.text()).toContain('Please enter a valid email address')
  })
  
  it('emits save event with form data when valid', async () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        isLoading: false,
        mode: 'create'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Fill form with valid data
    await wrapper.find('input[name="name"]').setValue('Jane Smith')
    await wrapper.find('input[name="email"]').setValue('jane@example.com')
    await wrapper.find('select[name="role"]').setValue(UserRole.ADMIN)
    await wrapper.find('select[name="status"]').setValue('active')
    
    // Submit form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Check save event
    expect(wrapper.emitted()).toHaveProperty('save')
    expect(wrapper.emitted('save')?.[0][0]).toEqual({
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: UserRole.ADMIN,
      status: 'active'
    })
  })
  
  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        isLoading: false,
        mode: 'edit',
        user: mockUser
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Click cancel button
    await wrapper.find('button[type="button"]').trigger('click')
    
    // Check cancel event
    expect(wrapper.emitted()).toHaveProperty('cancel')
  })
  
  it('disables form controls when loading', () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        isLoading: true,
        mode: 'edit',
        user: mockUser
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Check form controls are disabled
    expect(wrapper.find('input[name="name"]').element.disabled).toBe(true)
    expect(wrapper.find('input[name="email"]').element.disabled).toBe(true)
    expect(wrapper.find('select[name="role"]').element.disabled).toBe(true)
    expect(wrapper.find('select[name="status"]').element.disabled).toBe(true)
    expect(wrapper.find('button[type="submit"]').element.disabled).toBe(true)
  })
  
  it('shows loading indicator when loading', () => {
    const wrapper = mount(UserFormModal, {
      props: {
        isVisible: true,
        isLoading: true,
        mode: 'edit',
        user: mockUser
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    // Check loading indicator is shown
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })
})