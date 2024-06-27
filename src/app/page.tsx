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

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 animate-wiggle">
          <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
        </div>
        <div>
          <p className="text-4xl mb-8 ">Welcome to Tiny Trees</p>
        </div>
        <div className="grid w-full max-w-sm items center gap-2 mb-4">
          <Label htmlFor="email">Email</Label>
          <Input type="text" id="email" autoComplete="email" placeholder="mikewazowski@aol.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid w-full max-w-sm items center gap-2 mb-6">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" placeholder="*******" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        { error && (<div className="flex flex-row text-accent font-thin text-sm"><ErrorIcon /> {error}</div>)}
        <div>
          <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </Button>
        </div>
        <div>
          <Button size="lg" variant={"ghost"} className="hover:bg-accent/50 w-72 h-11 mt-3" asChild>
            <Link href="/CreateAccount" className="underline">Create Account</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}