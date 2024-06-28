'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ConnectAccount() {

    const router = useRouter();

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <div className="mb-10 animate-wiggle">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
            </div>
            <div>
                <h1 className="text-4xl mb-8 ">Connect your account!</h1>
            </div>
            <div>
                <Label htmlFor="phoneNumber">Enter your phone number</Label>
                <Input className="mt-1.5 mb-3" type="text" id="phoneNumber" autoComplete="phone" placeholder="555-555-5555" />
                <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" onClick={() => router.push('/CreateAccount/Profile')}>Continue</Button> {/* TODO: Add square api call to connect existing account & loyalty info */}
            </div>
        </div>
    );
}