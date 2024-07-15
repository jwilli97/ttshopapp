'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Pending() {
    const router = useRouter();

    return (
        <div className="flex h-screen w-full flex-col place-items-center justify-center px-4 py-12">
            <div className="mb-10 animate-wiggle">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
            </div>
            <div>
                <h1 className="text-4xl mb-10">Thank you!</h1>
            </div>
            <div className="flex flex-col items-center">
                <p className="mb-8 text-wrap px-3">Your account is pending verification. Please check your email for a verification link.</p>
            </div>
            <div>
                <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" onClick={() => router.push('/')}>
                    Home
                </Button>
            </div>
        </div>
    );
}