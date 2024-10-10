import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';

// Initialize the Square client
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

export async function POST(request: Request) {
  try {
    const { accountId, points, reason } = await request.json();
    console.log('Received POST request to /api/redeemRewards');
    console.log('Request body:', { accountId, points, reason });

    if (!accountId || points === undefined || !reason) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const idempotencyKey = Date.now().toString(); // Generate a unique key for each request

    const response = await client.loyaltyApi.adjustLoyaltyPoints(accountId, {
      idempotencyKey,
      adjustPoints: {
        points: points,
        reason: reason
      },
      allowNegativeBalance: false // Change this if you want to allow negative balances
    });

    return NextResponse.json(response.result);
  } catch (error: any) {
    console.error('Error adjusting loyalty points:', error);
    return NextResponse.json({ error: 'Failed to adjust loyalty points', details: error.message }, { status: 500 });
  }
}