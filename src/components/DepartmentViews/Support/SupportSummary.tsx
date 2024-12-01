import { ShoppingCart, Package, ArrowUp, Bell } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";

interface OrdersSummaryProps {
    todayOrderCount: number;
    pendingOrderCount: number;
    inProgressOrderCount: number;
    outForDeliveryOrderCount: number;
    readyForPickupOrderCount: number;
    completedOrderCount: number;
    cancelledOrderCount: number;
}

export function SupportSummary({ todayOrderCount, pendingOrderCount, inProgressOrderCount, outForDeliveryOrderCount, readyForPickupOrderCount, completedOrderCount, cancelledOrderCount }: OrdersSummaryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Today's Orders" value={todayOrderCount} description="Number of orders placed today" icon={<ShoppingCart className="h-4 w-4" />} />
            <SummaryCard title="Pending Orders" value={pendingOrderCount} description="Number of orders waiting to be processed" icon={<Package className="h-4 w-4" />} />
            <SummaryCard title="In Progress" value={inProgressOrderCount} description="Number of orders currently being processed" icon={<ArrowUp className="h-4 w-4" />} />
            <SummaryCard title="Out for Delivery" value={outForDeliveryOrderCount} description="Number of orders ready for delivery" icon={<Bell className="h-4 w-4" />} />
        </div>
    );
}