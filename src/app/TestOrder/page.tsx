'use client';

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogOutButton from "@/components/logoutButton";
import { Button } from "@/components/ui/button";

export default function Order() {

    const [orderInput, setOrderInput] = useState('');
    const [menuUrl, setMenuUrl] = useState<string>('');
    const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [address, setAddress] = useState<string>('Loading...');
    const [phoneNumber, setPhoneNumber] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
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
    
                // Fetch user data
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('display_name, avatar_url, square_loyalty_id, address, phone_number')
                        .eq('user_id', user.id)
                        .single();
    
                    if (error) throw error;
                    if (data) {
                        setDisplayName(data.display_name);
                        setAvatarUrl(data.avatar_url);
                        setAddress(data.address);
                        setPhoneNumber(data.phone_number);
                        
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
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="flex h-screen w-full flex-col place-items-center px-4 py-6 relative">
        {/* TODO: Add ProtectedRoute */}
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
            <div className="container bg-[#cbd5e1] h-0.5 w-full mt-2 mb-4 md:w-11/12 rounded-full"></div>
                <div className="mt-4 w-full md:w-auto">
                    {menuUrl && <Image src={menuUrl} width={500} height={100} alt="Current Menu" />}
                </div>
            <div className="flex flex-col w-full place-items-center justify-center mt-6">
                <form className="w-7/12 mt-4 mb-8">
                    <Label htmlFor="orderInput">Please enter your order below:</Label>
                    <Textarea className="mt-2 mb-6" placeholder="Mo Don City: Rainbow Runtz, Devine Gelato, Glitter Bomb, Red Velvet" />
                    <Label htmlFor="orderInput">Confirm your delivery information:</Label>
                    <div className="mt-1 mb-8">
                        <p className="text-primary font-semibold">Delivery Address: {address}</p>
                        <p className="text-primary font-semibold">Phone Number: {phoneNumber}</p>
                    </div>
                    <Label htmlFor="deliveryNotes">Delivery Notes:</Label>
                    <Textarea className="mt-2 mb-6" placeholder="Please note any special delivery instructions" />
                    <div className="flex flex-row justify-between space-x-2">
                        <Button className="bg-primary hover:bg-primary/75 w-64 h-11 mt-6">EDIT INFO</Button>
                        <Button className="bg-primary hover:bg-primary/75 w-64 h-11 mt-6">CONFIRM ORDER</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}