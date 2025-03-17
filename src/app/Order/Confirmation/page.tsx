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

type orderStatus = "processing" | "preparing" | "out for delivery" | "completed" | "cancelled";

interface OrderDetails {
    item: string;
    tokenRedemption: string;
    phoneNumber: string;
    deliveryStreetAddress: string;
    deliveryZipcode: string;
    deliveryMethod: string;
    paymentMethod: string;
    status: orderStatus;
    pickupTime?: string;
    pickupLocation?: string;
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

const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if the number has exactly 10 digits
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return original if not 10 digits
    return phoneNumber;
};

// Add a helper function to determine step status
const getStepStatus = (currentStatus: string, stepIndex: number) => {
    // Normalize the status to remove spaces and convert to lowercase
    const normalizedStatus = currentStatus.toLowerCase().trim();
    
    const statusOrder = ["processing", "preparing", "out for delivery", "completed"];
    const currentIndex = statusOrder.indexOf(normalizedStatus);
    
    return {
        isCompleted: currentIndex >= stepIndex,
        isActive: currentIndex === stepIndex
    };
};

// Add this helper function near other helper functions like capitalizeFirstLetter
const formatOrderId = (id: number): string => {
    return id.toString().padStart(4, '0');
};

export default function Orders() {
    const [displayName, setDisplayName] = useState<string>('Loading...');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editRequest, setEditRequest] = useState('');
    const { toast } = useToast();

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
                        setDisplayName(data.display_name as string);
                        setAvatarUrl(data.avatar_url as string);
                    }
                }
    
                // Fetch current and previous orders
                if (user) {
                    // Fetch current orders (unchanged)
                    const { data: orderData, error: orderError } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', user.id)
                        .not('status', 'in', '("completed","cancelled")')
                        .order('created_at', { ascending: false });

                    // Fetch previous orders (new)
                    const { data: previousOrderData, error: previousOrderError } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', user.id)
                        .in('status', ['completed', 'cancelled'])
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (orderError) throw orderError;
                    if (previousOrderError) throw previousOrderError;

                    if (orderData) {
                        setOrders(orderData.map(order => ({
                            id: order.id as number,
                            created_at: order.created_at as string,
                            order_details: order.order_details as string,
                            status: order.status as string,
                            total: order.total as string
                        })));
                    }

                    if (previousOrderData) {
                        setPreviousOrders(previousOrderData.map(order => ({
                            id: order.id as number,
                            created_at: order.created_at as string,
                            order_details: order.order_details as string,
                            status: order.status as string,
                            total: order.total as string
                        })));
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

    // Add status monitoring
    useEffect(() => {
        const statusChannel = supabase
            .channel('orders-status-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: orders.length > 0 ? `id=eq.${orders[0].id}` : undefined
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    toast({
                        title: "Order Status Updated",
                        description: `Your order is now ${capitalizeFirstLetter(newStatus)}`,
                        duration: 5000,
                    });
                    // Update local state
                    setOrders(prevOrders => 
                        prevOrders.map(order => 
                            order.id === payload.new.id 
                                ? { ...order, status: newStatus }
                                : order
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            statusChannel.unsubscribe();
        };
    }, [orders, toast]);

    const parseOrderDetails = (detailsString: string): Partial<OrderDetails> => {
        try {
            return JSON.parse(detailsString);
        } catch (error) {
            console.error("Error parsing order details:", error);
            return {};
        }
    };

    const handleEditOrder = async () => {
        if (orders[0].status === "processing") {
            setShowEditDialog(true);
        } else {
            toast({
                title: "Cannot Edit Order",
                description: "Orders can only be edited when in 'processing' status.",
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    const handleSubmitEdit = async () => {
        try {
            // Here you could add logic to save the edit request to your database
            // For now, we'll just show a success message
            toast({
                title: "Edit Request Submitted",
                description: "We&apos;ll review your changes and update your order soon.",
                duration: 5000,
            });
            setShowEditDialog(false);
            setEditRequest('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit edit request. Please try again.",
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    const handleCancelOrder = async () => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orders[0].id);

            if (error) throw error;

            toast({
                title: "Order Cancelled",
                description: "Your order has been successfully cancelled.",
                duration: 5000,
            });
            
            // Update local state first
            setOrders(orders.map(order => 
                order.id === orders[0].id 
                    ? { ...order, status: 'cancelled' }
                    : order
            ));
            
            // Short delay before redirect
            setTimeout(() => {
                router.push('/Order/History');
                setShowCancelDialog(false);
            }, 1500);
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast({
                title: "Error",
                description: "Failed to cancel order. Please try again.",
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* <header className="bg-background mt-2 sm:mt-4">
                <TopNav />
            </header> */}

            <main className="flex w-full flex-col items-center mb-16 px-2 sm:px-4 py-4 sm:py-6 relative">
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
                                    label="Processing"
                                    {...getStepStatus(orders[0].status, 0)}
                                />
                                <StatusStep
                                    label="Preparing"
                                    {...getStepStatus(orders[0].status, 1)}
                                />
                                <StatusStep
                                    label="En Route"
                                    {...getStepStatus(orders[0].status, 2)}
                                />
                                <StatusStep
                                    label="Delivered"
                                    {...getStepStatus(orders[0].status, 3)}
                                    isLast={true}
                                />
                            </div>
                        </div>

                        <div className="container bg-white text-black p-3 sm:p-4 rounded-lg shadow w-full mt-4 sm:mt-8 mb-8 max-w-2xl text-sm sm:text-base">
                            <p className="font-semibold">Order #{formatOrderId(orders[0].id)}</p>
                            <p><span className="font-bold">Date: </span> {new Date(orders[0].created_at).toLocaleDateString()}</p>
                            {(() => {
                                const details = parseOrderDetails(orders[0].order_details);
                                return (
                                    <>
                                        <p><strong>Item: </strong> {details.item ? (details.item) : 'N/A'}</p>
                                        {details.tokenRedemption && <p><strong>Token Redemption:</strong> {capitalizeFirstLetter(details.tokenRedemption)}</p>}
                                        {details.phoneNumber && <p><strong>Phone: </strong> {formatPhoneNumber(details.phoneNumber)}</p>}
                                        {details.deliveryMethod === 'Pickup' ? (
                                            <>
                                                <p><strong>Pickup Location: </strong> 
                                                    {details.pickupLocation || (
                                                        <span className="text-gray-400 italic">Pending Confirmation</span>
                                                    )}
                                                </p>
                                                <p><strong>Pickup Time: </strong> {details.pickupTime}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p><strong>Address: </strong> {(details.deliveryStreetAddress)}, {details.deliveryZipcode}</p>
                                                <p><strong>Delivery Method: </strong> {capitalizeFirstLetter(details.deliveryMethod ?? '')}</p>
                                            </>
                                        )}
                                        {details.paymentMethod && <p><strong>Payment Method: </strong> {capitalizeFirstLetter(details.paymentMethod)}</p>}
                                        <p><strong>Status: </strong>{capitalizeFirstLetter(orders[0].status)}</p>
                                        <p><strong>Total: </strong>
                                            {orders[0].total ? (
                                                `$${orders[0].total}`
                                            ) : (
                                                <span className="text-gray-400 italic">Pending Confirmation</span>
                                            )}
                                        </p>
                                    </>
                                );
                            })()}
                            <div className="flex flex-row mt-4 justify-between gap-2">
                                <Button 
                                    variant="outline" 
                                    className="text-primary border-primary bg-white text-sm hover:bg-red-500 hover:text-white" 
                                    onClick={() => setShowCancelDialog(true)}
                                    disabled={['completed', 'cancelled'].includes(orders[0].status)}
                                >
                                    Cancel Order
                                </Button>
                                <Button 
                                    className="text-sm"
                                    onClick={handleEditOrder}
                                    disabled={orders[0].status !== "processing"}
                                >
                                    Edit Order
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col mt-4 items-center">
                        <p className="mt-6">No current orders</p>
                        <div className="flex flex-row mt-12 space-x-12">
                            <Button variant="outline" onClick={() => router.push('/Order/History')}>Order History</Button>
                            <Button onClick={() => router.push('/Order')}>Place Order</Button>
                        </div>
                    </div>
                )}
                <div className="container bg-[#cbd5e1]/25 h-0.5 w-full md:w-11/12 my-2 rounded-full"></div>
                <div className="flex flex-col items-center w-full max-w-2xl">
                    <h2 className="text-xl sm:text-2xl text-white font-bold mb-4">Recent Orders</h2>
                    {previousOrders.length > 0 ? (
                        previousOrders.map((order) => {
                            const details = parseOrderDetails(order.order_details);
                            return (
                                <div key={order.id} className="bg-white/10 text-white p-3 rounded-lg w-full mb-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Order #{formatOrderId(order.id)}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            order.status === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                            {capitalizeFirstLetter(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300">{new Date(order.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm">{details.item}</p>
                                    <p className="text-sm font-semibold">${order.total}</p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-400">No previous orders found</p>
                    )}
                    <Button 
                        variant="outline" 
                        className="mt-4 mb-16"
                        onClick={() => router.push('/Order/History')}
                    >
                        View Full History
                    </Button>
                </div>
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

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Order Changes</DialogTitle>
                        <DialogDescription>
                            Please describe the changes you&apos;d like to make to your order.
                        </DialogDescription>
                    </DialogHeader>
                    <textarea
                        className="w-full min-h-[100px] p-2 border rounded-md text-black"
                        value={editRequest}
                        onChange={(e) => setEditRequest(e.target.value)}
                        placeholder="Example: Please change my delivery address to..."
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmitEdit}
                            disabled={!editRequest.trim()}
                        >
                            Submit Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <BottomNav />
        </div>
    );
}