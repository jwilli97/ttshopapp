'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/topNav';

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
                        setDisplayName(data.display_name as string);
                        setAvatarUrl(data.avatar_url as string);
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
                        setOrders(orderData.map((order: any) => ({
                            id: order.id as number,
                            created_at: order.created_at as string,
                            order_details: order.order_details as string,
                            status: order.status as string,
                            total_amount: order.total_amount as number
                        })));
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
        <div className="flex min-h-screen flex-col mb-16 bg-background">
            <header className="bg-background">
                <TopNav />
            </header>

            <main className='flex w-full flex-col items-center px-4 py-6 pb-12 relative'>
                <h1 className="text-2xl font-bold mb-6">Order History</h1>
                {orders.length > 0 ? (
                    <ul className="w-full max-w-2xl space-y-4">
                        {orders.map((order) => {
                            const details = parseOrderDetails(order.order_details);
                            return (
                                <li key={order.id} className="border p-4 rounded-lg shadow">
                                    <p className="font-semibold">Order #{order.id}</p>
                                    <p><strong>Date: </strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                    <p><strong>Item: </strong> {details.item || 'N/A'}</p>
                                    {details.tokenRedemption && <p><strong>Token Redemption:</strong> {details.tokenRedemption}</p>}
                                    {details.phoneNumber && <p><strong>Phone: </strong> {details.phoneNumber}</p>}
                                    {details.deliveryStreetAddress && <p><strong>Address: </strong> {details.deliveryStreetAddress}, {details.deliveryZipcode}</p>}
                                    {details.deliveryMethod && <p><strong>Delivery Method: </strong> {details.deliveryMethod}</p>}
                                    {details.paymentMethod && <p><strong>Payment Method: </strong> {details.paymentMethod}</p>}
                                    <p><strong>Status: </strong> {order.status}</p>
                                    <p><strong>Total: </strong> ${order.total_amount ? order.total_amount.toFixed(2) : 'N/A'}</p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No orders found.</p>
                )}
            </main>

            <BottomNav />
        </div>
    );
}