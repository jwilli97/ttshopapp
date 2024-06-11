'use client';

import { useState } from "react";
import BackButton from "@/components/backButton";
import LogOutButton from "@/components/logoutButton";
import PlusIcon from "@/components/icons/plusIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function AccountPage() {
    return (
        // This is the edit account page where users can edit their account information
        <div className="flex h-screen flex-col items-center px-4 py-12">
            <div className="flex flex-row items-center w-full justify-between">
                <BackButton />
                <LogOutButton />
            </div>
            <div className="flex flex-col mb-4 items-center">
                <div className="flex flex-row place-items-end justify-center">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src="profileNug3.png" alt="Profile Picture" /> {/* take image set by user in DB for profile picture, delete comment when complete */}
                        <AvatarFallback className="text-2xl">TT</AvatarFallback>
                    </Avatar>
                    <PlusIcon />
                </div>
                <p className="text-3xl font-semibold mt-2 mb-1">Stonedy</p>
                <Badge className="bg-accent text-primary">Tier</Badge>
            </div>
            <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 rounded-full"></div>
            <div className="w-8/12 mt-4">
                <Label className="ml-2" htmlFor="displayname">Display Name</Label>
                <Input className="mt-1 mb-2.5" type="displayname" placeholder="Display Name" />
                <Label className="ml-2" htmlFor="email">Email</Label>
                <Input className="mt-1 mb-2.5" type="email" placeholder="Email" />
                <Label className="ml-2" htmlFor="firstname">First Name</Label>
                <Input className="mt-1 mb-2.5" type="firstname" placeholder="First Name" />
                <Label className="ml-2" htmlFor="lastname">Last Name</Label>
                <Input className="mt-1 mb-2.5" type="lastname" placeholder="Last Name" />
                <Label className="ml-2" htmlFor="phoneNumber">Phone Number</Label>
                <Input className="mt-1 mb-2.5" type="phoneNumber" placeholder="512-459-2222" />
                <Label className="ml-2" htmlFor="address">Delivery Address</Label>
                <Input className="mt-1 mb-2.5" type="address" placeholder="8467 Any Street, Houston, TX, 12345" />
            </div>
            <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                <Button className="bg-primary hover:bg-primary/75 w-full md:w-72 h-11 shadow-lg" asChild> 
                    <Link href="/Account">Save Changes</Link>
                </Button>
            </div>
        </div>
    );
}