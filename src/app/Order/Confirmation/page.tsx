'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import LogOutButton from "@/components/logoutButton";

interface OrderDetails {
    item: string;
    tokenRedemption: string;
    phoneNumber: string;
    deliveryStreetAddress: string;
    deliveryZipcode: string;
    deliveryMethod: string;
    paymentMethod: string;
}

interface Order {
    id: number;
    created_at: string;
    order_details: string;
    status: string;
    total_amount: number;
}

export default function Orders() {
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);

    const router = useRouter();
    
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user data
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
    
                // Fetch user's orders
                if (user) {
                    const { data: orderData, error: orderError } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (orderError) throw orderError;
                    if (orderData) {
                        setOrders(orderData);
                    }
                }
            } catch (error) {
                console.error("There was a problem fetching data:", error);
            }
        }
        fetchData();
    }, []);

    const parseOrderDetails = (detailsString: string): Partial<OrderDetails> => {
        try {
            return JSON.parse(detailsString);
        } catch (error) {
            console.error("Error parsing order details:", error);
            return {};
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="bg-background">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => router.push('/Account')}>
                        <Avatar>
                            <AvatarImage src={avatarUrl} alt="Profile Picture" />
                            <AvatarFallback className="text-2xl">TT</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xl font-semibold">{displayName}</p>
                            <p className="text-sm text-gray-500 hover:text-gray-700">View Account</p>
                        </div>
                    </div>
                    <LogOutButton />
                </div>
            </header>

            <main className="flex h-screen w-full flex-col items-center px-4 py-6 relative">
            <div className="mb-6 animate-wiggle">
                    <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
                </div>
                <h1 className="text-2xl font-bold">Order Confirmation</h1>
                <p className="mt-4 mb-4 text-center">Your order is currently being processed. <br /> Please check back later for status updates.</p>
                {orders.length > 0 && (
                    <div className="border p-4 rounded-lg shadow w-full max-w-2xl">
                        <p className="font-semibold">Order #{orders[0].id}</p>
                        <p><span className="font-bold">Date: </span> {new Date(orders[0].created_at).toLocaleDateString()}</p>
                        {(() => {
                            const details = parseOrderDetails(orders[0].order_details);
                            return (
                                <>
                                    <p><strong>Item: </strong> {details.item || 'N/A'}</p>
                                    {details.tokenRedemption && <p><strong>Token Redemption:</strong> {details.tokenRedemption}</p>}
                                    {details.phoneNumber && <p><strong>Phone: </strong> {details.phoneNumber}</p>}
                                    {details.deliveryStreetAddress && <p><strong>Address: </strong> {details.deliveryStreetAddress}, {details.deliveryZipcode}</p>}
                                    {details.deliveryMethod && <p><strong>Delivery Method: </strong> {details.deliveryMethod}</p>}
                                    {details.paymentMethod && <p><strong>Payment Method: </strong> {details.paymentMethod}</p>}
                                    <p><strong>Status: </strong> {orders[0].status}</p>
                                    <p><strong>Total: </strong> ${orders[0].total_amount ? orders[0].total_amount.toFixed(2) : 'N/A'}</p>
                                </>
                            );
                        })()}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}