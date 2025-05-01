'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewSummary } from "./OverviewSummary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Overview() {
    const [dateRange, setDateRange] = useState<'today' | 'last7' | 'month'>('today');

    return (
        <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex justify-end">
                <Select
                    value={dateRange}
                    onValueChange={(value) => setDateRange(value as 'today' | 'last7' | 'month')}
                >
                    <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-zinc-100">
                        <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last7">Last 7 Days</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <OverviewSummary
                todayOrderCount={0}
                pendingOrderCount={0}
                inProgressOrderCount={0}
                outForDeliveryOrderCount={0}
                readyForPickupOrderCount={0}
                completedOrderCount={0}
                cancelledOrderCount={0}
            />

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-zinc-100">Orders Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <div className="text-zinc-500 text-sm">Chart Coming Soon</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-zinc-100">Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <div className="text-zinc-500 text-sm">Chart Coming Soon</div>
                    </CardContent>
                </Card>
            </div>

            {/* Drill-down Link */}
            <div className="text-right">
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                    View All Orders →
                </button>
            </div>
        </div>
    );
}