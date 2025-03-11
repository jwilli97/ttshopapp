'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ErrorIcon from "@/components/icons/errorIcon";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode === process.env.NEXT_PUBLIC_HOUSTON_PASSWORD || 
        accessCode === process.env.NEXT_PUBLIC_HOUSTON2_PASSWORD) {
      // Redirect to holiday menu QR code
      window.location.href = "https://qrco.de/holidaymenu";
    } else if (accessCode === process.env.NEXT_PUBLIC_AUSTIN_PASSWORD) {
      // Set cookie for Austin access
      document.cookie = `auth_token=austin_authorized; path=/; max-age=18000; secure; samesite=strict`;
      router.push("/austin");
    } else {
      setError("Invalid Password");
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12 relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex w-full flex-col items-center justify-center px-4 pt-8 pb-4">
          <div className="mb-6">
            <Image src="/new_TT_logo.png" width={115} height={115} alt="Welcome Logo" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-4xl mb-8">Welcome to Tiny Trees!</h1>
          </div>
          <div className="grid w-full max-w-sm text-white items-center gap-2 mb-4">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                id="password" 
                placeholder="*******" 
                value={accessCode} 
                onChange={(e) => setAccessCode(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="w-full max-w-sm">
                {error && (
                    <p className="text-sm text-red-500 text-center animate-shake">{error}</p>
                )}
                <Button size="lg" className="bg-primary hover:bg-primary/75 w-full mt-4" type="submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Enter'}
                </Button>
            </div>
          </div>
        </div>
      </form>
      
      <div className="fixed bottom-4 w-full text-center">
        {/* TODO: Change routing for production */}
        <Link href="/auth/welcome" className="text-sm text-accent">TinyTrees BETA</Link>
      </div>
    </div>
  );
}
