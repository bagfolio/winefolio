
// Re-export the toast hooks directly from the shadcn/ui toast implementation
import { useToast as useToastShadcn, toast as toastShadcn } from "@/hooks/use-toast";

export const useToast = useToastShadcn;
export const toast = toastShadcn;
