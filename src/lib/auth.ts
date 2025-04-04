import { supabase } from './supabaseClient';

interface Role {
  name: string;
}

interface UserRoleWithRoles {
  roles: Role;
}

export async function checkIsEmployee() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('user_id', user.id)
      .eq('roles.name', 'employee')
      .single();
      
    return !error && data;
  } catch (error) {
    console.error('Error checking employee status:', error);
    return false;
  }
}

export async function getUserRoles() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('user_id', user.id) as { data: UserRoleWithRoles[] | null, error: any };
      
    if (error || !data) return [];
    return data.map(role => role.roles.name);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

// Helper to protect routes/components that require employee access
export async function requireEmployee() {
  const isEmployee = await checkIsEmployee();
  if (!isEmployee) {
    throw new Error('Access denied. Employee privileges required.');
  }
  return true;
} 