"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CheckEmail() {

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
            <div className="mb-4">
                <Image src="/new_TT_logo.png" width={115} height={115} alt="Welcome Logo" />
            </div>
            <h1 className="text-4xl text-white font-semibold mb-8">Thanks for signing up!</h1>
            <p className="text-white text-md text-center mb-8">Please check your email for a verification link, <br /> or click on the button below.</p>
        </div>
    );
}