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

export function FulfillmentSummary({ todayOrderCount, pendingOrderCount, inProgressOrderCount, outForDeliveryOrderCount, readyForPickupOrderCount, completedOrderCount, cancelledOrderCount }: OrdersSummaryProps) {
    return (
        <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold mb-6 text-zinc-100">Fulfillment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard 
                    title="Today's Orders" 
                    value={todayOrderCount} 
                    description="Orders placed today" 
                    icon={<ShoppingCart className="h-5 w-5 text-blue-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="Pending Orders" 
                    value={pendingOrderCount} 
                    description="Orders waiting to be processed" 
                    icon={<Package className="h-5 w-5 text-amber-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="In Progress" 
                    value={inProgressOrderCount} 
                    description="Orders currently being processed" 
                    icon={<ArrowUp className="h-5 w-5 text-emerald-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="Out for Delivery" 
                    value={outForDeliveryOrderCount} 
                    description="Orders ready for delivery" 
                    icon={<Bell className="h-5 w-5 text-purple-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
            </div>
        </div>
    );
}