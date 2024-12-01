'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import HomeButton from "@/components/HomeButton";
import LogOutButton from "@/components/logoutButton";

export default function Account() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
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
                    setStreetAddress(data.street_address || '');
                    setCity(data.city || '');
                    setState(data.state || '');
                    setZipCode(data.zipcode || '');
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
        <ProtectedRoute>
            <div className="flex h-screen w-full flex-col items-center text-white px-4 py-6 relative">
                <div className="flex flex-row items-center w-full justify-between">
                    <HomeButton />
                    <LogOutButton />
                </div>
                <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarUrl || "profile_pics/profileNug7.png"} alt="Profile Picture" />
                    <AvatarFallback className="text-xl md:text-2xl">TT</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-3xl font-semibold mt-2 mb-1 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{displayName}</p>
                </div>
                {/* <Badge className="bg-accent text-primary hover:text-accent hover:cursor-pointer">Membership Tier</Badge> */}
                <div className="w-96">
                    <Tabs defaultValue="Personal" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3 text-primary">
                            <TabsTrigger value="Personal">Personal</TabsTrigger>
                            <TabsTrigger value="Delivery">Delivery</TabsTrigger>
                            <TabsTrigger value="Preferences">Preferences</TabsTrigger>
                        </TabsList>
                        <TabsContent value="Personal">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-white">Account Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <Label htmlFor="displayname" className="font-light text-white">Display Name</Label>
                                        <p className="text-xl font-semibold mb-1 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{displayName}</p>
                                    </div>
                                    <div>
                                        <Label className="font-light text-white">Membership Tier</Label>
                                        <p className="text-lg text-accent font-semibold">Coming Soon!</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="name" className="font-light">Name</Label>
                                        <p className="text-lg font-semibold">{firstName} {lastName}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="font-light">Email</Label>
                                        <p className="text-lg font-semibold">{email}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber" className="font-light">Phone Number</Label>
                                        <p className="text-lg font-semibold">{phoneNumber}</p>
                                    </div>
                                    
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="Delivery">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-white">Primary Address</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-white">
                                    <div>
                                        <Label htmlFor="streetAddress" className="font-light">Street Address</Label>
                                        <p className="text-lg font-semibold">{streetAddress}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="addressLine2" className="font-light">Address Line 2</Label>
                                        <p className="text-lg font-semibold">Address Line 2</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="city" className="font-light">City</Label>
                                        <p className="text-lg font-semibold">{city}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="state" className="font-light">State</Label>
                                        <p className="text-lg font-semibold">{state}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="zipCode" className="font-light">Zip Code</Label>
                                        <p className="text-lg font-semibold">{zipCode}</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="residence" className="font-light">Residence Type</Label>
                                        <p className="text-lg font-semibold">Residence Type</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="deliveryMethod" className="font-light">Delivery Method</Label>
                                        <p className="text-lg font-semibold">Delivery Method</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="deliveryInstructions" className="font-light">Delivery Instructions</Label>
                                        <p className="text-lg font-semibold">Delivery Instructions</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="Preferences">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-white">Preferences</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-white">
                                <div>
                                    <Label className="font-light text-white">Favorite Strain Type</Label>
                                        <Select>
                                            <SelectTrigger className="w-48 mt-2 text-white">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup className="text-white">
                                                    <SelectItem value="Indica">Indica</SelectItem>
                                                    <SelectItem value="Sativa">Sativa</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="font-light text-white">Replacement Preference</Label>
                                        <Select>
                                            <SelectTrigger className="w-48 mt-2 text-white">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup className="text-white">
                                                    <SelectItem value="contactMe">Contact Me</SelectItem>
                                                    <SelectItem value="useAbove">Use Above</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="bg-primary hover:bg-primary/75 w-96 h-11 mt-6" onClick={() => router.push('/Account/Edit')}>
                        Edit Profile
                    </Button>
                </div>
            </div>
        </ProtectedRoute>
    );
};