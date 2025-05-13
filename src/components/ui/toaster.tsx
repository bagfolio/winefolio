
// This file is kept for compatibility reasons but functionality is now provided by sonner
import { toast as sonnerToast } from "sonner";

export function Toaster() {
  // Empty component - we now use <Toaster /> from sonner directly in App.tsx
  return null;
}

// Re-export sonner toast for backward compatibility
export const toast = sonnerToast;
