'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

interface CodeVerificationFormProps {
  onSubmit: (code: string) => void;
  onResend: () => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

export function CodeVerificationForm({ 
  onSubmit, 
  onResend,
  error: parentError = null,
  isLoading = false 
}: CodeVerificationFormProps) {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  
  // Use the error from parent if provided, otherwise use local error
  const error = parentError || localError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      if (!code || code.length !== 6) {
        setLocalError('Please enter a valid 6-digit code');
        return;
      }

      // Let the parent component handle the verification logic
      onSubmit(code);
    } catch (error) {
      console.error('Error:', error);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      await onResend();
      // Optionally add a success toast/message here
    } catch (error) {
      console.error('Error resending code:', error);
      setLocalError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSkip = () => {
    // Skip verification entirely in development
    if (process.env.NODE_ENV === 'development') {
      onSubmit('SKIPPED');
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="flex justify-center py-4">
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
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-primary text-sm hover:underline"
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend verification code'}
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/75 h-11 mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>

        {process.env.NODE_ENV === 'development' && (
          <Button
            type="button"
            onClick={handleSkip}
            className="w-full bg-gray-200 hover:bg-gray-300 text-black mt-2"
          >
            Skip Verification (Dev Only)
          </Button>
        )}
      </form>
    </div>
  );
}