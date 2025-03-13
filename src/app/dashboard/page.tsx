'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import '@fortawesome/fontawesome-svg-core/styles.css';
import TokenShop from "@/components/TokenShop";
import TopNav from "@/components/topNav";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BottomNav from "@/components/BottomNav";
import Intercom from '@intercom/messenger-js-sdk';
import { ClipLoader } from "react-spinners";
// config.autoAddCss = false;

export default function Dashboard() {

    const [menuUrl, setMenuUrl] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    // Create Supabase client inside the component
    const supabase = createClientComponentClient();

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                // Get session first
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    console.log('Session error or no session:', sessionError);
                    router.push('/auth/welcome');
                    return;
                }

                setUserId(session.user.id);

                // Fetch user profile data
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                    throw new Error(`Profile fetch error: ${profileError.message}`);
                }
                
                if (!profile) {
                    console.error('No profile found');
                    throw new Error('No profile found. Please contact support.');
                }

                console.log('Profile data:', {
                    square_loyalty_id: profile.square_loyalty_id,
                    loyalty_balance: profile.loyalty_balance,
                    loyalty_balance_updated_at: profile.loyalty_balance_updated_at
                });

                setDisplayName(profile.display_name as string);
                setAvatarUrl(profile.avatar_url as string);
                
                // Initialize Intercom
                Intercom({
                    app_id: 'cdcmnvsm',
                    user_id: profile.user_id as string,
                    name: profile.display_name as string,
                    email: profile.email as string,
                    created_at: new Date(profile.created_at as string).getTime(),
                });

                // Fetch menu URL
                const menuResponse = await fetch('/api/getMenuUrl');
                if (!menuResponse.ok) {
                    throw new Error(`Menu fetch error: ${menuResponse.status}`);
                }
                const menuData: { url: string } = await menuResponse.json();
                setMenuUrl(menuData.url);

                // Add custom CSS to adjust Intercom position
                const style = document.createElement('style');
                style.innerHTML = `
                    #intercom-container {
                        bottom: 50px !important;
                    }
                    .intercom-lightweight-app-launcher {
                        bottom: 50px !important;
                    }
                `;
                document.head.appendChild(style);
            } catch (error) {
                console.error("There was a problem fetching data:", error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
                setError(errorMessage);
                
                // Handle specific error cases
                if (errorMessage.includes('No profile found')) {
                    // Redirect to support or contact page
                    router.push('/support');
                } else if (errorMessage.includes('Authentication error')) {
                    router.push('/auth/welcome');
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <ClipLoader className="text-primary" size={50} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="flex h-screen w-full flex-col items-center px-4 py-6 relative">
                <div className="w-full">
                    <TopNav />
                </div>
                <div className="flex flex-col w-full items-center">
                    <div className="container bg-[#cbd5e1]/25 h-0.5 w-full md:w-11/12 mb-3 rounded-full"></div>
                    <TokenShop userId={userId || ''} />
                    <div className="container bg-[#cbd5e1]/25 h-0.5 w-full md:w-11/12 mt-3  rounded-full"></div>
                    <div className="mt-6 mb-36 w-full">
                        <div className="w-full mx-auto" style={{ position: 'relative', height: '500px', paddingTop: '66.67%' }}>
                            <Image
                                src="/HTX_menu_mar13.png"
                                alt="Current Menu"
                                fill
                                priority
                                style={{ objectFit: 'contain' }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </div>
                </div>
                <div className="fixed bottom-14 left-0 w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="text-white text-lg hover:bg-primary bg-primary w-full md:w-72 h-11 shadow-lg" onClick={() => router.push('/Order')}> 
                        Place Order
                    </Button>
                </div>
                <BottomNav />
            </div>
        </ProtectedRoute>
    );
}