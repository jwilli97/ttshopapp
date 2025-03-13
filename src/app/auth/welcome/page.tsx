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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.session) {
        setError('Login successful but no session created. Please try again.');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex w-full flex-col items-center justify-center px-4 pt-8 pb-4">
          <div className="mb-6">
            <Image src="/new_TT_logo.png" width={115} height={115} alt="Welcome Logo"  />
          </div>
          <div>
            <h1 className="text-white font-semibold text-4xl mb-8 ">Welcome!</h1>
          </div>
          <div className="grid w-full max-w-sm text-white items-center gap-2 mb-2">
            <Label htmlFor="email">Email</Label>
            <Input type="text" id="email" autoComplete="email" placeholder="mikewazowski@aol.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid w-full max-w-sm text-white items-center gap-2 mb-4">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                id="password" 
                placeholder="*******" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          { error && (<div className="flex flex-row text-red-500 font-thin text-sm"><ErrorIcon /> {error}</div>)}
          <div className="w-full max-w-sm">
            <Button size="lg" className="bg-primary hover:bg-primary/75 w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </div>
          {/* <div>
            <Link 
              href="/ForgotPassword" 
              className="block text-sm text-accent mt-2 text-center py-2"
            >
              Forgot Password?
            </Link>
          </div> */}
          {/* <div className="mt-8">
            <Link 
              href="/auth/verify" 
              className="block text-sm text-center py-2"
            >
              Create Account
            </Link>
          </div> */}
        </div>
      </form>
    </div>
  );
}