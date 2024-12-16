'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import AvatarSelectionModal from "@/components/AvatarSelectionModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import BackButton from "@/components/backButton";

export default function PersonalInfo() {

    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [perferredStrain, setPerferredStrain] = useState('');
    const [replacementPreference, setReplacementPreference] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        replacementPreference: '',
    });
    const router = useRouter();

    const predefinedAvatars = [
        '/profile_pics/profileNug1.png',
        '/profile_pics/profileNug2.png',
        '/profile_pics/profileNug3.png',
        '/profile_pics/profileNug4.png',
        '/profile_pics/profileNug5.png',
        '/profile_pics/profileNug6.png',
        '/profile_pics/profileNug7.png',
        '/profile_pics/profileNug8.png',
        '/profile_pics/profileNug9.png',
    ];

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
                    .maybeSingle();
                
                if (error) throw error;
    
                if (data) {
                    setDisplayName(data.display_name || '');
                    setAvatarUrl(data.avatar_url || '');
                    setPerferredStrain(data.perferred_strain || '');
                    setReplacementPreference(data.replacement_preference || '');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submission started');
        setIsLoading(true);
        setError('');
        
        // Log current values
        console.log('Current values:', {
            perferredStrain,
            replacementPreference,
            displayName,
            avatarUrl
        });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('Current user:', user); // Debug log

            if (!user) {
                throw new Error('No authenticated user found');
            }

            const updateData = {
                user_id: user.id, // Add this line
                perferred_strain: perferredStrain,
                replacement_preference: replacementPreference,
                display_name: displayName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            };

            console.log('Updating with data:', updateData); // Debug log

            const { data, error } = await supabase
                .from('profiles')
                .upsert(updateData)
                .select();
            
            if (error) {
                console.error('Supabase error:', error); // More detailed error logging
                throw error;
            }

            console.log('Update successful:', data); // Debug log
            router.push('/createAccount/DeliveryInfo');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to create profile. Please try again.');
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarUrl(avatarUrl);
    };

    return (
        <div className="flex h-screen flex-col items-center px-4 py-12 mb-40">
            <BackButton />
            <div className="flex flex-col items-center">
                <h1 className="text-4xl text-white font-semibold mb-2">Create Your Profile</h1>
                <p className="text-white text-lg">Step 2 of 3</p>
            </div>
            <div className="container bg-[#cbd5e1] h-0.5 w-full mt-4 md:w-11/12 rounded-full"></div>
            <form onSubmit={handleSubmit} className="w-80 text-white mt-4">
                <p className="text-xl font-semibold mb-2">Profile</p>
                <div className="flex flex-col mb-4 items-center w-full">
                    <AvatarSelectionModal 
                        avatarUrl={avatarUrl}
                        onAvatarSelect={handleAvatarSelect}
                        onSelect={handleAvatarSelect}
                        onClose={() => setIsAvatarModalOpen(false)}
                        onOpenChange={setIsAvatarModalOpen}
                        isOpen={isAvatarModalOpen}
                        avatars={predefinedAvatars}
                    />
                </div>
                <Label className="ml-2" htmlFor="displayname">Display Name</Label>
                <Input 
                    className='mt-1 mb-2.5'
                    type="text" 
                    id="displayname" 
                    placeholder="" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    disabled={isLoading}
                    required 
                />
                <Label htmlFor="perferredStrain">Preferred Strain</Label>
                <div className="mt-1 mb-4">
                    <Select onValueChange={setPerferredStrain} value={perferredStrain}>
                        <SelectTrigger>
                            <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="text-white">
                            <SelectItem value="indica">Indica</SelectItem>
                            <SelectItem value="sativa">Sativa</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Label htmlFor="replacementPreference">Replacement Preference</Label>
                <div className="mt-1">
                    <Select onValueChange={setReplacementPreference} value={replacementPreference}>
                        <SelectTrigger>
                            <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="text-white">
                            <SelectItem value="use_preferred_strain">Use Preferred Strain</SelectItem>
                            <SelectItem value="contact_me">Contact Me</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="bg-primary hover:bg-primary/75 w-full md:w-72 h-11 text-white text-lg shadow-lg" type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Next'}
                    </Button>
                </div>
            </form>
        </div>
    );
}