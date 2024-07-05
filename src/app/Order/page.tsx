'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";
import TypeformEmbed from "@/components/TypeformEmbed";
import HomeButton from "@/components/HomeButton";
import LogOutButton from "@/components/logoutButton";

export default function Order(){
    return (
        <ProtectedRoute>
        <div className="flex h-screen w-full flex-col items-center">
            <div className="flex flex-row items-center w-full justify-between">
                <HomeButton />
                <LogOutButton />
            </div>
            <div className="flex h-screen w-full flex-col items-center">
                <TypeformEmbed id="https://oqp9rakqhzm.typeform.com/to/XzHEGZY0" />
            </div>
        </div>
        </ProtectedRoute>
    );
}