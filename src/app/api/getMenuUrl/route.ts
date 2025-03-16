import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Shared Supabase instance for this API
const getSupabaseInstance = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

// Get all menu information
export async function GET(request: Request) {
    const supabase = getSupabaseInstance();

    try {
        // Get URL for current_menu.png
        const { data: currentMenuData } = await supabase.storage
            .from('menus')
            .getPublicUrl('current_menu.png');

        // List all files in the menus bucket
        const { data: menuFiles, error } = await supabase.storage
            .from('menus')
            .list();

        if (error) {
            console.error('Error listing menu files:', error);
            return NextResponse.json(
                { error: 'Failed to list menu files' },
                { status: 500 }
            );
        }

        // Generate public URLs for all files
        const fileObjects = menuFiles ? menuFiles.map(item => ({
            name: item.name,
            url: supabase.storage.from('menus').getPublicUrl(item.name).data.publicUrl,
            size: item.metadata?.size || 0,
            createdAt: item.created_at || null
        })) : [];

        // Add cache control headers
        const headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        };

        return NextResponse.json({
            currentMenu: {
                url: currentMenuData.publicUrl
            },
            menuFiles: fileObjects
        }, { headers });
    } catch (error) {
        console.error('Error in getMenuUrl API:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}