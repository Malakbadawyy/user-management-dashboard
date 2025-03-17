import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebounce } from '@/composables/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should debounce the function call', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    // Call the debounced function
    debouncedFn('test')
    
    // Function should not be called immediately
    expect(mockFn).not.toHaveBeenCalled()
    
    // Fast-forward time
    vi.advanceTimersByTime(300)
    
    // Function should be called after the delay
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('should cancel previous calls when called again', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    // Call the debounced function multiple times
    debouncedFn('test1')
    
    // Advance time partially
    vi.advanceTimersByTime(100)
    
    // Call again before the first call executes
    debouncedFn('test2')
    
    // Advance time partially again
    vi.advanceTimersByTime(100)
    
    // Call again before the second call executes
    debouncedFn('test3')
    
    // Fast-forward time to complete the delay
    vi.advanceTimersByTime(300)
    
    // Only the last call should be executed
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('test3')
  })

  it('should pass multiple arguments to the original function', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    // Call with multiple arguments
    debouncedFn('test', 123, { key: 'value' })
    
    // Fast-forward time
    vi.advanceTimersByTime(300)
    
    // Check all arguments were passed
    expect(mockFn).toHaveBeenCalledWith('test', 123, { key: 'value' })
  })

  it('should maintain the correct context', () => {
    const obj = {
      value: 'test',
      method: vi.fn(function(this: any) {
        return this.value
      })
    }
    
    const { debouncedFn } = useDebounce(obj.method.bind(obj), 300)
    
    debouncedFn()
    vi.advanceTimersByTime(300)
    
    expect(obj.method).toHaveBeenCalledTimes(1)
  })

  it('should allow immediate execution with the immediate option', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300, true)

    // Call the debounced function
    debouncedFn('test')
    
    // Function should be called immediately
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('test')
    
    // Fast-forward time
    vi.advanceTimersByTime(300)
    
    // Function should not be called again
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should not execute again within the delay period when immediate is true', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300, true)

    // First call - should execute immediately
    debouncedFn('test1')
    expect(mockFn).toHaveBeenCalledTimes(1)
    
    // Second call within delay period - should not execute
    debouncedFn('test2')
    expect(mockFn).toHaveBeenCalledTimes(1)
    
    // Fast-forward time
    vi.advanceTimersByTime(300)
    
    // Third call after delay period - should execute
    debouncedFn('test3')
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('test3')
  })
})