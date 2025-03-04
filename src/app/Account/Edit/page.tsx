'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import HomeButton from "@/components/HomeButton";
import LogOutButton from "@/components/logoutButton";
import AvatarSelectionModal from "@/components/AvatarSelectionModal";
import { supabase } from "@/lib/supabaseClient";

export default function EditProfile() {

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [residenceType, setResidenceType] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
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
                    .single();
                
                if (error) throw error;
    
                if (data) {
                    setDisplayName(data.display_name as string || '');
                    setEmail(data.email as string || '');
                    setFirstName(data.first_name as string || '');
                    setLastName(data.last_name as string || '');
                    setPhoneNumber(data.phone_number as string || '');
                    setResidenceType(data.residence_type as string || '');
                    setStreetAddress(data.street_address as string || '');
                    setCity(data.city as string || '');
                    setState(data.state as string || '');
                    setZipCode(data.zipcode as string || '');
                    setAvatarUrl(data.avatar_url as string || '');
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
                        residence_type: residenceType,
                        street_address: streetAddress,
                        city: city,
                        state: state,
                        zipcode: zipCode,
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
                
                router.push('/Account');
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

      const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarUrl(avatarUrl);
      };

    return (
        <ProtectedRoute>
        <div className="flex h-screen flex-col items-center mb-32">
            <div className="flex flex-col items-center">
                <AvatarSelectionModal 
                    avatarUrl={avatarUrl}
                    onAvatarSelect={handleAvatarSelect}
                    onSelect={handleAvatarSelect}
                    onClose={() => setIsAvatarModalOpen(false)}
                    onOpenChange={setIsAvatarModalOpen}
                    isOpen={isAvatarModalOpen}
                    avatars={predefinedAvatars}
                />
                <p className="text-3xl font-semibold mt-2 mb-1 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{displayName}</p>
                {/* <Badge className="bg-accent text-primary hover:text-accent hover:cursor-pointer">Membership Tier</Badge> */}
            </div>
            <div className="container bg-[#cbd5e1] h-0.5 w-full mt-4 md:w-11/12 rounded-full"></div>
            <form onSubmit={handleSubmit} className="w-80 text-white mt-4">
                <Label className="ml-2" htmlFor="displayname">Display Name</Label>
                <Input className="mt-1 mb-2.5" type="text" id="displayname" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="email">Email</Label>
                <Input className="mt-1 mb-2.5" type="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="firstname">First Name</Label>
                <Input className="mt-1 mb-2.5" type="text" id="firstname" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="lastname">Last Name</Label>
                <Input className="mt-1 mb-2.5" type="text" id="lastname" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="phoneNumber">Phone Number</Label>
                <Input className="mt-1 mb-2.5" type="tel" id="phoneNumber" placeholder="512-459-2222" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="residenceType">Residence Type</Label>
                <Input className="mt-1 mb-2.5" type="text" id="residenceType" placeholder="Enter residence type" value={residenceType} onChange={(e) => setResidenceType(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="streetAddress">Street Address</Label>
                <Input className="mt-1 mb-2.5" type="text" id="streetAddress" placeholder="8467 Main Street" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="city">City</Label>
                <Input className="mt-1 mb-2.5" type="text" id="city" placeholder="Houston" value={city} onChange={(e) => setCity(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="state">State</Label>
                <Input className="mt-1 mb-2.5" type="text" id="state" placeholder="TX" value={state} onChange={(e) => setState(e.target.value)} disabled={isLoading} />
                <Label className="ml-2" htmlFor="zipCode">Zip Code</Label>
                <Input className="mt-1 mb-2.5" type="text" id="zipCode" placeholder="12345" value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={isLoading} />
                {error && <p className="text-accent mt-2">{error}</p>}
                <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="bg-primary hover:bg-primary/75 w-full md:w-72 h-11 shadow-lg" type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Continue'}
                    </Button>
                </div>
            </form>
        </div>
        </ProtectedRoute>
    );
}