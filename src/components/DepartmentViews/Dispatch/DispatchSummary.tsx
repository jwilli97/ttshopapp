import { Car, PackageCheck } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";

interface DispatchSummaryProps {
    todayDeliveryCount: number;
    deliveryInProgressCount: number;
}

export function DispatchSummary({ todayDeliveryCount, deliveryInProgressCount }: DispatchSummaryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Today's Deliveries" value={todayDeliveryCount} description="Number of deliveries completed today" icon={<PackageCheck className="h-4 w-4" />} />
            <SummaryCard title="Deliveries in Progress" value={deliveryInProgressCount} description="Number of deliveries currently in progress" icon={<Car className="h-4 w-4" />} />
        </div>
    );
}