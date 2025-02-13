'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BackButton from "@/components/backButton";

export default function ConnectAccount() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatPhoneNumber = (number: string) => {
        const digitsOnly = number.replace(/\D/g, '');
        return digitsOnly.startsWith('1') ? `+${digitsOnly}` : `+1${digitsOnly}`;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        await checkAccountExists();
        setIsLoading(false);
    };

    const checkAccountExists = async () => {
        setError('');
        
        if (!phoneNumber) {
            setError('Please enter a phone number');
            return;
        }

        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        try {
            const supaResponse = await fetch('/api/checkSupaAccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
            });
            const supaData = await supaResponse.json();

            if (supaData.exists) {
                setError('Account already exists, please sign in.');
                return;
            }

            const squareResponse = await fetch('/api/checkAccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
            });
            const squareData = await squareResponse.json();

            if (squareData.exists) {
                router.push('/createAccount/SignUp');
            } else {
                setError('No account found, please try again.');
            }
        } catch (error) {
            console.error('Error checking account:', error);
            setError('An error occurred while checking the account');
        }
    };

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div>
                <h1 className="text-4xl text-white mb-8">Connect your account!</h1>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <Label className="text-white" htmlFor="phoneNumber">Enter your phone number</Label>
                    <Input 
                        className="mt-1.5 text-white mb-3" 
                        type="tel" 
                        id="phoneNumber" 
                        autoComplete="tel" 
                        placeholder="555-555-5555" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                    />
                    {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
                    <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" 
                        type="submit" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Continue'}
                    </Button>
                </form>
                <Button variant="ghost" className="text-white hover:bg-accent/75 w-72 h-11 mt-2" onClick={() => router.push('/')}>Back</Button>
            </div>
        </div>
    );
};