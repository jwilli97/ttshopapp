"use client";

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight } from "lucide-react"
import LogoutButton from './logoutButton';

export default function TopNav() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [streetAddress, setStreetAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError) throw userError;
                
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                    if (error) throw error;
                    if (data) {
                        setDisplayName(data.display_name as string || '');
                        setAvatarUrl(data.avatar_url as string || '');
                        setStreetAddress(data.street_address as string || '');
                        setEmail(data.email as string || '');
                    }
                } else {
                    // Handle case when no user is logged in
                    console.log("No user logged in");
                    // You might want to redirect to login page here
                    // router.push('/login');
                }
            } catch (error: any) {
                console.error("There was a problem fetching data:", error);
                setError(error.message || "Failed to load data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleNavigateToAccount = () => {
        router.push('/Account');
    };

    return (
        <nav className="flex items-center justify-between pr-4 pl-4 pb-4">
            <div className="flex items-center space-x-4">
                <Avatar 
                    className="h-20 w-20 cursor-pointer"
                    onClick={handleNavigateToAccount}
                >
                    <AvatarImage src={avatarUrl} alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span 
                        className="text-4xl text-primary font-semibold cursor-pointer"
                        onClick={handleNavigateToAccount}
                    >
                        {displayName}
                    </span>
                    <div className="flex text-xl items-center text-white">
                        <span>{streetAddress}</span>
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                <LogoutButton />
            </div>
        </nav>
    );
}