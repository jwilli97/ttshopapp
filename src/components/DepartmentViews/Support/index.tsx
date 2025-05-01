'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function SupportView() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="text-center">
                <Construction className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <CardTitle className="text-2xl font-semibold text-zinc-100">Support Dashboard Coming Soon</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-zinc-400">
                <p>We're working hard to build an amazing support experience.</p>
                <p className="mt-2">Check back soon for updates!</p>
            </CardContent>
        </Card>
    );
}