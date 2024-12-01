'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Order } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewSummary } from "./OverviewSummary";
import { OverviewTable } from "./OverviewTable";

export function Overview() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [todayOrderCount, setTodayOrderCount] = useState(0);
    const [pendingOrderCount, setPendingOrderCount] = useState(0);
    const [inProgressOrderCount, setInProgressOrderCount] = useState(0);
    const [outForDeliveryOrderCount, setOutForDeliveryOrderCount] = useState(0);
    const [readyForPickupOrderCount, setReadyForPickupOrderCount] = useState(0);
    const [completedOrderCount, setCompletedOrderCount] = useState(0);
    const [cancelledOrderCount, setCancelledOrderCount] = useState(0);

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

    return  (
        <div className="space-y-6">
            <OverviewSummary
                todayOrderCount={todayOrderCount}
                pendingOrderCount={pendingOrderCount}
                inProgressOrderCount={inProgressOrderCount}
                outForDeliveryOrderCount={outForDeliveryOrderCount}
                readyForPickupOrderCount={readyForPickupOrderCount}
                completedOrderCount={completedOrderCount}
                cancelledOrderCount={cancelledOrderCount}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Current Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <OverviewTable orders={orders} onEditOrder={() => {}} />
                </CardContent>
            </Card>
        </div>
    );
}