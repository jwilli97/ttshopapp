'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Intercom from '@intercom/messenger-js-sdk';
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Clock, Truck } from "lucide-react";
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import TopNav from "@/components/topNav";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import LogOutButton from "@/components/logoutButton";

type orderStatus = "received" | "preparing your order" | "out for delivery" | "completed" | "cancelled";

interface OrderDetails {
    item: string;
    tokenRedemption: string;
    phoneNumber: string;
    deliveryStreetAddress: string;
    deliveryZipcode: string;
    deliveryMethod: string;
    paymentMethod: string;
    status: orderStatus;
}

interface Order {
    id: number;
    created_at: string;
    order_details: string;
    status: string;
    total: string;
}

interface StatusStepProps {
    label: string
    isCompleted: boolean
    isActive: boolean
    isLast?: boolean
}

function StatusStep({ label, isCompleted, isActive, isLast = false }: StatusStepProps) {
    return (
        <div className="flex items-center">
            <div className="relative">
                {/* Circle - made slightly smaller */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${isCompleted 
                        ? 'border-accent bg-accent text-black' 
                        : isActive 
                            ? 'border-white text-white' 
                            : 'border-gray-300'
                    }`}
                >
                    {isCompleted && (
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                
                {/* Label - made smaller with better spacing */}
                <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs
                    ${isCompleted ? 'text-accent' : isActive ? 'text-white' : 'text-gray-200'}`}
                >
                    {label}
                </span>
            </div>

            {/* Connecting Line - made shorter */}
            {!isLast && (
                <div className={`w-12 sm:w-24 h-0.5 ${isCompleted ? 'bg-accent' : 'bg-gray-300'}`} />
            )}
        </div>
    );
}

export default function Orders() {
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const router = useRouter();
    
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
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
                        .not('status', 'in', '("completed","cancelled")')
                        .order('created_at', { ascending: false });

                    if (orderError) throw orderError;
                    if (orderData) {
                        setOrders(orderData);
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

    const parseOrderDetails = (detailsString: string): Partial<OrderDetails> => {
        try {
            return JSON.parse(detailsString);
        } catch (error) {
            console.error("Error parsing order details:", error);
            return {};
        }
    };

    const handleCancelOrder = async () => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orders[0].id);

            if (error) throw error;
            
            setOrders(orders.map(order => 
                order.id === orders[0].id 
                    ? { ...order, status: 'cancelled' }
                    : order
            ));
            
            router.push('/Order/History');
            setShowCancelDialog(false);
        } catch (error) {
            console.error("Error cancelling order:", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="bg-background mt-2 sm:mt-4">
                <TopNav />
            </header>

            <main className="flex h-screen w-full flex-col items-center px-2 sm:px-4 py-4 sm:py-6 relative">
                <div className="mb-4 sm:mb-6">
                    <Image src="/Delivery_Logo.png" width={200} height={200} alt="Welcome Logo" className="w-48 sm:w-64" />
                </div>
                <h1 className="text-2xl sm:text-4xl text-white font-bold">Current Order</h1>
                
                {isLoading ? (
                    <p className="text-white mt-4">Loading orders...</p>
                ) : orders.length > 0 ? (
                    <>
                        <div className="flex flex-col items-center py-4 sm:py-8">
                            <div className="flex items-center">
                                <StatusStep
                                    label="Order Received"
                                    isCompleted={['processing', 'out for delivery'].includes(orders[0].status)}
                                    isActive={orders[0].status === 'received'}
                                />
                                <StatusStep
                                    label="Preparing"
                                    isCompleted={['out for delivery'].includes(orders[0].status)}
                                    isActive={['processing'].includes(orders[0].status)}
                                />
                                <StatusStep
                                    label="Out for Delivery"
                                    isCompleted={['completed', 'cancelled'].includes(orders[0].status)}
                                    isActive={orders[0].status === 'out for delivery'}
                                />
                                <StatusStep
                                    label="Delivered"
                                    isCompleted={['completed', 'cancelled'].includes(orders[0].status)}
                                    isActive={false}
                                    isLast={true}
                                />
                            </div>
                        </div>

                        <div className="container bg-white text-black p-3 sm:p-4 rounded-lg shadow w-full mt-4 sm:mt-8 mb-16 max-w-2xl text-sm sm:text-base">
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
                                        <p><strong>Status: </strong>{orders[0].status}</p>
                                        <p><strong>Total: </strong>${orders[0].total}</p>
                                    </>
                                );
                            })()}
                            <div className="flex flex-row mt-4 justify-between gap-2">
                                <Button variant="outline" className="text-primary border-primary bg-white text-sm" onClick={() => setShowCancelDialog(true)}>Cancel Order</Button>
                                <Button className="text-sm">Edit Order</Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col mt-4 items-center">
                        <p className="text-gray-500 mt-6">No current orders</p>
                        <div className="flex flex-row mt-12 space-x-12">
                            <Button variant="outline" onClick={() => router.push('/Order/History')}>Order History</Button>
                            <Button onClick={() => router.push('/Order')}>Place Order</Button>
                        </div>
                    </div>
                )}
            </main>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            No, keep order
                        </Button>
                        <Button variant="destructive" onClick={handleCancelOrder}>
                            Yes, cancel order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <BottomNav />
        </div>
    );
}