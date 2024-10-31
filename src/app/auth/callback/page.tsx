'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Suspense } from 'react';

// Separate component for the auth logic
export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
    useEffect(() => {
      const handleAuthCallback = async () => {
        const code = searchParams.get('code');
        
        console.log('Auth callback initiated with code:', code); // Add logging
        
        if (code) {
          try {
            console.log('Attempting code exchange...'); // Add logging
            const { error: signInError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (signInError) {
              console.error('Error during code exchange:', signInError);
              router.push('/createAccount/SignUp?error=Authentication failed');
              return;
            }
  
            console.log('Code exchange successful, checking session...'); // Add logging
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              router.push('/createAccount/SignUp?error=Session creation failed');
              return;
            }
  
            if (session) {
              console.log('Session created successfully, redirecting...'); // Add logging
              router.push('/createAccount/FirstLogIn');
            } else {
              console.error('No session created after successful exchange'); // Add logging
              router.push('/createAccount/SignUp?error=No session created');
            }
          } catch (error) {
            console.error('Unexpected error during auth:', error);
            router.push('/createAccount/SignUp?error=Unexpected authentication error');
          }
        } else {
          console.error('No verification code found in URL'); // Add logging
          router.push('/createAccount/SignUp?error=No verification code provided');
        }
      };
  
      handleAuthCallback();
    }, [router, searchParams, supabase.auth]);
  
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Verifying your account...</p>
        </div>
      </div>
    );
  };
