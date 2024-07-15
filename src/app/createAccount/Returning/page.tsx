'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ConnectAccount() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatPhoneNumber = (number: string) => {
        const digitsOnly = number.replace(/\D/g, '');
        return digitsOnly.startsWith('1') ? `+${digitsOnly}` : `+1${digitsOnly}`;
    };

    const checkAccountExists = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!phoneNumber) {
            setError('Please enter a phone number');
            return;
        }

        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        try {
            // check supabase account first
            // console.log('Checking supabase account');
            const supaResponse = await fetch('/api/checkSupaAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
            });

            if (!supaResponse.ok) {
                throw new Error(`HTTP error! status: ${supaResponse.status}`);
            }

            const supaData = await supaResponse.json();
            // console.log('Supabase response:', supaData);

            if (supaData.exists) {
                // console.log('Account exists in supabase');
                setError('Account already exists');
                return;
            }

            // if not in supabase, check square account
            const squareResponse = await fetch('/api/checkAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
            });

            if (!squareResponse.ok) {
                throw new Error(`HTTP error! status: ${squareResponse.status}`);
            }

            const squareData = await squareResponse.json();

            if (squareData.exists) {
                // console.log('Account exists, redirecting to /CreateAccount/Pending');
                router.push('/createAccount/SignUp');
            } else {
                // console.log('No account found with this phone number');
                setError('No account found with this phone number');
            }
        } catch (error) {
            // console.error('Error checking account:', error);
            setError('An error occurred while checking the account');
        }
    };

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <div className="mb-10 animate-wiggle">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div>
                <h1 className="text-4xl mb-8">Connect your account!</h1>
            </div>
            <div>
                <form onSubmit={checkAccountExists}>
                    <Label htmlFor="phoneNumber">Enter your phone number</Label>
                    <Input className="mt-1.5 mb-3" type="tel" id="phoneNumber" autoComplete="tel" placeholder="555-555-5555" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    {/* errors give similar error messages */}
                    {error && <p className="flex flex-col place-items-center text-accent text-sm mb-2">{error}</p>}
                    <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" type="submit" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Continue'}
                    </Button>
                </form>
            </div>
        </div>
    );
}