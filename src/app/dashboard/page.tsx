'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from "@fortawesome/fontawesome-svg-core";
import TinyTokenShop from "@/components/TinyTokenShop";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
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
        <div className="flex h-screen w-full flex-col items-center px-4 py-6 relative">
            <div className="flex flex-row items-center w-full md:w-11/12 justify-between">
                <div className="flex flex-row items-center">
                    <Link href="/Account">
                        <Avatar>
                            <AvatarImage src={avatarUrl} alt="Profile Picture" /> {/* || "profile_pics/profileNug7.png" */}
                            <AvatarFallback className="text-2xl">TT</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex flex-col justify-left md:items-start ml-4">
                        <Link href="/Account">
                            <p className="text-2xl mt-3 font-semibold">{displayName}</p>
                            <p className="text-sm mt-0.5 text-center hover:font-bold">View Account</p>
                        </Link>
                    </div>
                </div>
                <Button className="bg-background hover:bg-transparent w-15 h-11" asChild>
                    <Link href={"/"}> {/* logout function button, delete comment when complete */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 mx-auto md:mx-0">
                            <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col w-full items-center mt-6">
                <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 mb-3 rounded-full"></div>
                <TinyTokenShop loyaltyBalance={loyaltyBalance} /> {/* Renders the TinyTokenShop component, which displays the tiny tokens and shop menu */}
                <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 mt-3 rounded-full"></div>
                <div className="mt-3 mb-3 w-full md:w-auto">
                    {menuUrl && <Image src={menuUrl} width={500} height={100} alt="Current Menu" />}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                <Button className="bg-primary hover:bg-primary/75 w-full md:w-72 h-11 shadow-lg" onClick={() => router.push('/Order')}> 
                    Place Order
                </Button>
            </div>
        </div>
    );
}