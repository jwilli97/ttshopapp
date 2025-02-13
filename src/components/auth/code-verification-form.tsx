'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CodeVerificationFormProps {
  email: string;
  onSubmit: (code: string) => void;
  onBack: () => void;
}

export function CodeVerificationForm({ email, onSubmit, onBack }: CodeVerificationFormProps) {
  const router = useRouter();
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!code || code.length !== 6) {
        setError('Please enter a valid 6-digit code')
        return
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'magiclink'
      })

      if (error) {
        console.log('Verification error:', error)
        if (error.message.includes('expired')) {
          setError('The verification code has expired. Please request a new code.')
        } else if (error.message.includes('invalid')) {
          setError('Invalid verification code. Please check and try again.')
        } else {
          setError(error.message)
        }
        return
      }

      console.log('Verification successful:', data)
      onSubmit(code)
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })
      if (error) throw error
      // Optionally add a success toast/message here
    } catch (error) {
      console.error('Error resending code:', error)
    }
  }

  const handleSkip = () => {
    // Skip verification entirely in development
    if (process.env.NODE_ENV === 'development') {
      onSubmit('SKIPPED')
    }
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
      </div>
      <div>
      <h1 className="text-xl font-semibold ml-2">CREATE ACCOUNT</h1>
      </div>
      
      <div className="h-2 bg-gray-100 rounded">
        <div className="h-full w-2/6 bg-primary rounded" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-sm font-medium">VERIFY EMAIL</h2>
          <p className="text-sm text-gray-300">Code sent to: {email}</p>
          <div className="flex justify-center py-8">
            <InputOTP 
              value={code} 
              onChange={(value) => setCode(value)}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <button
            type="button"
            onClick={handleResendCode}
            className="text-primary text-sm"
          >
            Resend code
          </button>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="fixed bottom-12 left-0 right-0 space-y-2 max-w-sm mx-auto">
          <Button
            type="submit"
            className="w-full bg-primary"
            disabled={loading}
          >
            NEXT
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <Button
              type="button"
              onClick={handleSkip}
              className="w-full bg-gray-200 hover:bg-gray-300 text-black"
            >
              SKIP VERIFICATION (DEV ONLY)
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}