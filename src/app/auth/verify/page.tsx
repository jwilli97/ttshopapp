"use client";

import { DeliveryAddress, UserProfile } from "@/app/types/auth";
import { FormStep } from "@/app/types/auth";
import BackButton from "@/components/backButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Verify() {
    const [step, setStep] = useState<FormStep>('welcome')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = getSupabaseClient();
    const [formData, setFormData] = useState<{
        profile?: UserProfile;
        address?: DeliveryAddress;
    }>({})

    const handleNewCustomer = () => {
        setStep('phone_verify');
    }
    
    const handleReturningCustomer = () => {
        setStep('returning');
    }
    
    const formatPhoneNumber = (number: string) => {
      const digitsOnly = number.replace(/\D/g, '');
      return digitsOnly.startsWith('1') ? `+${digitsOnly}` : `+1${digitsOnly}`;
    }
    
    const handlePhoneVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
    
        if (!phoneNumber) {
          setError('Please enter a phone number');
          setIsLoading(false);
          return;
        }
    
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
        console.log('Formatted phone number:', formattedPhoneNumber);
    
        try {
          // For both paths, first check Supabase
          console.log('Checking Supabase account...');
          const supaResponse = await fetch('/api/checkSupaAccount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
          });
    
          if (!supaResponse.ok) throw new Error('Failed to check Supabase account');
          const supaData = await supaResponse.json();
          console.log('Supabase account check result:', supaData);
    
          // Then check Square
          console.log('Checking Square account...');
          const squareResponse = await fetch('/api/checkAccount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
          });
    
          if (!squareResponse.ok) throw new Error('Failed to check Square account');
          const squareData = await squareResponse.json();
          console.log('Square account check result:', squareData);
    
          // Decision tree:
          if (step === 'returning') {
            console.log('Processing returning customer path...');
            // Returning customer path
            if (supaData.exists) {
              console.log('Supabase account exists, redirecting to login');
              // Has Supabase account - direct to login
              router.push('/login');
              return;
            }
            if (squareData.exists) {
              console.log('Square account exists but no Supabase account, continuing to email verification');
              // Has Square but no Supabase - continue to email verification
              router.push('/Test/signUp');
              return;
            }
            console.log('No account found');
            setError('No account found. Please try creating a new account.');
            return;
          } else {
            console.log('Processing new customer path...');
            // New customer path
            if (supaData.exists) {
              console.log('Supabase account already exists');
              setError('Account already exists. Please sign in or try a different phone number.');
              return;
            }
            if (!squareData.exists) {
              console.log('No Square account found');
              setError('Please visit our store first to create an account.');
              return;
            }
            console.log('Square account exists but no Supabase account, continuing to email verification');
            // Has Square but no Supabase - perfect for new customer
            router.push('/Test/signUp');
          }
    
        } catch (error) {
          console.error('Error:', error);
          setError('An error occurred while checking the account');
        } finally {
          setIsLoading(false);
        }
      }
    
    const renderStep = () => {
        switch (step) {
          case 'welcome':
            return (
              <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
                <BackButton />
                <div className="mb-10">
                  <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h1 className="text-4xl text-white mb-8">Welcome to Tiny Trees</h1>
                </div>
                <p className="text-white text-lg mt-6 mb-8">Have you shopped with us before?</p>
                <div className="flex flex-row space-x-4">
                  <Button className="bg-primary hover:bg-primary/75 w-56 h-11" onClick={handleReturningCustomer}>Yes</Button>
                  <Button className="bg-primary hover:bg-primary/75 w-56 h-11" onClick={handleNewCustomer}>No</Button>
                </div>
              </div>
            )
          case 'phone_verify':
            return (
              <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
                <BackButton />
                <div className="mb-10">
                  <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
                </div>
                <div>
                  <h1 className="text-4xl text-white mb-8">Let&apos;s get you verified!</h1>
                </div>
                <form onSubmit={handlePhoneVerification}>
                  <Label className="text-white" htmlFor="phoneNumber">Enter your referral code</Label>
                  <Input 
                    className="text-white mt-1.5 mb-3"
                    type="tel"
                    id="phoneNumber"
                    autoComplete="tel"
                    placeholder="555-555-5555"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                  </Button>
                </form>
              </div>
            )
          case 'returning':
            return (
              <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
                <BackButton />
                <div className="mb-10 animate-wiggle">
                  <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
                </div>
                <div>
                  <h1 className="text-4xl text-white mb-8">Welcome back!</h1>
                </div>
                <form onSubmit={handlePhoneVerification}>
                  <Label className="text-white" htmlFor="phoneNumber">Enter your phone number</Label>
                  <Input 
                    className="text-white mt-1.5 mb-3"
                    type="tel"
                    id="phoneNumber"
                    autoComplete="tel"
                    placeholder="555-555-5555"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Continue'}
                  </Button>
                </form>
              </div>
            )
        }
    };

    return (
        <div>
            {renderStep()}
        </div>
    );
}