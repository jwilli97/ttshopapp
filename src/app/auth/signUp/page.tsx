"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import BackButton from "@/components/backButton";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();
    const supabase = getSupabaseClient();

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setError(error.message);
        } else {
            router.push('/auth/check-email');
        }
    };

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-8">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col items-center justify-center mb-8">
                <h1 className="text-4xl text-white font-semibold mb-2">Welcome to Tiny Trees</h1>
                <h1 className="text-2xl">Let&apos;s get you signed up!</h1>
            </div>
            <form onSubmit={handleSignUp} className="w-72">
                <div className="mb-4 w-full">
                    <Label htmlFor="email" className="block mb-2 text-white">Email</Label>
                    <Input 
                        id="email"
                        type="email" 
                        placeholder="SnoopDogg@hotmail.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="text-white"
                    />
                </div>
                <div className="mb-6 w-full">
                    <Label htmlFor="password" className="block mb-2 text-white">Password</Label>
                    <Input 
                        id="password"
                        type="password" 
                        placeholder="********" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="text-white"
                    />
                </div>
                <div className="mb-6 w-full">
                    <Label htmlFor="confirmPassword" className="block mb-2 text-white">Confirm Password</Label>
                    <Input 
                        id="confirmPassword"
                        type="password" 
                        placeholder="********" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="text-white"
                    />
                </div>
                <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/75 w-full h-11 mt-4" 
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
            </form>
        </div>
    );
}