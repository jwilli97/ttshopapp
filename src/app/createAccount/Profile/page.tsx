'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface FormData {
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthday: string;
  avatarUrl: string;
}

export default function CreateProfile() {

    const [formData, setFormData] = useState<FormData>({
        displayName: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        birthday: '',
        avatarUrl: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            console.log('Starting profile fetch...');
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            console.log('Auth user:', user);
            console.log('Auth error:', authError);

            if (authError) {
                throw new Error(`Authentication error: ${authError.message}`);
            }

            if (!user) {
                throw new Error('No authenticated user found');
            }

            console.log('Fetching profile for user:', user.id);
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            
            console.log('Profile data:', data);
            console.log('Profile error:', profileError);

            if (profileError) {
                throw new Error(`Profile error: ${profileError.message}`);
            }

            if (data) {
                setFormData({
                    displayName: data.display_name || '',
                    email: user.email || '',
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    phoneNumber: data.phone_number || '',
                    birthday: data.birthday || '',
                    avatarUrl: data.avatar_url || ''
                });
            } else {
                setFormData({
                    displayName: '',
                    email: user.email || '',
                    firstName: '',
                    lastName: '',
                    phoneNumber: '',
                    birthday: '',
                    avatarUrl: ''
                });
            }
        } catch (error: any) {
            console.error('Detailed error information:', {
                error: error,
                message: error?.message,
                stack: error?.stack,
                name: error?.name,
                code: error?.code
            });
            setError(error?.message || 'Failed to load profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submission started');
        setIsLoading(true);
        setError('');
        
        // Validate fields
        let hasErrors = false;
        const newErrors = { ...formData };
        
        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required';
            hasErrors = true;
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        }
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            hasErrors = true;
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            hasErrors = true;
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
            hasErrors = true;
        }

        if (hasErrors) {
            setFormData(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            console.log('Making Square API request...');
            // search for square customer ID
            const squareResponse = await fetch('/api/searchSquareAccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
            });
            const squareData = await squareResponse.json();
            console.log('Square API response:', squareData);

            const { data: { user } } = await supabase.auth.getUser();
            console.log('Current user:', user);

            if (user) {
                console.log('Updating profile in Supabase...');
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        user_id: user.id,
                        display_name: formData.displayName,
                        email: formData.email,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        phone_number: formData.phoneNumber,
                        square_customer_id: squareData.customerId,
                        square_loyalty_id: squareData.loyaltyId,
                        updated_at: new Date()
                    }, {
                        onConflict: 'user_id'
                    });
                
                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }
                
                console.log('Profile updated successfully, redirecting...');
                router.push('/createAccount/PersonalInfo');
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

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhoneNumber = (phone: string) => {
        const re = /^\+?[\d\s-]{10,}$/;
        return re.test(phone);
    };

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        const formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6) + '-' + cleaned.slice(6);
        return formatted;
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
                    className={cn(
                        "mt-1 mb-2.5 transition-all duration-200",
                        formData.firstName ? "border-primary" : "border-red-500",
                        "text-white focus:border-primary"
                    )}
                    type="text" 
                    id="firstname" 
                    placeholder="" 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                    disabled={isLoading}
                    required 
                />
                <Label className="ml-2" htmlFor="lastname">Last Name</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${formData.lastName ? '' : 'border-red-500'}`}
                    type="text" 
                    id="lastname" 
                    placeholder="" 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                    disabled={isLoading}
                    required 
                />
                <Label className="ml-2" htmlFor="email">Email</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${formData.email ? '' : 'border-red-500'}`}
                    type="email" 
                    id="email" 
                    placeholder="" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Label className="ml-2" htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                    className={cn(
                        "mt-1 mb-2.5 transition-all duration-200",
                        formData.phoneNumber ? "border-primary" : "border-red-500",
                        "text-white focus:border-primary"
                    )}
                    type="tel" 
                    id="phoneNumber" 
                    placeholder="(555) 555-5555" 
                    value={formatPhoneNumber(formData.phoneNumber)} 
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} 
                    disabled={isLoading}
                    required 
                />
                <Label htmlFor="birthday">Birthday</Label>
                <Input 
                    className="mb-2.5 mt-1 text-white [&::-webkit-calendar-picker-indicator]:filter-primary [&::-webkit-calendar-picker-indicator]:order-first" 
                    style={{
                        '--tw-calendar-picker-indicator-filter': 'invert(77%) sepia(13%) saturate(1095%) hue-rotate(93deg) brightness(91%) contrast(87%)'
                    } as React.CSSProperties}
                    type="date" 
                    id="birthday" 
                    value={formData.birthday} 
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
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