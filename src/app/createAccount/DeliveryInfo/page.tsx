'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import BackButton from "@/components/backButton";

export default function DeliveryInfo() {

    const [displayName, setDisplayName] = useState('');
    const [residenceType, setResidenceType] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        streetAddress: '',
        city: '',
        zipCode: '',
        residenceType: '',
        deliveryMethod: '',
    });
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
                    .maybeSingle();
                
                if (error) throw error;
    
                if (data) {
                    setDisplayName(data.display_name);
                    setAvatarUrl(data.avatar_url);
                    setResidenceType(data.residence_type || '');
                    setStreetAddress(data.street_address || '');
                    setAddressLine2(data.address_line_2 || '');
                    setCity(data.city || '');
                    setState(data.state || '');
                    setZipCode(data.zipcode || '');
                    setDeliveryMethod(data.delivery_method || '');
                    setDeliveryNotes(data.delivery_notes || '');
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
        setIsLoading(true);
        setError('');

        setFieldErrors({
            streetAddress: '',
            city: '',
            zipCode: '',
            residenceType: '',
            deliveryMethod: '',
        });

        let hasErrors = false;
        const newErrors = { ...fieldErrors };

        if (!streetAddress.trim()) {
            newErrors.streetAddress = 'Street address is required';
            hasErrors = true;
        }
        if (!city.trim()) {
            newErrors.city = 'City is required';
            hasErrors = true;
        }
        if (!zipCode.trim()) {
            newErrors.zipCode = 'Zip code is required';
            hasErrors = true;
        }
        if (!residenceType) {
            newErrors.residenceType = 'Please select a residence type';
            hasErrors = true;
        }
        if (!deliveryMethod) {
            newErrors.deliveryMethod = 'Please select a delivery method';
            hasErrors = true;
        }

        if (hasErrors) {
            setFieldErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        residence_type: residenceType,
                        street_address: streetAddress,
                        address_line_2: addressLine2,
                        city: city,
                        state: state,
                        zipcode: zipCode,
                        delivery_method: deliveryMethod,
                        delivery_notes: deliveryNotes,
                        updated_at: new Date()
                    }, {
                        onConflict: 'user_id'
                    });
                
                if (error) throw error;
                
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen flex-col items-center mt-8 mb-32">
            <BackButton />
            <div className="flex flex-col items-center">
                <h1 className="text-4xl text-white font-semibold mb-2">Create Your Profile</h1>
                <p className="text-white text-lg">Step 3 of 3</p>
            </div>
            <div className="container bg-[#cbd5e1] h-0.5 w-full mt-4 md:w-11/12 rounded-full"></div>
            <form onSubmit={handleSubmit} className="w-80 text-white mt-4">
                <p className="text-xl font-semibold mb-2">Delivery</p>
                <Label className="ml-2" htmlFor="streetAddress">Street Address</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${fieldErrors.streetAddress ? 'border-red-500' : ''}`}
                    type="text" 
                    id="streetAddress" 
                    placeholder="" 
                    value={streetAddress} 
                    onChange={(e) => setStreetAddress(e.target.value)} 
                    disabled={isLoading}
                    required 
                />
                {fieldErrors.streetAddress && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.streetAddress}</p>
                )}
                <Label className="ml-2" htmlFor="addressLine2">Address Line 2</Label>
                <Input className="mt-1 mb-2.5" type="text" id="addressLine2" placeholder="" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="city">City</Label>
                <Input 
                    className={`mt-1 mb-2.5 ${fieldErrors.city ? 'border-red-500' : ''}`}
                    type="text" 
                    id="city" 
                    placeholder="" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    disabled={isLoading}
                    required 
                />
                {fieldErrors.city && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.city}</p>
                )}
                <div className="flex flex-row">
                    <div className="w-2/5">
                        <Label className="ml-2" htmlFor="state">State</Label>
                        <Input 
                            className="mt-1 mb-2.5"
                            type="text" 
                            id="state" 
                            placeholder="" 
                            value={state} 
                            onChange={(e) => setState(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="w-3/5 ml-4">
                        <Label className="ml-2" htmlFor="zipcode">Zipcode</Label>
                        <Input 
                            className={`mt-1 mb-2.5 ${fieldErrors.zipCode ? 'border-red-500' : ''}`}
                            type="text" 
                            id="zipcode" 
                            placeholder="" 
                            value={zipCode} 
                            onChange={(e) => setZipCode(e.target.value)} 
                            disabled={isLoading}
                            required 
                        />
                        {fieldErrors.zipCode && (
                            <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.zipCode}</p>
                        )}
                    </div>
                </div>
                <p className="mt-4 mb-2">Residence Type</p>
                <RadioGroup 
                    defaultValue="apartment"
                    onValueChange={(value) => setResidenceType(value)}
                    className={fieldErrors.residenceType ? 'border-red-500 rounded p-2' : ''}
                >
                    <div className="flex items-center space-x-1.5">
                        <RadioGroupItem className="bg-white" value="house" id="r1" />
                        <Label htmlFor="r1">House/Townhouse</Label>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <RadioGroupItem className="bg-white" value="apartment" id="r2" />
                        <Label htmlFor="r2">Apartment/Highrise</Label>
                    </div>
                </RadioGroup>
                {fieldErrors.residenceType && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.residenceType}</p>
                )}
                <p className="mt-4 mb-2">Delivery Method</p>
                <RadioGroup 
                    className={`mb-4 ${fieldErrors.deliveryMethod ? 'border-red-500 rounded p-2' : ''}`} 
                    defaultValue="handoff"
                    onValueChange={(value) => setDeliveryMethod(value)}
                >
                    <div className="flex flex-row justify-between">
                        <div className="flex items-center space-x-1.5">
                            <RadioGroupItem className="bg-white" value="contactless" id="r3" />
                            <Label htmlFor="r3">Contactless</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <RadioGroupItem className="bg-white" value="handoff" id="r4" />
                            <Label htmlFor="r4">Handoff</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <RadioGroupItem className="bg-white" value="pickup" id="r5" />
                            <Label htmlFor="r5">Pickup</Label>
                        </div>
                    </div>
                </RadioGroup>
                {fieldErrors.deliveryMethod && (
                    <p className="text-red-500 text-sm mt-1 mb-2">{fieldErrors.deliveryMethod}</p>
                )}
                <p className="mt-4 mb-2">Delivery Notes</p>
                <Textarea 
                    className="mt-1 mb-2.5 placeholder:text-gray-300"
                    id="deliveryNotes" 
                    placeholder="Gate Code, etc." 
                    value={deliveryNotes} 
                    onChange={(e) => setDeliveryNotes(e.target.value)} 
                    disabled={isLoading} 
                />
                {error && <p className="text-accent mt-2">{error}</p>}
                <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="bg-primary text-white text-lg hover:bg-primary/75 w-full md:w-72 h-11 shadow-lg" type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Finish'}
                    </Button>
                </div>
            </form>
        </div>
    );
}