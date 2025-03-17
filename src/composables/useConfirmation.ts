import { ref } from 'vue';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
}

export function useConfirmation() {
  const isOpen = ref(false);
  const options = ref<ConfirmationOptions>({
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info'
  });
  
  let resolvePromise: ((value: boolean) => void) | null = null;
  
  const confirm = (customOptions: ConfirmationOptions): Promise<boolean> => {
    options.value = { ...options.value, ...customOptions };
    isOpen.value = true;
    
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };
  
  const handleConfirm = () => {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  };
  
  const handleCancel = () => {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  };
  
  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel
  };
}