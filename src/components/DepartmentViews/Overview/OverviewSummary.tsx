import { ShoppingCart, Package, ArrowUp, Bell, CheckCircle, XCircle } from "lucide-react";
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

export function OverviewSummary({ todayOrderCount, pendingOrderCount, inProgressOrderCount, outForDeliveryOrderCount, readyForPickupOrderCount, completedOrderCount, cancelledOrderCount }: OrdersSummaryProps) {
    return (
        <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold mb-6 text-zinc-100">Order Statistics</h2>
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
                    description="Orders being processed" 
                    icon={<Package className="h-5 w-5 text-amber-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="In Progress" 
                    value={inProgressOrderCount} 
                    description="Orders being prepared" 
                    icon={<ArrowUp className="h-5 w-5 text-emerald-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="Out for Delivery" 
                    value={outForDeliveryOrderCount} 
                    description="Orders en route" 
                    icon={<Bell className="h-5 w-5 text-purple-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="Ready for Pickup" 
                    value={readyForPickupOrderCount} 
                    description="Orders ready for pickup" 
                    icon={<Package className="h-5 w-5 text-indigo-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="Completed Orders" 
                    value={completedOrderCount} 
                    description="Orders completed" 
                    icon={<CheckCircle className="h-5 w-5 text-green-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
                <SummaryCard 
                    title="Cancelled Orders" 
                    value={cancelledOrderCount} 
                    description="Orders cancelled" 
                    icon={<XCircle className="h-5 w-5 text-red-400" />}
                    className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                />
            </div>
        </div>
    );
}