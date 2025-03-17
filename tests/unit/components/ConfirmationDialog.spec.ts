import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'

describe('ConfirmationDialog.vue', () => {
  let originalAddEventListener: typeof document.addEventListener
  let originalRemoveEventListener: typeof document.removeEventListener

  beforeEach(() => {
    // Mock document event listeners
    originalAddEventListener = document.addEventListener
    originalRemoveEventListener = document.removeEventListener
    document.addEventListener = vi.fn()
    document.removeEventListener = vi.fn()
  })

  afterEach(() => {
    // Restore original event listeners
    document.addEventListener = originalAddEventListener
    document.removeEventListener = originalRemoveEventListener
  })

  it('renders correctly when visible', () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        title: 'Test Title',
        message: 'Test Message',
        confirmText: 'Yes',
        cancelText: 'No'
      },
      global: {
        stubs: {
          Teleport: true // Stub teleport for testing
        }
      }
    })
    
    expect(wrapper.find('.confirmation-dialog-title').text()).toBe('Test Title')
    expect(wrapper.find('.confirmation-dialog-message').text()).toBe('Test Message')
    expect(wrapper.findAll('button')[0].text()).toBe('No')
    expect(wrapper.findAll('button')[1].text()).toBe('Yes')
  })
  
  it('does not render when not visible', () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: false,
        message: 'Test Message'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    expect(wrapper.find('.confirmation-dialog').exists()).toBe(false)
  })
  
  it('emits confirm event when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        message: 'Test Message'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted()).toHaveProperty('confirm')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })
  
  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        message: 'Test Message'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted()).toHaveProperty('cancel')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('does not emit events when loading', async () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        message: 'Test Message',
        isLoading: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    await wrapper.findAll('button')[0].trigger('click') // Cancel button
    await wrapper.findAll('button')[1].trigger('click') // Confirm button
    
    expect(wrapper.emitted('cancel')).toBeFalsy()
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })

  it('closes on backdrop click when closeOnBackdropClick is true', async () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        message: 'Test Message',
        closeOnBackdropClick: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    await wrapper.find('.confirmation-dialog-backdrop').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('cancel')
  })

  it('does not close on backdrop click when closeOnBackdropClick is false', async () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        message: 'Test Message',
        closeOnBackdropClick: false
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    await wrapper.find('.confirmation-dialog-backdrop').trigger('click')
    expect(wrapper.emitted('cancel')).toBeFalsy()
  })

  it('registers keydown event listener on mount', () => {
    mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        message: 'Test Message'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('removes keydown event listener on unmount', () => {
    const wrapper = mount(ConfirmationDialog, {
      props: {
        isVisible: true,
        message: 'Test Message'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    
    wrapper.unmount()
    expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})