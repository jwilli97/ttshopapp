"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function createAccount() {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralNumber, setReferralNumber] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

  return (
    <form onSubmit={handleSubmit}>
        <div className="flex h-screen flex-col place-items-center px-4 py-12">
            <div className="flex flex-col place-items-center mb-11">
                <p className="text-4xl mb-5 ">Create Account</p>
                <Progress value={12} className="h-3 w-80" />
            </div>
            <div className="grid w-full max-w-sm gap-2 mb-4">
                <Label htmlFor="firstName">First Name</Label>
                <Input onChange={(e) => setFirstName(e.target.value)} type="name" placeholder="Mike" />
            </div>
            <div className="grid w-full max-w-sm gap-2 mb-4">
                <Label htmlFor="lastName">Last Name</Label>
                <Input onChange={(e) => setLastName(e.target.value)} type="name" placeholder="Wazowski" />
            </div>
            <div className="grid w-full max-w-sm gap-2 mb-4">
                <Label htmlFor="email">Email</Label>
                <Input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="mikewazowski@aol.com" />
            </div>
            <div className="grid w-full max-w-sm gap-2 mb-6">
                <Label htmlFor="password">Password</Label>
                <Input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="*******" />
            </div>
            <div className="grid w-full max-w-sm gap-2 mb-6">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input onChange={(e) => password === confirmPassword} type="password" placeholder="*******" />
            </div>
            <div className="grid w-full max-w-sm gap-2 mb-6">
                <Label htmlFor="refferal">Referral Number</Label>
                <Input type="referralNumber" placeholder="hmmm..." />
            </div>
            { error && (<div className="text-accent font-thin text-sm">{error}</div>)}
            <div>
                <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" asChild>
                    <Link href="/dashboard"><strong>Continue</strong></Link>
                </Button>
            </div>
        </div>
    </form>
  );
}
