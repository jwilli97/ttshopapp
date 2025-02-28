import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a singleton Supabase client using a module-level variable
// This ensures only one instance is created across the entire application
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
  }
  return supabaseInstance;
}

// For backward compatibility with existing code
export const supabase = getSupabaseClient();
