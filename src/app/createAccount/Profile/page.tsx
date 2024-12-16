'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";

export default function CreateProfile() {

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthday, setBirthday] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        displayName: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        birthday: ''
    });
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
                throw new Error(`Authentication error: ${authError.message}`);
            }

            if (!user) {
                throw new Error('No authenticated user found');
            }

            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (profileError) {
                throw new Error(`Profile error: ${profileError.message}`);
            }

            if (data) {
                setDisplayName(data.display_name || '');
                setEmail(data.email || '');
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setPhoneNumber(data.phone_number || '');
                setAvatarUrl(data.avatar_url || '');
                setBirthday(data.birthday || '');
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            setError(error?.message || 'Failed to load profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Clear previous errors
        setFieldErrors({
            displayName: '',
            email: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            birthday: ''
        });

        // Validate fields
        let hasErrors = false;
        const newErrors = { ...fieldErrors };
        
        if (!displayName.trim()) {
            newErrors.displayName = 'Display name is required';
            hasErrors = true;
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        }
        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
            hasErrors = true;
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            hasErrors = true;
        }
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
            hasErrors = true;
        }

        if (hasErrors) {
            setFieldErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            // search for square customer ID
            const squareResponse = await fetch('/api/searchSquareAccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }),
            });
            const squareData = await squareResponse.json();
            console.log('squareData:', squareData);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        user_id: user.id,
                        display_name: displayName,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        phone_number: phoneNumber,
                        avatar_url: selectedAvatar || avatarUrl,
                        square_customer_id: squareData.customerId,
                        square_loyalty_id: squareData.loyaltyId,
                        updated_at: new Date()
                    }, {
                        onConflict: 'user_id'
                    });
                
                if (error) throw error;
                
                // Update local avatarUrl state if a new avatar was selected
                if (selectedAvatar) {
                    setAvatarUrl(selectedAvatar);
                    setSelectedAvatar(''); // Reset selectedAvatar after updating
                }
                
                router.push('/PersonalInfo');
            }
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

    return (
        <div className="flex h-screen flex-col items-center px-4 py-12 mb-30">
            <div className="flex flex-col items-center">
                <h1 className="text-4xl text-white font-semibold mb-2">Create Account</h1>
                <p className="text-white text-lg">Step 1 of 3</p>
            </div>
            <div className="container bg-[#cbd5e1] h-0.5 w-full mt-4 md:w-11/12 rounded-full"></div>
            <form onSubmit={handleSubmit} className="w-80 text-white mt-4">
                <div className="flex flex-col items-center">
                {/* <Badge className="bg-accent text-primary hover:text-accent hover:cursor-pointer">Membership Tier</Badge> */}
            </div>
                <p className="text-xl font-semibold mt-2 mb-1">Personal</p>
                <Label className="ml-2" htmlFor="firstname">First Name</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                    type="text" 
                    id="firstname" 
                    placeholder="" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    disabled={isLoading}
                    required 
                />
                {fieldErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.firstName}</p>
                )}
                <Label className="ml-2" htmlFor="lastname">Last Name</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                    type="text" 
                    id="lastname" 
                    placeholder="" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    disabled={isLoading}
                    required 
                />
                {fieldErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.lastName}</p>
                )}
                <Label className="ml-2" htmlFor="email">Email</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${fieldErrors.email ? 'border-red-500' : ''}`}
                    type="email" 
                    id="email" 
                    placeholder="" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                />
                {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.email}</p>
                )}
                <Label className="ml-2" htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${fieldErrors.phoneNumber ? 'border-red-500' : ''}`}
                    type="tel" 
                    id="phoneNumber" 
                    placeholder="" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    disabled={isLoading}
                    required 
                />
                {fieldErrors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.phoneNumber}</p>
                )}
                <Label htmlFor="birthday">Birthday</Label>
                <Input 
                    className="mb-2.5 mt-1 text-white [&::-webkit-calendar-picker-indicator]:filter-primary [&::-webkit-calendar-picker-indicator]:order-first" 
                    style={{
                        '--tw-calendar-picker-indicator-filter': 'invert(77%) sepia(13%) saturate(1095%) hue-rotate(93deg) brightness(91%) contrast(87%)'
                    } as React.CSSProperties}
                    type="date" 
                    id="birthday" 
                    value={birthday} 
                    onChange={(e) => setBirthday(e.target.value)}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => e.currentTarget.showPicker()}
                />
                {error && <p className="text-accent mt-2">{error}</p>}
                <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="bg-primary hover:bg-primary/75 w-full md:w-72 h-11 text-white text-lg shadow-lg" type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Next'}
                    </Button>
                </div>
            </form>
        </div>
    );
}