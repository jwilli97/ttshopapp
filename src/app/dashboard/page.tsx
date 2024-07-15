'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from "@fortawesome/fontawesome-svg-core";
import TinyTokenShop from "@/components/TinyTokenShop";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import LogOutButton from "@/components/logoutButton";
config.autoAddCss = false;

export default function Dashboard() {

    const [menuUrl, setMenuUrl] = useState<string>('');
    const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch menu URL
                const menuResponse = await fetch('/api/getMenuUrl');
                if (!menuResponse.ok) {
                    throw new Error(`HTTP error! status: ${menuResponse.status}`);
                }
                const menuData: { url: string } = await menuResponse.json();
                setMenuUrl(menuData.url);

                // Fetch loyalty balance
                const customerId = '0ead1ed9-3dfd-4f33-a580-59661a7467a9'; // Replace with actual customer ID, delete comment when complete
                const loyaltyResponse = await fetch(`/api/getLoyaltyBalance?customerId=${customerId}`);
                if (!loyaltyResponse.ok) {
                    throw new Error(`HTTP error! status: ${loyaltyResponse.status}`);
                }
                const loyaltyData: { balance: number } = await loyaltyResponse.json();
                setLoyaltyBalance(loyaltyData.balance);

                // Fetch display name
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('display_name, avatar_url')
                        .eq('user_id', user.id)
                        .single();

                        if (error) throw error;
                        if (data) {
                            setDisplayName(data.display_name);
                            setAvatarUrl(data.avatar_url);
                        }
                }
            } catch (error) {
                console.error("There was a problem fetching data:", error);
            }
        }
        fetchData();
    }, []);

    return (
        <ProtectedRoute>
            <div className="flex h-screen w-full flex-col items-center px-4 py-6 relative">
                <div className="flex flex-row items-center w-full md:w-11/12 justify-between">
                    <div className="flex flex-row items-center cursor-pointer" onClick={() => router.push('/Account')}>
                        <Avatar>
                            <AvatarImage src={avatarUrl} alt="Profile Picture" /> {/* || "profile_pics/profileNug7.png" */}
                            <AvatarFallback className="text-2xl">TT</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col justify-left md:items-start ml-4" onClick={() => router.push('/Account')}>
                            <p className="text-2xl mt-3 font-semibold cursor-pointer">{displayName}</p>
                            <p className="text-sm mt-0.5 text-center hover:font-bold cursor-pointer">View Account</p>
                        </div>
                    </div>
                    <LogOutButton />
                </div>
                <div className="flex flex-col w-full items-center mt-6">
                    <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 mb-3 rounded-full"></div>
                    <TinyTokenShop loyaltyBalance={loyaltyBalance} /> {/* Renders the TinyTokenShop component, which displays the tiny tokens and shop menu */}
                    <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 mt-3 rounded-full"></div>
                    <div className="mt-3 mb-20 w-full md:w-auto">
                        {menuUrl && <Image src={menuUrl} width={500} height={100} alt="Current Menu" />}
                    </div>
                </div>
                <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="bg-primary hover:bg-primary/75 w-full md:w-72 h-11 shadow-lg" onClick={() => router.push('/Order')}> 
                        Place Order
                    </Button>
                </div>
            </div>
        </ProtectedRoute>
    );
}