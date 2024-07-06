import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';

const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Production,
});

export async function POST(request: Request) {
    // console.log('API route hit');

    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber || !phoneNumber.startsWith('+1')) {
            return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
        }

        const response = await client.customersApi.searchCustomers({
            query: {
                filter: {
                    phoneNumber: {
                        exact: phoneNumber
                    }
                }
            }
        });

        const customerExists = response.result.customers && response.result.customers.length > 0;

        return NextResponse.json({ exists: customerExists });
    } catch (error) {
        console.error('Error checking account:', error);
        return NextResponse.json({ message: 'Error checking account' }, { status: 500 });
    }
}