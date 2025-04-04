'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import TokenShop from "@/components/TokenShop";
import TopNav from "@/components/topNav";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { ClipLoader } from "react-spinners";
import Intercom from '@intercom/messenger-js-sdk';

export default function Dashboard() {
    const router = useRouter();
    const { profile, menuUrl, error, isLoading } = useDashboardData();

    // Initialize Intercom when profile is loaded
    if (profile && !isLoading) {
        Intercom({
            app_id: 'cdcmnvsm',
            user_id: profile.user_id,
            name: profile.display_name,
            email: profile.email,
            created_at: new Date(profile.created_at).getTime(),
        });

        // Add custom CSS to adjust Intercom position
        const style = document.createElement('style');
        style.innerHTML = `
            #intercom-container {
                bottom: 50px !important;
            }
            .intercom-lightweight-app-launcher {
                bottom: 50px !important;
            }
        `;
        document.head.appendChild(style);
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <ClipLoader className="text-primary" size={50} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen w-full flex-col items-center px-3 py-4 relative">
                <div className="w-full">
                    <TopNav />
                </div>
                <div className="flex flex-col w-full items-center">
                    <div className="container bg-[#cbd5e1]/25 h-0.5 w-full md:w-11/12 my-2 rounded-full"></div>
                    <TokenShop userId={profile?.user_id || ''} />
                    <div className="container bg-[#cbd5e1]/25 h-0.5 w-full md:w-11/12 my-2 rounded-full"></div>
                    <div className="mb-32 rounded-lg w-full max-w-4xl mx-auto px-4">
                        {menuUrl ? (
                            <div className="relative w-full aspect-[3/4] md:aspect-[4/3]">
                                <Image 
                                    src={menuUrl}
                                    alt="Current Menu"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    priority
                                    onClick={() => window.open(menuUrl, '_blank')}
                                />
                            </div>
                        ) : (
                            <p className="text-gray-700">No active menu set</p>
                        )}
                    </div>
                </div>
                <div className="fixed bottom-16 left-0 w-full flex justify-center px-6 py-4 z-50">
                    <Button 
                        className="text-white text-base font-medium hover:bg-primary/90 bg-primary w-full md:w-72 h-12 shadow-md rounded-lg" 
                        onClick={() => router.push('/Order')}
                    > 
                        Place Order
                    </Button>
                </div>
                <BottomNav />
            </div>
        </ProtectedRoute>
    );
}