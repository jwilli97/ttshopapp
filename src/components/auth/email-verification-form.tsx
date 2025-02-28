'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EmailVerificationFormProps {
  onSubmit: (email: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export function EmailVerificationForm({ 
  onSubmit, 
  error: parentError = null, 
  isLoading = false 
}: EmailVerificationFormProps) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const error = parentError || localError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    try {
      if (!email || !email.includes('@')) {
        setLocalError('Please enter a valid email address')
        return
      }

      onSubmit(email);
    } catch (error) {
      console.error('Error:', error)
      setLocalError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-white text-sm">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-white"
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/75 h-11 mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}