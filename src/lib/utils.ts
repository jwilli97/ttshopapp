import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const trimmed = numbers.substring(0, 10);
  
  // Format the number
  if (trimmed.length > 6) {
    return `(${trimmed.substring(0, 3)}) ${trimmed.substring(3, 6)}-${trimmed.substring(6)}`;
  } else if (trimmed.length > 3) {
    return `(${trimmed.substring(0, 3)}) ${trimmed.substring(3)}`;
  } else if (trimmed.length > 0) {
    return `(${trimmed}`;
  }
  
  return trimmed;
}
