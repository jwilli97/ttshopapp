import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const loyaltyId = searchParams.get('loyaltyId');

  if (!loyaltyId) {
    return NextResponse.json({ error: 'Loyalty ID is required' }, { status: 400 });
  }

  try {
    const response = await client.loyaltyApi.retrieveLoyaltyAccount(loyaltyId);
    const balance = response.result.loyaltyAccount?.balance || 0;

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error fetching loyalty balance:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty balance' }, { status: 500 });
  }
}