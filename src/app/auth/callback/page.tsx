'use client';

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error:', error)
        router.push('/createAccount/SignUp?error=Could not authenticate user')
        return
      }

      if (!session) {
        router.push('/signup?error=No session found')
        return
      }

      // User is signed in and verified, redirect to the appropriate page
      // Replace '/dashboard' with wherever you want users to go after verification
      router.push('/createAccount/FirstLogIn')
    }

    handleAuthCallback()
  }, [router, supabase])

  return <p>Verifying your account...</p>
};