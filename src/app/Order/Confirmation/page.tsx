'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import BottomNav from '@/components/BottomNav';
import LogOutButton from '@/components/logoutButton';

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

            <main className='flex h-screen w-full flex-col items-center px-4 py-6 relative'>
                <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
                {orders.length > 0 ? (
                    <ul className="w-full max-w-2xl space-y-4">
                        {orders.map((order) => (
                            <li key={order.id} className="border p-4 rounded-lg shadow">
                                <p className="font-semibold">Order #{order.id}</p>
                                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                <p>Details: {order.order_details}</p>
                                <p>Status: {order.status}</p>
                                <p>Total: ${order.total_amount ? order.total_amount.toFixed(2) : 'N/A'}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You have no orders yet.</p>
                )}
            </main>

            <BottomNav />
        </div>
    );
}