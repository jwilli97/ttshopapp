"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            setError(error.message);
        } else {
            router.push('/create-profile');
        }
        setIsLoading(false);
    }

    const handleOtpLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
        });
        if (error) {
            setError(error.message);
        } else {
            router.push('/create-profile');
        }
        setIsLoading(false);
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <div className="mb-6">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col items-center justify-center mb-8">
                <h1 className="text-4xl text-white font-semibold mb-2">Hello There</h1>
                <p className="text-white text-md text-center">Please enter your email to login.</p>
            </div>
            <form onSubmit={handleLogin} className="w-72">
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
                <div className="mb-4 w-full">
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
                {error && (
                    <p className="text-sm text-red-500 text-center animate-shake mb-2">{error}</p>
                )}
                <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary/75 w-full h-11 mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login with Password'}
                </Button>
                {/* <Button 
                    type="button"
                    onClick={handleOtpLogin}
                    className="bg-accent hover:bg-accent/75 text-black w-full h-11 mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? 'Sending login code...' : 'Login with OTP'}
                </Button> */}
            </form>
        </div>
    );
}