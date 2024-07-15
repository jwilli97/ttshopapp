'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ErrorIcon from "@/components/icons/errorIcon";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";

export default function NewAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    return /\d{3}-\d{3}-\d{4}/.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password || !confirmPassword || !phoneNumber) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and include a number, uppercase letter,lowercase letter, ditig, and special character');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      setIsLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms of service');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/createAccount/Pending');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 animate-wiggle">
        <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
      </div>
      <div>
        <h1 className="text-4xl mb-8 ">Create Your Account</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center">
          <div className="grid w-full max-w-sm items-center gap-2 mb-4">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input type="tel" id="phoneNumber" autoComplete="phoneNumber" placeholder="(123)-555-5555" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-2 mb-4">
            <Label htmlFor="email">Email</Label>
            <Input type="text" id="email" autoComplete="email" placeholder="mikewazowski@aol.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-2 mb-4">
            <Label htmlFor="password">Password</Label>
            <Input type="password" id="password" placeholder="*******" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-2 mb-6">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input type="password" id="confirmPassword" placeholder="*******" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="flex flex-row place-items-center space-x-2 mb-4">
            <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} />
            <Label htmlFor="terms">
              I agree to the <Link href="/terms" className="text-primary">Terms of Service</Link>
            </Label>
          </div>
          {error && <p className="flex place-items-center text-accent text-sm mb-2"><ErrorIcon /> {error}</p>}
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