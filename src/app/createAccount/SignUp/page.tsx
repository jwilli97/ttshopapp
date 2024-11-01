'use client';

// @ts-ignore
import InputMask from "react-input-mask";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import ErrorIcon from "@/components/icons/errorIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const supabase = createClientComponentClient();
    const router = useRouter();

    const formatPhoneForStorage = (phone: string) => {
        // Remove all non-digits and ensure US format
        const cleaned = phone.replace(/\D/g, '');
        return `+1${cleaned}`;
    };

    const validatePhoneNumber = (phoneNumber: string) => {
        const cleaned = phoneNumber.replace(/\D/g, '');
        return cleaned.length === 10;
    };

    const validateEmail = (email: string): boolean => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const stripped = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(stripped);
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

        // Basic validation checks
        if (!email || !password || !confirmPassword || !phoneNumber) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (!acceptedTerms) {
            setError('Please accept the Terms of Service');
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
            setError('Password does not meet requirements');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // Format phone number for storage
            const formattedPhone = formatPhoneForStorage(phoneNumber);

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'https://tinytreesfarm.vercel.app/FirstLogIn',
                    data: {
                        phone: formattedPhone,  // Store in user metadata
                        signUpDate: new Date().toISOString(),
                    }
                }
            });

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    throw new Error('An account with this email already exists');
                }
                throw signUpError;
            }

            // Check if we need to confirm email
            if (data?.user?.identities?.length === 0) {
                setError('An account with this email already exists');
                setIsLoading(false);
                return;
            }

            // Success path
            router.push('/createAccount/Pending');
        } catch (error: any) {
            console.error('Signup error:', error);
            setError(error.message || 'An error occurred during sign up');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col items-center text-white justify-center px-4 py-12">
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
                    <div className="flex flex-col mb-6 w-3/4">
                        <Label htmlFor="confirmPassword" className="mb-2">Confirm Password</Label>
                        <Input type="password" id="confirmPassword" placeholder="*******" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="flex flex-row place-items-center space-x-2 mb-4">
                        <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} />
                        <Label htmlFor="terms">
                            I agree to the <Link href="/terms" className="text-accent">Terms of Service</Link>
                        </Label>
                    </div>
                    {error && <p className="flex place-items-center text-red-500 text-sm mb-2"><ErrorIcon /> {error}</p>}
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
