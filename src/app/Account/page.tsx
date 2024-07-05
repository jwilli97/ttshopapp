'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <ProtectedRoute>
            <div className="flex h-screen w-full flex-col items-center px-4 py-6 relative">
                <div className="flex flex-row items-center w-full justify-between">
                    <HomeButton />
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
                <div className="w-96">
                    <Tabs defaultValue="Display" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2 text-primary">
                            <TabsTrigger value="Display">Display</TabsTrigger>
                            <TabsTrigger value="Personal">Personal</TabsTrigger>
                        </TabsList>
                        <TabsContent value="Display">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Display Info</CardTitle>
                                    <CardDescription className="font-light">Does there need to be anything here?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <Label htmlFor="displayname" className="font-light">Display Name</Label>
                                        <p className="text-lg font-semibold">{displayName}</p>
                                    </div>
                                    <div>
                                        <Label className="font-light">Membership Tier</Label>
                                        <p className="text-lg text-accent font-semibold">Chronic</p>
                                    </div>
                                    <div>
                                        <Label className="font-light">Favorite Strain Type</Label>
                                        <Select>
                                            <SelectTrigger className="w-48 mt-2">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="Indica">Indica</SelectItem>
                                                    <SelectItem value="Sativa">Sativa</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="Personal">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Info</CardTitle>
                                    <CardDescription>What should go here?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
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
                                    <div>
                                        <Label htmlFor="address" className="font-light">Address</Label>
                                        <p className="text-lg font-semibold">{address}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                    <Button className="bg-primary hover:bg-primary/75 w-72 h-11 mt-6" onClick={() => router.push('/Account/Edit')}>
                        Edit Profile
                    </Button>
                </div>
            </div>
        </ProtectedRoute>
    );
}