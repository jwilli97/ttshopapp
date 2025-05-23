'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Order } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FulfillmentSummary } from "./FulfillmentSummary";
import { FulfillmentTable } from "./FulfillmentTable";

export function FulfillmentView() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [todayOrderCount, setTodayOrderCount] = useState(0);
    const [pendingOrderCount, setPendingOrderCount] = useState(0);
    const [inProgressOrderCount, setInProgressOrderCount] = useState(0);
    const [outForDeliveryOrderCount, setOutForDeliveryOrderCount] = useState(0);
    const [readyForPickupOrderCount, setReadyForPickupOrderCount] = useState(0);
    const [completedOrderCount, setCompletedOrderCount] = useState(0);
    const [cancelledOrderCount, setCancelledOrderCount] = useState(0);

    const fetchOrders = async () => {
        const { data, error } = await supabase.from('orders').select('*');
        if (error) {
            console.error(error);
        } else {
            const processedOrders = data.map(order => ({
                id: order.id as string,
                created_at: order.created_at as string,
                display_name: order.display_name as string,
                full_name: order.full_name as string,
                order_details: order.order_details as string,
                token_redemption: order.token_redemption as string,
                phone_number: order.phone_number as string,
                payment_method: order.payment_method as string,
                delivery_method: order.delivery_method as string,
                delivery_notes: order.delivery_notes as string,
                cash_details: order.cash_details as string,
                street_address: order.street_address as string,
                address_line_2: order.address_line_2 as string,
                city: order.city as string,
                state: order.state as string,
                zipcode: order.zipcode as string,
                residence_type: order.residence_type as string,
                delivery_time_frame: order.delivery_time_frame as string,
                delivery_fee: order.delivery_fee as number | null,
                total: order.total as number,
                status: order.status as "received" | "processing" | "preparing" | "out for delivery" | "completed" | "cancelled",
                user_id: order.user_id as string
            }));

            setOrders(processedOrders);

            // Calculate today's orders
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = processedOrders.filter(order => {
                const orderDate = new Date(order.created_at);
                return orderDate >= today;
            });
            setTodayOrderCount(todayOrders.length);

            // Calculate orders by status
            setPendingOrderCount(processedOrders.filter(order => order.status === "processing").length);
            setInProgressOrderCount(processedOrders.filter(order => order.status === "preparing").length);
            setOutForDeliveryOrderCount(processedOrders.filter(order => order.status === "out for delivery").length);
            setCompletedOrderCount(processedOrders.filter(order => order.status === "completed").length);
            setCancelledOrderCount(processedOrders.filter(order => order.status === "cancelled").length);
        }
    }

    useEffect(() => {
        fetchOrders();

        // Set up real-time subscription for orders
        const ordersSubscription = supabase
            .channel('orders-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders'
            }, () => {
                fetchOrders(); // Refetch orders when any change occurs
            })
            .subscribe();

        // Cleanup subscription
        return () => {
            ordersSubscription.unsubscribe();
        };
    }, []);

    return (
        <div className="space-y-6">
            <FulfillmentSummary
                todayOrderCount={todayOrderCount}
                pendingOrderCount={pendingOrderCount}
                inProgressOrderCount={inProgressOrderCount}
                outForDeliveryOrderCount={outForDeliveryOrderCount}
                readyForPickupOrderCount={readyForPickupOrderCount}
                completedOrderCount={completedOrderCount}
                cancelledOrderCount={cancelledOrderCount}
                onRefresh={fetchOrders}
            />

            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-zinc-100">Order Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <FulfillmentTable orders={orders} onEditOrder={() => {}} />
                </CardContent>
            </Card>
        </div>
    );
}