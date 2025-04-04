import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

interface UserRole {
  roles: {
    name: string;
  };
}

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Check if the requester is an employee using the auth helper
    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is an employee
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles!inner(name)')
      .eq('user_id', user.id) as PostgrestSingleResponse<UserRole[]>;

    const isEmployee = userRoles?.some(role => 
      role.roles.name === 'employee' || role.roles.name === 'admin'
    );

    if (!isEmployee) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Fetch the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('strain_preference, replacement_preference, display_name')
      .eq('user_id', orderData.user_id)
      .maybeSingle();

    if (profileError) throw profileError;

    return NextResponse.json({
      order: orderData,
      profile: profileData
    });

  } catch (error: any) {
    console.error('Error in getUserDetails:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 