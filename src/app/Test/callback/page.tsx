'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Suspense } from 'react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Log the full URL and search params for debugging
        console.log('Full URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));

        const code = searchParams.get('code');
        
        if (!code) {
          console.error('No code found in URL');
          router.push('/createAccount/SignUp?error=no_code');
          return;
        }

        // Exchange the code for a session
        const { error: signInError } = await supabase.auth.exchangeCodeForSession(code);
        if (signInError) {
          console.error('Sign in error:', signInError);
          router.push('/createAccount/SignUp?error=sign_in_failed');
          return;
        }

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push('/createAccount/SignUp?error=session_error');
          return;
        }

        if (!session) {
          console.error('No session found');
          router.push('/createAccount/SignUp?error=no_session');
          return;
        }

        // If we get here, everything worked
        console.log('Authentication successful');
        router.push('/createAccount/FirstLogIn');

      } catch (error) {
        console.error('Callback handling error:', error);
        router.push('/createAccount/SignUp?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-white">Verifying your account...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait while we complete the verification...</p>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-white">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}