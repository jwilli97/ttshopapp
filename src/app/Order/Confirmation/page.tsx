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
    icon: React.ReactNode
    label: string
    isCompleted: boolean
    isActive: boolean
}

function StatusStep({ icon, label, isCompleted, isActive }: StatusStepProps) {
    return (
      <div className="flex flex-col items-center">
        <div className={`rounded-full p-2 ${
          isCompleted ? 'bg-primary' : isActive ? 'bg-accent' : 'bg-gray-300'
        }`}>
          {icon}
        </div>
        <p className={`mt-2 text-sm font-medium ${
          isCompleted ? 'text-primary' : isActive ? 'text-accent' : 'text-gray-500'
        }`}>
          {label}
        </p>
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
            <header className="bg-background mt-4">
                <TopNav />
            </header>

            <main className="flex h-screen w-full flex-col items-center px-4 py-6 relative">
                <div className="mb-6 animate-wiggle">
                    <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
                </div>
                <h1 className="text-3xl text-[#FFFDD0] font-bold">Order Confirmation</h1>
                
                {isLoading ? (
                    <p className="text-gray-500 mt-4">Loading orders...</p>
                ) : orders.length > 0 ? (
                    <>
                        <div className="flex flex-col items-center py-6">
                            <div className="flex flex-row space-x-16 items-center">
                                <StatusStep
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                                    label="Order Received"
                                    isCompleted={['preparing your order', 'in progress', 'ready for pickup', 'out for delivery'].includes(orders[0].status)}
                                    isActive={orders[0].status === 'received'}
                                />
                                <StatusStep
                                    icon={<Clock className="h-6 w-6" />}
                                    label="Preparing Your Order"
                                    isCompleted={['out for delivery'].includes(orders[0].status)}
                                    isActive={['preparing your order', 'in progress'].includes(orders[0].status)}
                                />
                                <StatusStep
                                    icon={<Truck className="h-6 w-6" />}
                                    label="Out for Delivery"
                                    isCompleted={['completed', 'cancelled'].includes(orders[0].status)}
                                    isActive={orders[0].status === 'out for delivery'}
                                />
                            </div>
                        </div>

                        <div className="container bg-white p-4 rounded-lg shadow w-full max-w-2xl">
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
                                        <p><strong>Total: </strong>{orders[0].total}</p>
                                    </>
                                );
                            })()}
                            <div className="flex flex-row mt-4 justify-between">
                                <Button variant="outline" className="text-primary border-primary bg-white" onClick={() => setShowCancelDialog(true)}>Cancel Order</Button>
                                <Button>Edit Order</Button>
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