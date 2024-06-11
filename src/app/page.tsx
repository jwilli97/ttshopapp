'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  
  const [error, setError] = useState('');

  return (
    <form>
      <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 animate-wiggle">
          <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
        </div>
        <div>
          <p className="text-4xl mb-8 ">Welcome to Tiny Trees</p>
        </div>
        <div className="grid w-full max-w-sm items center gap-2 mb-4">
          <Label htmlFor="email">Email</Label>
          <Input type="email" placeholder="mikewazowski@aol.com" />
        </div>
        <div className="grid w-full max-w-sm items center gap-2 mb-6">
          <Label htmlFor="password">Password</Label>
          <Input type="password" placeholder="*******" />
        </div>
        { error && (<div className="text-accent font-thin text-sm">{error}</div>)}
        <div>
          <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" asChild>
            <Link href="/dashboard"><strong>Login</strong></Link>
          </Button>
        </div>
        <div>
          <Button size="lg" variant={"ghost"} className="hover:bg-accent/50 w-72 h-11 mt-6" asChild>
            <Link href="/createAccount" className="underline">Create Account</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
