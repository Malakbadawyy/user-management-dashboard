import { ObjectDirective } from 'vue';
import { useAuthStore } from '../stores/auth';

interface PermissionValue {
  role: string | string[];
}

export const vPermission: ObjectDirective<HTMLElement, PermissionValue> = {
  mounted(el, binding) {
    const { value } = binding;
    const authStore = useAuthStore();
    const userRole = authStore.userRole;
    
    if (!userRole) {
      el.style.display = 'none';
      return;
    }
    
    const requiredRoles = Array.isArray(value.role) ? value.role : [value.role];
    
    if (!requiredRoles.includes(userRole)) {
      el.style.display = 'none';
    }
  },
  
  updated(el, binding) {
    const { value } = binding;
    const authStore = useAuthStore();
    const userRole = authStore.userRole;
    
    if (!userRole) {
      el.style.display = 'none';
      return;
    }
    
    const requiredRoles = Array.isArray(value.role) ? value.role : [value.role];
    
    if (!requiredRoles.includes(userRole)) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  }
};