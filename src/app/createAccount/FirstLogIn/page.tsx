'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import ErrorIcon from "@/components/icons/errorIcon";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function FirstLogIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
        } else {
            router.push('/createAccount/Profile');
        }

        setIsLoading(false);
    };

    return (
        <div className="flex h-screen w-full flex-col items-center text-white justify-center px-4 py-12">
            <div className="mb-10">
                <Image src="/new_TT_logo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col place-items-center mb-8">
                <h1 className="text-4xl">Thanks for signing up!</h1>
                <p>Please sign in to create your account</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="grid w-full max-w-sm items center gap-2 mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input type="text" id="email" autoComplete="email" placeholder="mikewazowski@aol.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid w-full max-w-sm items center gap-2 mb-6">
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" id="password" placeholder="*******" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="flex place-items-center text-red-500 text-sm mb-2"><ErrorIcon /> {error}</p>}
                <div>
                    <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" type="submit" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Continue'}
                    </Button>
                </div>
            </form>
        </div>
    );
}