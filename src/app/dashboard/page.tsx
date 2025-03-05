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
                // Fetch menu URL
                const menuResponse = await fetch('/api/getMenuUrl');
                if (!menuResponse.ok) {
                    throw new Error(`HTTP error! status: ${menuResponse.status}`);
                }
                const menuData: { url: string } = await menuResponse.json();
                setMenuUrl(menuData.url);
    
                // Fetch user data including Square Loyalty ID
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
    
                    if (error) throw error;
                    if (data) {
                        setDisplayName(data.display_name as string);
                        setAvatarUrl(data.avatar_url as string);

                        Intercom({
                            app_id: 'cdcmnvsm',
                            user_id: data.user_id as string,
                            name: data.display_name as string,
                            email: data.email as string,
                            created_at: data.created_at as number,
                        });
                        
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
                        
                        // Fetch loyalty balance using Square Loyalty ID
                        if (data.square_loyalty_id) {
                            const loyaltyResponse = await fetch(`/api/getLoyaltyBalance?loyaltyId=${data.square_loyalty_id}`);
                            if (!loyaltyResponse.ok) {
                                throw new Error(`HTTP error! status: ${loyaltyResponse.status}`);
                            }
                            const loyaltyData: { balance: number } = await loyaltyResponse.json();
                            setLoyaltyBalance(loyaltyData.balance);
                        } else {
                            console.warn('No Square Loyalty ID found for this user');
                        }
                    }
                }
            } catch (error) {
                console.error("There was a problem fetching data:", error);
                setError("Failed to load data. Please try again later.");
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