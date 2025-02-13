"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Passcode() {

    const [password, setPassword] = useState('');
    const router = useRouter();

    const handlePasswordLogin = () => {
        if (password === process.env.NEXT_PUBLIC_MONTHLY_PASSWORD) {
            router.push('/dashboard');
        } else {
            alert('Incorrect password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
                <div className="flex flex-col items-center mb-8">
                    <Image src="/new_TT_logo.png" width={115} height={115} alt="Welcome Logo" />
                    <h1 className="text-white text-3xl mt-4">Please enter the passcode to continue</h1>
                </div>
                <div className="flex flex-col items-start w-full max-w-[288px]">
                    <Label htmlFor="password" className="mb-2">Passcode</Label>
                    <Input 
                        type="password" 
                        placeholder="********" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="max-w-[288px]"
                    />
                    <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/75 w-72 h-11 mt-2" 
                        onClick={handlePasswordLogin}
                    >
                        Enter
                    </Button>
                </div>
            </div>
        </div>
    );
}
