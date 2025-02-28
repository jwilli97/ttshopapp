'use client';

import { useState, useEffect } from 'react';
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
import { getSupabaseClient } from '@/lib/supabaseClient';

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
  const [userId, setUserId] = useState<string | null>(null)
  
  const router = useRouter()
  // Get the Supabase client instance
  const supabase = getSupabaseClient();

  // Check URL parameters and user session on component mount
  useEffect(() => {
    // Get URL parameters to allow direct navigation to steps
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    
    // Set step from URL parameter if valid
    if (stepParam === 'profile') {
      console.log('URL parameter detected: step=profile');
      setStep('profile');
    }

    // Get user session to populate email and userId
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('User session found:', session.user.id);
        if (session.user.email) {
          setEmail(session.user.email);
        }
        setUserId(session.user.id);
        
        // If we have a user session and we're on the welcome page,
        // and the URL doesn't specify a step, move to profile setup
        if (step === 'welcome' && !stepParam) {
          console.log('User is authenticated but on welcome page, moving to profile setup');
          setStep('profile');
        }
      } else {
        console.log('No user session found');
      }
    };

    getSession();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          setUserId(session.user.id);
          if (session.user.email) {
            setEmail(session.user.email);
          }
          
          // If the user just signed in and we're in the auth flow,
          // move them to profile setup
          if (event === 'SIGNED_IN' && (step === 'email' || step === 'verify')) {
            console.log('User signed in, moving to profile setup');
            setStep('profile');
          }
        } else {
          setUserId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [step]);

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
          setStep('email');
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
      setIsLoading(true);
      setEmail(email);
      setError('');
      console.log('Email submitted:', email);
      
      // Check if we recently tried an authentication request (within the last 60 seconds)
      const lastAuthAttempt = localStorage.getItem('lastAuthAttempt');
      const now = Date.now();
      if (lastAuthAttempt && (now - parseInt(lastAuthAttempt)) < 60000) {
        // If we've attempted auth recently, proceed directly to verification code step
        console.log('Skipping auth request due to rate limiting');
        setStep('verify');
        setError('Please check your email for a verification code. If you don\'t see it, you can request a new one.');
        setIsLoading(false);
        return;
      }
      
      // Store current timestamp for rate limiting check
      localStorage.setItem('lastAuthAttempt', now.toString());
      
      // First, try to create the account with a random password
      console.log('Creating new account with email:', email);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: generateRandomPassword(),
        options: {
          // Don't use email verification for signup
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=profile`,
          data: {
            phone_number: phoneNumber
          }
        },
      });

      console.log('Sign up response:', { data: signUpData, error: signUpError });
      
      // If signup was successful or user already exists, send an OTP for verification
      if (!signUpError || (signUpError && signUpError.message.includes('already registered'))) {
        // Now send an OTP for verification
        console.log('Sending OTP for verification');
        const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=profile`,
          },
        });
        
        console.log('OTP sign in response:', { data: otpData, error: otpError });
        
        if (otpError) {
          // If we get rate limiting error, still proceed to verification step
          if (otpError.message.includes('security purposes') || otpError.message.includes('seconds')) {
            console.log('Rate limited, proceeding to verification step anyway');
            setStep('verify');
            setError('We\'re experiencing some delays. Please check your email for a verification link or enter the code below.');
            return;
          } else {
            throw otpError;
          }
        }
        
        // If we're here, we successfully sent an OTP
        setError('We sent a verification code to your email. Please check your inbox and enter the code below.');
        setStep('verify');
        return;
      } else {
        // If there was an error with signup that wasn't "already registered"
        throw signUpError;
      }
    } catch (error: any) {
      console.error('Error:', error);
      // Even if we encounter an error, still allow moving to verification step
      if (error.message && (error.message.includes('security purposes') || error.message.includes('seconds'))) {
        setStep('verify');
        setError('Email verification will be required. Please check your email or try again later.');
      } else {
        setError(error.message || 'An error occurred during email verification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleResendVerification = async () => {
    try {
      // Check if we recently tried an authentication request (within the last 60 seconds)
      const lastAuthAttempt = localStorage.getItem('lastAuthAttempt');
      const now = Date.now();
      if (lastAuthAttempt && (now - parseInt(lastAuthAttempt)) < 60000) {
        // If we've attempted auth recently, show a friendly message
        const timeLeft = Math.ceil((60000 - (now - parseInt(lastAuthAttempt))) / 1000);
        setError(`Please wait ${timeLeft} seconds before requesting another verification code.`);
        return Promise.reject(new Error('Rate limited'));
      }
      
      // Store current timestamp for rate limiting check
      localStorage.setItem('lastAuthAttempt', now.toString());
      
      // Send OTP for verification
      console.log('Resending OTP for verification');
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=profile`,
        },
      });

      if (otpError) {
        // If we get rate limited, provide a friendly message
        if (otpError.message.includes('security purposes') || otpError.message.includes('seconds')) {
          setError('Please wait a minute before requesting another verification code.');
          return Promise.reject(otpError);
        } else {
          throw otpError;
        }
      }
      
      setError('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      if (error.message && (error.message.includes('security purposes') || error.message.includes('seconds'))) {
        setError('Please wait a minute before requesting another verification code.');
      } else {
        setError(error.message || 'Failed to resend verification code');
      }
      return Promise.reject(error);
    }
    
    return Promise.resolve();
  };

  const handleCodeVerification = async (code: string) => {
    try {
      setIsLoading(true);
      console.log('Verifying code:', code);
      
      // Skip verification if code is 'SKIPPED' in development
      if (process.env.NODE_ENV === 'development' && code === 'SKIPPED') {
        console.log('Verification skipped in development');
        setStep('profile');
        return;
      }

      // Verify the OTP code
      console.log('Verifying OTP code');
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'magiclink' // Always use magiclink type for OTP verification
      });
      
      console.log('OTP verification response:', { data, error });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        console.log('OTP verification successful, setting userId:', data.user.id);
        setUserId(data.user.id);
      }

      console.log('Verification successful, proceeding to profile setup');
      setStep('profile');
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Invalid verification code. Please try again or request a new code.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleProfileSubmit = async (profileData: UserProfile) => {
    console.log('Profile data submitted:', profileData);
    setFormData(prev => ({ ...prev, profile: profileData }));
    setStep('personal');
  }

  const handlePersonalSubmit = async (personalData: any) => {
    console.log('Personal data submitted:', personalData);
    // Store the personal data in the formData state
    setFormData(prev => ({ 
      ...prev, 
      profile: { ...prev.profile, ...personalData }
    }));
    setStep('address');
  }

  const handleAddressSubmit = async (addressData: DeliveryAddress) => {
    setFormData(prev => ({ ...prev, address: addressData }));
    
    try {
      // Log the form data to debug
      console.log('Form data before submission:', formData);
      
      // Get the form profile data with type assertion
      const formProfileData = formData.profile as any;
      
      // Check if we have a userId from the auth state or get the current user
      let currentUserId = userId;
      
      // Debug the current auth state
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData);
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Auth.getUser() result:', user);
        
        if (user?.id) {
          currentUserId = user.id;
          console.log('Retrieved userId from auth.getUser():', currentUserId);
        } else {
          // If no user is found, we need to handle this gracefully
          console.error('No authenticated user found. Saving profile data to localStorage for later.');
          
          // Store the form data in localStorage for later use
          localStorage.setItem('pendingProfileData', JSON.stringify({
            profile: formProfileData,
            address: formData.address
          }));
          
          // Redirect to login with a message
          router.push('/login?message=Please log in to complete your profile setup');
          return;
        }
      }
      
      // Create a clean profile object that matches the database schema
      const profileData: UserProfile = {
        // Profile form data (already in snake_case)
        display_name: formProfileData?.display_name || '',
        strain_preference: formProfileData?.strain_preference || '',
        avatar_url: formProfileData?.avatar_url || '',
        
        // Personal form data (needs conversion from camelCase to snake_case)
        first_name: formProfileData?.firstName || '',
        last_name: formProfileData?.lastName || '',
        birthday: formProfileData?.birthday || '',
        phone_number: formProfileData?.phoneNumber || phoneNumber,
        
        // Add email from state
        email: email
      };
      
      // Add custom fields that aren't in the UserProfile type
      const extraData = {
        replacement_preference: formProfileData?.replacement_preference || ''
      };
      
      console.log('Mapped profile data:', profileData);
      console.log('Using userId for profile:', currentUserId);
      
      // Instead of direct Supabase access, use our API endpoint
      const response = await fetch('/api/createProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileData,
          extraData,
          deliveryAddress: formData.address
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('API error:', result);
        throw new Error(result.error || 'Failed to create profile');
      }
      
      console.log('Profile created successfully:', result);
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile information. Please try again or contact support.');
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
      case 'email':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
              <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl text-white mb-8">Create Your Account</h1>
              <p className="text-white text-center mb-8">
                Please enter your email address to create an account.
                You'll receive a verification link to confirm your email.
              </p>
            </div>
            <EmailVerificationForm onSubmit={handleEmailSubmit} isLoading={isLoading} error={error} />
          </div>
        )
      case 'verify':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
              <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl text-white mb-8">Verify Your Email</h1>
              <p className="text-white text-center mb-8">
                We've sent a verification link to your email.
                Click the link in the email or enter the verification code below.
              </p>
            </div>
            <CodeVerificationForm 
              onSubmit={handleCodeVerification} 
              onResend={handleResendVerification}
              isLoading={isLoading} 
              error={error} 
            />
          </div>
        )
      case 'profile':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
              <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl text-white mb-8">Create Your Profile</h1>
              <p className="text-white text-center mb-8">
                Let's set up your profile information.
              </p>
            </div>
            <ProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} error={error} />
          </div>
        )
      case 'personal':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
              <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl text-white mb-8">Personal Information</h1>
              <p className="text-white text-center mb-8">
                Please provide your personal details.
              </p>
            </div>
            <PersonalForm 
              onSubmit={handlePersonalSubmit} 
              isLoading={isLoading} 
              error={error}
              initialPhoneNumber={phoneNumber}
              initialEmail={email}
            />
          </div>
        )
      case 'address':
        return (
          <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <BackButton />
            <div className="mb-10 animate-wiggle">
              <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl text-white mb-8">Delivery Address</h1>
              <p className="text-white text-center mb-8">
                Please provide your delivery address.
              </p>
            </div>
            <AddressForm onSubmit={handleAddressSubmit} isLoading={isLoading} error={error} />
          </div>
        )
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderStep()}
    </div>
  )
}