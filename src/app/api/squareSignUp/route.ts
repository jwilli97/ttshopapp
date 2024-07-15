import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
    const { email, password, phoneNumber } = await request.json();

    try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) throw authError;

        if (authData.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                    user_id: authData.user.id,
                    email: authData.user.email,
                    phone_number: phoneNumber || '',
                    updated_at: new Date(),
                    },
                ])
                .select()
                .single();

            if (profileError) throw profileError;

            return NextResponse.json({ success: true, user: authData.user });
        }
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}