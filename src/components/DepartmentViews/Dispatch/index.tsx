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
                setOrders(data as Order[]);
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
                    <CardTitle>Dispatch</CardTitle>
                </CardHeader>
                <CardContent>
                    <DispatchTable orders={orders} onEditOrder={() => {}} />
                </CardContent>
            </Card>
        </div>
    );
}