import { ShoppingCart, Package, ArrowUp, Bell, RefreshCw } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";

interface OrdersSummaryProps {
    todayOrderCount: number;
    pendingOrderCount: number;
    inProgressOrderCount: number;
    outForDeliveryOrderCount: number;
    readyForPickupOrderCount: number;
    completedOrderCount: number;
    cancelledOrderCount: number;
    onRefresh: () => void;
}

export function FulfillmentSummary({ todayOrderCount, pendingOrderCount, inProgressOrderCount, outForDeliveryOrderCount, readyForPickupOrderCount, completedOrderCount, cancelledOrderCount, onRefresh }: OrdersSummaryProps) {
    return (
        <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-zinc-100">Fulfillment Overview</h2>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onRefresh}
                    className="text-white hover:text-zinc-100 bg-zinc-600 hover:bg-zinc-800"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard 
                    title="Today&apos;s Orders" 
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