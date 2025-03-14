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
        <nav className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-2">
                <Avatar 
                    className="h-16 w-16 md:h-20 md:w-20 cursor-pointer"
                    onClick={handleNavigateToAccount}
                >
                    <AvatarImage src={avatarUrl} alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span 
                        className="text-2xl md:text-4xl text-primary font-semibold cursor-pointer truncate max-w-[200px] md:max-w-none"
                        onClick={handleNavigateToAccount}
                    >
                        {displayName}
                    </span>
                    <div className="flex items-center text-white">
                        <span className="text-base md:text-xl truncate max-w-[180px] md:max-w-none">
                            {streetAddress}
                        </span>
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                <LogoutButton />
            </div>
        </nav>
    );
}