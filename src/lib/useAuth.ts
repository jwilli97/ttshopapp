import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

interface Role {
  id: number;
  name: string;
}

interface UserRole {
  user_id: string;
  role_id: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmployeeStatus = async (user: User) => {
      try {
        // Single query to check if user has employee role
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            roles!inner (
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('roles.name', 'employee')
          .maybeSingle();

        if (error) throw error;
        setIsEmployee(!!data);
      } catch (error) {
        console.error('Error checking employee status:', error);
        setIsEmployee(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await checkEmployeeStatus(currentUser);
      } else {
        setIsEmployee(false);
      }

      setLoading(false);
    });

    // Initial check
    const initializeAuth = async () => {
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      setUser(initialUser);
      
      if (initialUser) {
        await checkEmployeeStatus(initialUser);
      }

      setLoading(false);
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  return { user, isEmployee, loading };
}