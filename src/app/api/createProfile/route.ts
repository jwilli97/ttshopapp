import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { profileData, extraData, deliveryAddress } = body;
    
    // Get the user ID from the session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Log the data we're about to insert
    console.log('Creating profile with userId:', userId);
    console.log('Profile data:', profileData);
    console.log('Extra data:', extraData);
    console.log('Delivery address:', deliveryAddress);
    
    // Create or update the profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        user_id: userId,
        ...profileData,
        ...extraData,
        delivery_address: deliveryAddress
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
    
  } catch (error: any) {
    console.error('Error in createProfile API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 