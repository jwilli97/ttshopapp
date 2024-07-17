'use client';

// @ts-ignore
import InputMask from "react-input-mask";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ErrorIcon from "@/components/icons/errorIcon";
import Image from "next/image";

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validatePhoneNumber = (phoneNumber: string) => {
        return /^\d{10}$/.test(phoneNumber);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const stripped = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(stripped);
    };

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    
        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasDigit &&
            hasSymbol
        );
    };

    const checkPasswordStrength = (password: string) => {
        const checks = [
            { regex: /.{8,}/, message: 'At least 8 characters' },
            { regex: /[A-Z]/, message: 'At least one uppercase letter' },
            { regex: /[a-z]/, message: 'At least one lowercase letter' },
            { regex: /\d/, message: 'At least one digit' },
            { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, message: 'At least one symbol' }
        ];
    
        const results =  checks.map(check => ({
            message: check.message,
            isValid: check.regex.test(password)
        }));

        const allValid = results.every(result => result.isValid);
        return { allValid, results };
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid phone number');
            setIsLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long and include an uppercase letter, lowercase letter, digit, and symbol');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/squareSignUp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, phoneNumber }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'An error occurred during sign up');
            }

            router.push('/createAccount/FirstLogIn');
        } catch (error: any) {
            setError(error.message);
        }
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <div className="mb-10 animate-wiggle">
                <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
            </div>
            <div>
                <h1 className="text-4xl mb-8 ">Create Your Account</h1>
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="flex flex-col place-items-center">
                    <div className="flex flex-col mb-4 w-3/4">
                        <Label htmlFor="phoneNumber" className="mb-2">Phone Number</Label>
                        <InputMask 
                            mask="(999)-999-9999"
                            value={phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3')}
                            onChange={handlePhoneChange}
                        >
                            {(inputProps : any) => (
                                <Input 
                                    {...inputProps}
                                    type="tel" 
                                    id="phoneNumber" 
                                    autoComplete="tel" 
                                    placeholder="(123)-555-5555"
                                />
                            )}
                        </InputMask>
                    </div>
                    <div className="flex flex-col mb-4 w-3/4">
                        <Label htmlFor="email" className="mb-2">Email</Label>
                        <Input type="text" id="email" autoComplete="email" placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="flex flex-col mb-4 w-3/4">
                        <Label htmlFor="password" className="mb-2">Password</Label>
                        <Input type="password" id="password" placeholder="*******" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="flex flex-col mb-4 w-3/4">
                        <Label htmlFor="confirmPassword" className="mb-2">Confirm Password</Label>
                        <Input type="password" id="confirmPassword" placeholder="*******" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    {error && <p className="flex place-items-center text-accent text-sm mb-2"><ErrorIcon /> {error}</p>}
                    {password && !checkPasswordStrength(password).allValid && (
                            <div className="mt-2">
                                {checkPasswordStrength(password).results.map((check, index) => (
                                    <div key={index} className={check.isValid ? 'text-primary text-sm' : 'text-accent text-sm'}>
                                        {check.isValid ? '✓ ' : '✗ '} {check.message}
                                    </div>
                                ))}
                            </div>
                        )}
                    <div>
                        <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" type="submit" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Continue'}
                        </Button>
                    </div>
                    <div>
                        <Button size="lg" variant={"ghost"} className="hover:bg-accent/50 w-72 h-11 mt-3" onClick={() => router.push('/')}>
                            Back
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}