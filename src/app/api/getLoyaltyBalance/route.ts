import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';
import { createClient } from '@supabase/supabase-js';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const loyaltyId = searchParams.get('loyaltyId');
  const userId = searchParams.get('userId');

  if (!loyaltyId || !userId) {
    return NextResponse.json({ 
      error: 'Loyalty ID and User ID are required' 
    }, { status: 400 });
  }

  try {
    // Fetch from Square
    const response = await client.loyaltyApi.retrieveLoyaltyAccount(loyaltyId);
    const balance = response.result.loyaltyAccount?.balance || 0;

    // Update Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        loyalty_balance: balance,
        loyalty_balance_updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating Supabase:', updateError);
      // Still return the balance even if Supabase update fails
      return NextResponse.json({ balance, warning: 'Failed to update local cache' });
    }

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error fetching loyalty balance:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch loyalty balance' 
    }, { status: 500 });
  }
}