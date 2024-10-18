'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      console.error("Error sending reset password email:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
        <div className="animate-wiggle">
          <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
        </div>
      <div className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-4xl text-white text-center">Forgot Password</h1>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Send Reset Email
          </Button>
        </form>
        {message && <p className="text-center text-sm">{message}</p>}
        <Button
          variant="link"
          className="w-full text-white"
          onClick={() => router.push('/')}
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}
