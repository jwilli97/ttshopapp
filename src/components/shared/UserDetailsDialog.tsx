'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";

interface UserPreferences {
    strainPreference?: string;
    replacementPreference?: string;
}

interface DeliveryInfo {
    street_address: string;
    address_line_2?: string;
    city: string;
    state: string;
    zipcode: string;
    delivery_notes?: string;
    residence_type?: string;
}

interface OrderDetails {
    item: string;
    tokenRedemption?: string;
    phoneNumber?: string;
    deliveryMethod: string;
    paymentMethod: string;
    status: string;
    total: number;
}

interface UserDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
}

interface DatabaseOrder {
    id: string;
    order_details: string;
    phone_number: string;
    delivery_method: string;
    payment_method: string;
    status: string;
    total: number;
    street_address: string;
    address_line_2?: string;
    city: string;
    state: string;
    zipcode: string;
    delivery_notes?: string;
    residence_type?: string;
    profiles?: {
        strain_preference: string;
        replacement_preference: string;
        display_name: string;
    };
}

export function UserDetailsDialog({ isOpen, onClose, orderId }: UserDetailsDialogProps) {
    const [userDetails, setUserDetails] = useState<{
        preferences: UserPreferences;
        delivery: DeliveryInfo;
        orderDetails: OrderDetails;
        displayName: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserDetails() {
            if (!orderId) return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                // Fetch order details first
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        profiles:user_id (
                            strain_preference,
                            replacement_preference,
                            display_name
                        )
                    `)
                    .eq('id', orderId)
                    .single();

                if (orderError) throw orderError;
                if (!orderData) throw new Error('Order not found');

                // Type assertion with unknown first for safety
                const typedOrderData = orderData as unknown as DatabaseOrder;
                const orderDetails = JSON.parse(typedOrderData.order_details) as {
                    item: string;
                    tokenRedemption?: string;
                };
                
                setUserDetails({
                    preferences: {
                        strainPreference: typedOrderData.profiles?.strain_preference || '',
                        replacementPreference: typedOrderData.profiles?.replacement_preference || '',
                    },
                    delivery: {
                        street_address: typedOrderData.street_address,
                        address_line_2: typedOrderData.address_line_2,
                        city: typedOrderData.city,
                        state: typedOrderData.state,
                        zipcode: typedOrderData.zipcode,
                        delivery_notes: typedOrderData.delivery_notes,
                        residence_type: typedOrderData.residence_type,
                    },
                    orderDetails: {
                        item: orderDetails.item,
                        tokenRedemption: orderDetails.tokenRedemption,
                        phoneNumber: typedOrderData.phone_number,
                        deliveryMethod: typedOrderData.delivery_method,
                        paymentMethod: typedOrderData.payment_method,
                        status: typedOrderData.status,
                        total: typedOrderData.total,
                    },
                    displayName: typedOrderData.profiles?.display_name || 'Unknown User',
                });
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Failed to load user details');
            } finally {
                setIsLoading(false);
            }
        }

        if (isOpen && orderId) {
            fetchUserDetails();
        }
    }, [isOpen, orderId]);

    const formatAddress = (delivery: DeliveryInfo): string => {
        const parts = [
            delivery.street_address,
            delivery.address_line_2,
            delivery.city,
            delivery.state,
            delivery.zipcode
        ].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        User Details - {userDetails?.displayName}
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}

                {error && (
                    <div className="text-red-500 py-4">
                        {error}
                    </div>
                )}

                {userDetails && !isLoading && (
                    <div className="space-y-6 py-4">
                        {/* Order Status and Details */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Order Information</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Status: <Badge>{userDetails.orderDetails.status}</Badge></div>
                                <div>Total: ${userDetails.orderDetails.total}</div>
                                <div>Item: {userDetails.orderDetails.item}</div>
                                <div>Payment: {userDetails.orderDetails.paymentMethod}</div>
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Delivery Information</h3>
                            <div className="text-sm">
                                <p>{formatAddress(userDetails.delivery)}</p>
                                {userDetails.delivery.delivery_notes && (
                                    <p className="mt-2">Notes: {userDetails.delivery.delivery_notes}</p>
                                )}
                                {userDetails.delivery.residence_type && (
                                    <p>Residence Type: {userDetails.delivery.residence_type}</p>
                                )}
                            </div>
                        </div>

                        {/* User Preferences */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">User Preferences</h3>
                            <div className="text-sm">
                                {userDetails.preferences.strainPreference && (
                                    <div className="mb-2">
                                        <p className="font-medium">Strain Preference:</p>
                                        <Badge variant="outline">
                                            {userDetails.preferences.strainPreference.charAt(0).toUpperCase() + 
                                             userDetails.preferences.strainPreference.slice(1)}
                                        </Badge>
                                    </div>
                                )}
                                
                                {userDetails.preferences.replacementPreference && (
                                    <div>
                                        <p className="font-medium">Replacement Preference:</p>
                                        <Badge variant="outline">
                                            {userDetails.preferences.replacementPreference === 'similar' ? 'Similar Product' :
                                             userDetails.preferences.replacementPreference === 'contact' ? 'Contact Me First' :
                                             userDetails.preferences.replacementPreference === 'refund' ? 'No Replacement' : 
                                             userDetails.preferences.replacementPreference}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
} 