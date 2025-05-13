
// Re-export sonner toast functionality for compatibility
import { toast as sonnerToast } from "sonner";

// These are compatibility functions for existing code
export const useToast = () => {
  return {
    toast: sonnerToast,
    dismiss: sonnerToast.dismiss,
    toasts: [],
  };
};

export const toast = sonnerToast;
