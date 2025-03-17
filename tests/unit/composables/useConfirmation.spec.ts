import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useConfirmation } from '@/composables/useConfirmation'
import { nextTick } from 'vue'

describe('useConfirmation', () => {
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = ''
  })

  it('should initialize with default state', () => {
    const { isConfirmationVisible, confirmationMessage, confirmationTitle } = useConfirmation()
    
    expect(isConfirmationVisible.value).toBe(false)
    expect(confirmationMessage.value).toBe('')
    expect(confirmationTitle.value).toBe('Confirm Action')
  })

  it('should show confirmation with custom message and title', async () => {
    const { isConfirmationVisible, confirmationMessage, confirmationTitle, confirm } = useConfirmation()
    
    const promise = confirm('Delete this item?', 'Confirm Deletion')
    
    expect(isConfirmationVisible.value).toBe(true)
    expect(confirmationMessage.value).toBe('Delete this item?')
    expect(confirmationTitle.value).toBe('Confirm Deletion')
    
    // Clean up by resolving the promise
    promise.catch(() => {}) // Ignore rejection
  })

  it('should resolve the promise when confirmed', async () => {
    const { confirm, handleConfirm } = useConfirmation()
    
    const confirmPromise = confirm('Test message')
    const confirmSpy = vi.fn()
    
    confirmPromise.then(confirmSpy)
    
    // Simulate confirmation
    handleConfirm()
    
    // Wait for promise to resolve
    await nextTick()
    
    expect(confirmSpy).toHaveBeenCalled()
  })

  it('should reject the promise when cancelled', async () => {
    const { confirm, handleCancel } = useConfirmation()
    
    const confirmPromise = confirm('Test message')
    const rejectSpy = vi.fn()
    
    confirmPromise.catch(rejectSpy)
    
    // Simulate cancellation
    handleCancel()
    
    // Wait for promise to reject
    await nextTick()
    
    expect(rejectSpy).toHaveBeenCalled()
  })

  it('should set loading state during async operations', async () => {
    const { confirm, handleConfirm, isConfirmationLoading } = useConfirmation()
    
    // Create a delayed action
    const delayedAction = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(resolve, 100)
      })
    })
    
    const confirmPromise = confirm('Test message').then(delayedAction)
    
    // Simulate confirmation
    handleConfirm()
    
    // Check loading state
    expect(isConfirmationLoading.value).toBe(true)
    
    // Mock timer to resolve the promise
    vi.useFakeTimers()
    vi.advanceTimersByTime(100)
    vi.useRealTimers()
    
    // Wait for promise chain to complete
    await confirmPromise
    
    // Loading should be false after completion
    expect(isConfirmationLoading.value).toBe(false)
    expect(delayedAction).toHaveBeenCalled()
  })

  it('should handle multiple confirmation dialogs sequentially', async () => {
    const { confirm, handleConfirm, isConfirmationVisible } = useConfirmation()
    
    // First confirmation
    const firstPromise = confirm('First message')
    expect(isConfirmationVisible.value).toBe(true)
    
    // Confirm first dialog
    handleConfirm()
    await firstPromise
    
    // Dialog should be hidden
    expect(isConfirmationVisible.value).toBe(false)
    
    // Second confirmation
    const secondPromise = confirm('Second message')
    expect(isConfirmationVisible.value).toBe(true)
    
    // Clean up
    secondPromise.catch(() => {}) // Ignore rejection
  })

  it('should reset state after confirmation or cancellation', async () => {
    const { confirm, handleConfirm, handleCancel, isConfirmationVisible, confirmationMessage } = useConfirmation()
    
    // Test after confirmation
    const confirmPromise = confirm('Confirm message')
    handleConfirm()
    await confirmPromise
    
    expect(isConfirmationVisible.value).toBe(false)
    expect(confirmationMessage.value).toBe('')
    
    // Test after cancellation
    const cancelPromise = confirm('Cancel message')
    handleCancel()
    
    try {
      await cancelPromise
    } catch {
      // Expected rejection
    }
    
    expect(isConfirmationVisible.value).toBe(false)
    expect(confirmationMessage.value).toBe('')
  })
})