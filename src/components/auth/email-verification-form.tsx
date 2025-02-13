'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from 'lucide-react'

interface EmailVerificationFormProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
}

export function EmailVerificationForm({ onSubmit, onBack }: EmailVerificationFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      })

      console.log('OTP Response:', { data, error })

      if (error) {
        if (error.message.includes('security purposes')) {
          setError('Please wait 60 seconds before requesting another code.')
        } else {
          setError(error.message)
        }
        return
      }

      // Only call onSubmit if we successfully sent the email
      onSubmit(email);
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto mt-4">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
      </div>
      <div>
      <h1 className="text-xl font-semibold ml-2">CREATE ACCOUNT</h1>
      </div>
      
      <div className="h-2 bg-gray-100 rounded">
        <div className="h-full w-1/6 bg-primary rounded" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-sm font-medium">VERIFY EMAIL</h2>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="fixed bottom-12 left-0 right-0 max-w-sm mx-auto">
          <Button
            type="submit"
            className="w-full bg-primary mb-2"
            disabled={loading}
          >
            {loading ? 'SENDING...' : 'SEND CODE'}
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit('test@example.com')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-black"
          >
            SKIP VERIFICATION (DEV ONLY)
          </Button>
        </div>
      </form>
    </div>
  );
}