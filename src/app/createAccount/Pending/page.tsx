'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Pending() {
    const router = useRouter();

    return (
        <div className="flex h-screen w-full flex-col place-items-center text-white justify-center px-4 py-12">
            <div className="mb-10 animate-wiggle">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
            </div>
            <div>
                <h1 className="text-4xl mb-6">Thanks for signing up!</h1>
            </div>
            <div className="flex flex-col items-center">
                <p className=" text-md mb-8 text-center px-3">Please click the link sent to your email to start setting up your account.</p>
            </div>
        </div>
    );
}