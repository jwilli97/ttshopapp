'use client';

import React from "react";
import TypeformEmbed from "@/components/TypeformEmbed";
import BackButton from "@/components/backButton";
import LogOutButton from "@/components/logoutButton";

export default function Order(){
    return (
        <div className="flex h-screen w-full flex-col items-center">
            <div className="flex flex-row items-center w-full justify-between">
                <BackButton />
                <LogOutButton />
            </div>
            <div className="flex h-screen w-full flex-col items-center">
                <TypeformEmbed id="https://oqp9rakqhzm.typeform.com/to/XzHEGZY0" />
            </div>
        </div>
    );
}