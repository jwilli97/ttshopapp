'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';

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

const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function Orders() {
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const router = useRouter();
    
    useEffect(() => {
        async function fetchData() {
            try {
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

    const handleViewDetails = (orderId: number) => {
        // Implement view details functionality here
        console.log('Viewing details for order:', orderId);
    };

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen flex-col mb-16 bg-background">
                {/* <header className="bg-background">
                    <TopNav />
                </header> */}

            <main className='flex w-full flex-col items-center px-4 py-6 pb-12 relative'>
                <h1 className="text-2xl font-bold mb-6">Order History</h1>
                {orders.length > 0 ? (
                    <div className="w-full max-w-2xl space-y-3">
                        {orders.map((order) => {
                            const details = parseOrderDetails(order.order_details);
                            return (
                                <div key={order.id} className="bg-white/10 text-white p-3 rounded-lg w-full">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">
                                            Order #{order.id.toString().padStart(4, '0')}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            order.status === 'completed' ? 'bg-green-500/20' : 
                                            order.status === 'cancelled' ? 'bg-red-500/20' : 'bg-blue-500/20'
                                        }`}>
                                            {capitalizeFirstLetter(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm">{details.item}</p>
                                    <p className="text-sm font-semibold">
                                        ${order.total_amount ? order.total_amount.toFixed(2) : 'N/A'}
                                    </p>
                                    <button 
                                        className="text-xs text-gray-300 mt-2 hover:text-white"
                                        onClick={() => handleViewDetails(order.id)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No orders found.</p>
                )}
            </main>

            <BottomNav />
        </div>
        </ProtectedRoute>
    );
}