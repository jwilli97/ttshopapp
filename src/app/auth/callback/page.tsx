'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Suspense } from 'react';

// Separate component for the auth logic
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        try {
          const { error: signInError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (signInError) {
            console.error('Error during code exchange:', signInError);
            router.push('/createAccount/SignUp?error=Authentication failed');
            return;
          }

          // Check if we have a session after exchange
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            router.push('/createAccount/SignUp?error=Session creation failed');
            return;
          }

          if (session) {
            // Successfully verified and logged in
            router.push('/createAccount/FirstLogIn');
          } else {
            router.push('/createAccount/SignUp?error=No session created');
          }
        } catch (error) {
          console.error('Unexpected error during auth:', error);
          router.push('/createAccount/SignUp?error=Unexpected authentication error');
        }
      } else {
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

// Main component with Suspense wrapper
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
};
