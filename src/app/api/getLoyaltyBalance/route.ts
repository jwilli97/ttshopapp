import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    const response = await client.loyaltyApi.retrieveLoyaltyAccount(customerId);
    const balance = response.result.loyaltyAccount?.balance || 0;

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error fetching loyalty balance:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty balance' }, { status: 500 });
  }
}