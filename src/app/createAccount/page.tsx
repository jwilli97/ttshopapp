'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackButton from "@/components/backButton";

export default function CreateAccount() {

  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
      <BackButton />
      <div className="mb-10 animate-wiggle">
        <Image src="/tinytreelogo.png" width={115} height={115} alt="Welcome Logo"  />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl text-white mb-8 ">Welcome to Tiny Trees</h1>
      </div>
      <p className="text-white text-lg mt-6 mb-8">Have you shopped with us before?</p>
      <div className="flex flex-row space-x-4">
        <Button className="bg-primary hover:bg-primary/75 w-56 h-11" onClick={() => router.push('/createAccount/Returning')}>Yes</Button>
        <Button className="bg-primary hover:bg-primary/75 w-56 h-11" onClick={() => router.push('/createAccount/Verification')}>No</Button>
      </div>
    </div>
  );
}