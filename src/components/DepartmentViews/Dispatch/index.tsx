"use client";

import { useState, useEffect } from "react";
import { DispatchSummary } from "./DispatchSummary";
import { DispatchTable } from "./DispatchTable";
import { Order } from "../types";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DispatchView() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [todayDeliveryCount, setTodayDeliveryCount] = useState(0);
    const [deliveryInProgressCount, setDeliveryInProgressCount] = useState(0);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data, error } = await supabase.from('orders').select('*');
            if (error) {
                console.error(error);
            } else {
                setOrders(data.map(order => ({
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
                    status: order.status as "received" | "processing" | "out for delivery" | "completed" | "cancelled",
                    user_id: order.user_id as string
                })));
            }
        }
        fetchOrders();
    }, []);

    return (
        <div className="space-y-6">
            <DispatchSummary
                todayDeliveryCount={todayDeliveryCount}
                deliveryInProgressCount={deliveryInProgressCount}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-white">Dispatch</CardTitle>
                </CardHeader>
                <CardContent>
                    <DispatchTable orders={orders} onEditOrder={() => {}} />
                </CardContent>
            </Card>
        </div>
    );
}