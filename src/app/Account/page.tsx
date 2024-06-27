'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/backButton";
import LogOutButton from "@/components/logoutButton";

export default function Account() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setIsLoading(true);
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
                    setDisplayName(data.display_name || '');
                    setEmail(data.email || '');
                    setFirstName(data.first_name || '');
                    setLastName(data.last_name || '');
                    setPhoneNumber(data.phone_number || '');
                    setAddress(data.address || '');
                    setAvatarUrl(data.avatar_url || '');
                }
            }
        } catch (error: unknown) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile. Please try again.');
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="flex h-screen w-full flex-col items-center px-4 py-6 md:py-12 relative">
            <div className="flex flex-row items-center w-full justify-between">
                <BackButton />
                <LogOutButton />
            </div>
            <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl || "profile_pics/profileNug7.png"} alt="Profile Picture" />
                <AvatarFallback className="text-xl md:text-2xl">TT</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-3xl font-semibold mt-1 mb-2">{displayName}</p>
            </div>
            <Badge className="bg-accent text-primary hover:text-accent hover:cursor-pointer">Membership Tier</Badge>
            {/* You can add more profile information here */}
            <div className="mt-4">
                <p>Email: {email}</p>
                <p>Name: {firstName} {lastName}</p>
                <p>Phone: {phoneNumber}</p>
                <p>Address: {address}</p>
            </div>
            <div>
                <Button className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" onClick={() => router.push('/EditAccount')}>
                    Edit Profile
                </Button>
            </div>
        </div>
    )
}