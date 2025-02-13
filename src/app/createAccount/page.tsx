'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { EmailVerificationForm } from '@/components/auth/email-verification-form';
import { CodeVerificationForm } from '@/components/auth/code-verification-form';
import { ProfileForm } from '@/components/auth/profile-form';
import { PersonalForm } from '@/components/auth/personal-form';
import { AddressForm } from '@/components/auth/address-form';
import type { FormStep, UserProfile, DeliveryAddress } from '@/app/types/auth';
import Image from "next/image";
import BackButton from "@/components/backButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateAccount() {
  const [step, setStep] = useState<FormStep>('welcome')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<{
    profile?: UserProfile;
    address?: DeliveryAddress;
  }>({})
  
  const router = useRouter()
  const supabase = createClientComponentClient()

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

    try {
      // For both paths, first check Supabase
      const supaResponse = await fetch('/api/checkSupaAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
      });

      if (!supaResponse.ok) throw new Error('Failed to check Supabase account');
      const supaData = await supaResponse.json();

      // Then check Square
      const squareResponse = await fetch('/api/checkAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
      });

      if (!squareResponse.ok) throw new Error('Failed to check Square account');
      const squareData = await squareResponse.json();

      // Decision tree:
      if (step === 'returning') {
        // Returning customer path
        if (supaData.exists) {
          // Has Supabase account - direct to login
          router.push('/login');
          return;
        }
        if (squareData.exists) {
          // Has Square but no Supabase - continue to email verification
          setStep('email');
          return;
        }
        setError('No account found. Please try creating a new account.');
        return;
      } else {
        // New customer path
        if (supaData.exists) {
          setError('Account already exists. Please sign in or try a different phone number.');
          return;
        }
        if (!squareData.exists) {
          setError('Please visit our store first to create an account.');
          return;
        }
        // Has Square but no Supabase - perfect for new customer
        setStep('email');
      }

    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while checking the account');
    } finally {
      setIsLoading(false);
    }
  }

  const handleEmailSubmit = async (email: string) => {
    try {
      setEmail(email)
      
      // Send verification email/code
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signInError) throw signInError

      setStep('verify')
    } catch (error) {
      console.error('Error:', error)
      // Show error to user
    }
  }

  const handleCodeVerification = async (code: string) => {
    try {
      // Skip verification if code is 'SKIPPED' in development
      if (process.env.NODE_ENV === 'development' && code === 'SKIPPED') {
        console.log('Verification skipped in development');
        setStep('profile');
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'magiclink'
      })

      if (error) throw error;

      console.log('Verification successful:', data);
      setStep('profile');

    } catch (error) {
      console.error('Error verifying code:', error);
      // Handle error appropriately
    }
  }

  const handleProfileSubmit = async (profileData: UserProfile) => {
    setFormData(prev => ({ ...prev, profile: profileData }));
    setStep('personal');
  }

  const handlePersonalSubmit = async (personalData: UserProfile) => {
    setFormData(prev => ({ 
      ...prev, 
      profile: { ...prev.profile, ...personalData }
    }));
    setStep('address');
  }

  const handleAddressSubmit = async (addressData: DeliveryAddress) => {
    setFormData(prev => ({ ...prev, address: addressData }));
    
    try {
      // Create the user profile in your database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData.profile,
          delivery_address: formData.address
        });

      if (error) throw error;

      // Redirect to account or dashboard
      router.push('/account');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile information');
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
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
            <div className="mb-10 animate-wiggle">
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
      case 'email':
        return <EmailVerificationForm onSubmit={handleEmailSubmit} onBack={() => setStep('phone_verify')} />
      case 'verify':
        return (
          <CodeVerificationForm
            email={email}
            onSubmit={handleCodeVerification}
            onBack={() => setStep('email')}
          />
        )
      case 'returning':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
              <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div>
              <h1 className="text-4xl text-white mb-8">Let&apos;s get you verified!</h1>
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
      case 'existing_user':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <h2 className="text-2xl text-white mb-4">Account Already Exists</h2>
            <p className="text-white mb-4">Would you like to sign in instead?</p>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => setStep('email')}>Try Different Email</Button>
              <Button className="w-full" onClick={() => router.push('/login')}>Sign In</Button>
            </div>
          </div>
        )
      case 'profile':
        return (
          <ProfileForm 
            onSubmit={handleProfileSubmit}
            onBack={() => setStep('verify')}
          />
        );
        
      case 'personal':
        return (
          <PersonalForm
            onSubmit={handlePersonalSubmit}
            onBack={() => setStep('profile')}
          />
        );
        
      case 'address':
        return (
          <AddressForm
            onSubmit={handleAddressSubmit}
            onBack={() => setStep('personal')}
          />
        );
    }
  }

  return (
    <main className="min-h-screen p-4">
      {renderStep()}
    </main>
  );
}