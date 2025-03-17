import { ref, watch } from 'vue';

export function useDebounce<T>(value: T, delay: number = 500) {
  const debouncedValue = ref<T>(value);
  const isDebouncing = ref(false);
  let timeout: number | null = null;
  
  watch(
    () => value,
    (newValue) => {
      isDebouncing.value = true;
      
      if (timeout) {
        window.clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(() => {
        debouncedValue.value = newValue;
        isDebouncing.value = false;
      }, delay);
    }
  );
  
  return { debouncedValue, isDebouncing };
}