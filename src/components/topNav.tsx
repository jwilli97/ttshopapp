import Image from "next/image"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function TopNav() {
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
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
    
                    if (error) throw error;
                    if (data) {
                        setDisplayName(data.display_name);
                        setAvatarUrl(data.avatar_url);
                        setStreetAddress(data.street_address);
                        setEmail(data.email);
                    }
                }
            } catch (error) {
                console.error("There was a problem fetching data:", error);
                setError("Failed to load data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <nav className="flex items-center pr-4 pl-4 pb-4">
            <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-4xl text-primary font-semibold">{displayName}</span>
                    <div className="flex text-xl items-center text-white">
                        <span>{streetAddress}</span>
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </nav>
    );
}