import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
        }

        const formattedPhoneNumber = phoneNumber.startsWith('+1') ? phoneNumber.slice(2) : phoneNumber;

        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone_number', formattedPhoneNumber)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        const exists = !!data;
        console.log('Account exists:', exists);

        return NextResponse.json({ exists: !!data });
    } catch (error) {
        console.error('Error checking account:', error);
        return NextResponse.json({ message: 'Error checking account' }, { status: 500 });
    }
}