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

export default function CreateAccount() {
  const [step, setStep] = useState<FormStep>('welcome')
  const [email, setEmail] = useState('')
  const [formData, setFormData] = useState<{
    profile?: UserProfile;
    address?: DeliveryAddress;
  }>({})
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleNewCustomer = () => {
    setStep('email');
  }

  const handleReturningCustomer = () => {
    router.push('/createAccount/Returning');
  }

  const handleEmailSubmit = async (email: string) => {
    try {
      setEmail(email)
      // Check if account exists in Supabase
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        // Account exists, redirect to login
        router.push('/login')
        return
      }

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

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // Redirect to login or show error
      router.push('/login')
      return false
    }
    return true
  }

  const handleProfileSubmit = async (profileData: Partial<UserProfile>) => {
    if (!await checkAuth()) return
    
    setFormData({ ...formData, profile: { ...formData.profile, ...profileData } as UserProfile })
    setStep('personal')
  }

  const handlePersonalSubmit = async (personalData: Partial<UserProfile>) => {
    setFormData({ 
      ...formData, 
      profile: { ...formData.profile, ...personalData } as UserProfile 
    })
    setStep('address')
  }

  const handleAddressSubmit = async (addressData: DeliveryAddress) => {
    setFormData({ ...formData, address: addressData })
    setStep('confirm')
  }

  const handleFinalSubmit = async (addressData: DeliveryAddress) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // First, save the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          ...formData.profile, 
          email,
          id: session.user.id,
          created_at: new Date().toISOString()
        }])

      if (profileError) throw profileError

      // Then, save the address
      const { error: addressError } = await supabase
        .from('addresses')
        .insert([{ 
          ...addressData, 
          email,
          user_id: session.user.id,
          created_at: new Date().toISOString()
        }])

      if (addressError) throw addressError

      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      // Show error to user
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
      case 'email':
        return <EmailVerificationForm onSubmit={handleEmailSubmit} onBack={() => setStep('welcome')} />
      case 'verify':
        return (
          <CodeVerificationForm
            email={email}
            onSubmit={handleCodeVerification}
            onBack={() => setStep('email')}
          />
        )
      case 'profile':
        return (
          <ProfileForm
            onSubmit={handleProfileSubmit}
            onBack={() => setStep('verify')}
          />
        )
      case 'personal':
        return (
          <PersonalForm
            onSubmit={handlePersonalSubmit}
            onBack={() => setStep('profile')}
          />
        )
      case 'address':
        return (
          <AddressForm
            defaultValues={formData.address}
            onSubmit={handleAddressSubmit}
            onBack={() => setStep('personal')}
          />
        )
      case 'confirm':
        return (
          <AddressForm
            defaultValues={formData.address}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep('address')}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen p-4">
      {renderStep()}
    </main>
  );
}