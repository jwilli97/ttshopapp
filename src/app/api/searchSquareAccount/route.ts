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

        const customer = response.result.customers && response.result.customers[0];

        if (customer) {
            return NextResponse.json({ customerId: customer.id });
        } else {
            return NextResponse.json({ squareId: null });
        }
    } catch (error) {
        console.error('Error searching for Square account:', error);
        return NextResponse.json({ message: 'Error searching for Square account' }, { status: 500 });
    }
}

function formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    // If the number doesn't start with '1', add it
    const withCountryCode = digitsOnly.startsWith('1') ? digitsOnly : `1${digitsOnly}`;
    // Add the '+' at the beginning
    return `+${withCountryCode}`;
}