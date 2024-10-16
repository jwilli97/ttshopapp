'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateAccount() {

  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 animate-wiggle">
        <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
      </div>
      <div>
        <p className="text-4xl text-white mb-8 ">Welcome to Tiny Trees</p>
      </div>
      <div className="flex flex-col mt-4">
        <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11" onClick={() => router.push('/createAccount/Verification')}>New Customer</Button>
        <Button size="lg" className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" onClick={() => router.push('/createAccount/Returning')}>Returning Customer</Button>
        <Button size="lg" className="bg-accent/80 hover:bg-accent/50 text-black w-72 h-11 mt-12" onClick={() => router.push('/')}>Back</Button>
      </div>
    </div>
  );
}