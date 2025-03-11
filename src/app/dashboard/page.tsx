'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import '@fortawesome/fontawesome-svg-core/styles.css';
import TokenShop from "@/components/TokenShop";
import TopNav from "@/components/topNav";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/BottomNav";
import Intercom from '@intercom/messenger-js-sdk';
import { ClipLoader } from "react-spinners";
// config.autoAddCss = false;

export default function Dashboard() {

    const [menuUrl, setMenuUrl] = useState<string>('');
    const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                // First check authentication status
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError) {
                    throw new Error(`Authentication error: ${authError.message}`);
                }
                if (!authData.user) {
                    throw new Error('No authenticated user found');
                }

                // Fetch menu URL
                const menuResponse = await fetch('/api/getMenuUrl');
                if (!menuResponse.ok) {
                    throw new Error(`Menu fetch error: ${menuResponse.status}`);
                }
                const menuData: { url: string } = await menuResponse.json();
                setMenuUrl(menuData.url);

                // Fetch user profile data
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', authData.user.id);

                if (profileError) {
                    throw new Error(`Profile fetch error: ${profileError.message}`);
                }
                
                if (!profiles || profiles.length === 0) {
                    // No profile found - create one
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                user_id: authData.user.id,
                                email: authData.user.email,
                                display_name: authData.user.email?.split('@')[0] || 'New User',
                                created_at: new Date().toISOString(),
                            }
                        ])
                        .select()
                        .single();

                    if (createError) {
                        throw new Error(`Failed to create profile: ${createError.message}`);
                    }
                    
                    if (!newProfile) {
                        throw new Error('Failed to create new profile');
                    }

                    setDisplayName(newProfile.display_name as string);
                    setAvatarUrl(newProfile.avatar_url as string);
                    
                    // Initialize Intercom with new profile
                    Intercom({
                        app_id: 'cdcmnvsm',
                        user_id: newProfile.user_id as string,
                        name: newProfile.display_name as string,
                        email: newProfile.email as string,
                        created_at: new Date(newProfile.created_at as string).getTime(),
                    });

                    // Check loyalty balance for new profile
                    if (newProfile.square_loyalty_id) {
                        const loyaltyResponse = await fetch(`/api/getLoyaltyBalance?loyaltyId=${newProfile.square_loyalty_id}`);
                        if (!loyaltyResponse.ok) {
                            throw new Error(`Loyalty fetch error: ${loyaltyResponse.status}`);
                        }
                        const loyaltyData: { balance: number } = await loyaltyResponse.json();
                        setLoyaltyBalance(loyaltyData.balance);
                    }
                } else {
                    // Use the first profile if multiple exist (shouldn't happen)
                    const profileData = profiles[0];
                    setDisplayName(profileData.display_name as string);
                    setAvatarUrl(profileData.avatar_url as string);
                    
                    // Initialize Intercom with existing profile
                    Intercom({
                        app_id: 'cdcmnvsm',
                        user_id: profileData.user_id as string,
                        name: profileData.display_name as string,
                        email: profileData.email as string,
                        created_at: new Date(profileData.created_at as string).getTime(),
                    });

                    // Check loyalty balance for existing profile
                    if (profileData.square_loyalty_id) {
                        const loyaltyResponse = await fetch(`/api/getLoyaltyBalance?loyaltyId=${profileData.square_loyalty_id}`);
                        if (!loyaltyResponse.ok) {
                            throw new Error(`Loyalty fetch error: ${loyaltyResponse.status}`);
                        }
                        const loyaltyData: { balance: number } = await loyaltyResponse.json();
                        setLoyaltyBalance(loyaltyData.balance);
                    }
                }

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
                console.error("There was a problem fetching data:", error instanceof Error ? error.message : error);
                setError(typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Failed to load data. Please try again later.'));
                // If it's an auth error, redirect to login
                if (error instanceof Error && error.message.includes('Authentication error')) {
                    router.push('/auth/welcome');
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

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
                    <TokenShop loyaltyBalance={loyaltyBalance} /> {/* Renders the TinyTokenShop component, which displays the tiny tokens and shop menu */}
                    <div className="container bg-[#cbd5e1]/25 h-0.5 w-full md:w-11/12 mt-3  rounded-full"></div>
                    {/* <div className="mt-6 mb-36 w-full">
                        {menuUrl && (
                            <div className="w-full mx-auto" style={{ position: 'relative', height: '500px', paddingTop: '100%' }}>
                                <Image
                                    src={menuUrl}
                                    alt="Current Menu"
                                    fill
                                    priority
                                    style={{ objectFit: 'contain' }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                                />
                            </div>
                        )}
                    </div> */}
                    <div className="mt-6 mb-36 w-full">
                        <div className="w-full mx-auto" style={{ position: 'relative', height: '500px', paddingTop: '66.67%' }}>
                            <Image
                                src="https://qrcgcustomers.s3-eu-west-1.amazonaws.com/account13454916/50370932_1.png?0.7927771912096631"
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