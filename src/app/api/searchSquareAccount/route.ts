import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';

const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Production,
});

function formatPhoneNumber(phoneNumber: string): string {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const withCountryCode = digitsOnly.startsWith('1') ? digitsOnly : `1${digitsOnly}`;
    return `+${withCountryCode}`;
}

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json();
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        if (!formattedPhoneNumber.startsWith('+1')) {
            return NextResponse.json({ message: 'Invalid phone number format' }, { status: 400 });
        }

        const response = await client.customersApi.searchCustomers({
            query: {
                filter: {
                    phoneNumber: {
                        exact: formattedPhoneNumber
                    }
                }
            }
        });

        const customer = response.result.customers && response.result.customers[0];

        if (customer && customer.id) {
            // Search for loyalty account
            const loyaltyResponse = await client.loyaltyApi.searchLoyaltyAccounts({
                query: {
                    customerIds: [customer.id]
                }
            });

            const loyaltyAccount = loyaltyResponse.result.loyaltyAccounts && loyaltyResponse.result.loyaltyAccounts[0];

            return NextResponse.json({ 
                customerId: customer.id,
                loyaltyId: loyaltyAccount ? loyaltyAccount.id : null
            });
        } else {
            return NextResponse.json({ customerId: null, loyaltyId: null });
        }
    } catch (error) {
        console.error('Error searching for Square account:', error);
        return NextResponse.json({ message: 'Error searching for Square account' }, { status: 500 });
    }
}