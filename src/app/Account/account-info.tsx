"use client";

import { useState } from "react";
import type { UserData } from "@/app/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatPhoneNumber } from "@/lib/utils";
import AvatarSelectionModal from "@/components/AvatarSelectionModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface AccountInfoProps {
  userData: UserData;
  section: 'personal' | 'delivery' | 'preferences';
}

export default function AccountInfo({ userData, section }: AccountInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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

  const strainOptions = [
    { value: 'indica', label: 'Indica' },
    { value: 'sativa', label: 'Sativa' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const replacementOptions = [
    { value: 'similar', label: 'Similar Product' },
    { value: 'contact', label: 'Contact Me First' },
    { value: 'refund', label: 'Refund' },
  ];

  if (!userData) {
    return <div>Loading...</div>;
  }

  // Initialize editedData when entering edit mode
  const handleEdit = () => {
    setEditedData({
      ...userData,
      phone_number: formatPhoneNumber(userData.phone_number || '')
    });
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Apply phone number formatting if it's the phone field
    const formattedValue = name === 'phone_number' ? formatPhoneNumber(value) : value;
    
    setEditedData(prev => ({
      ...(prev || userData),
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement update logic with Supabase
    console.log("Updated data:", editedData)
    setIsEditing(false)
  }

  const handleAvatarSelect = (avatarUrl: string) => {
    setEditedData(prev => ({
      ...(prev || userData),
      avatar_url: avatarUrl
    }));
  };

  // Helper function to render a field with better styling
  const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="text-base font-medium">{value || 'Not provided'}</div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'personal':
        return (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white bg-primary p-2 rounded-lg">
                  Private Information
                </CardTitle>
                <p className="text-muted-foreground text-sm ml-4">Your personal contact details</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField label="First Name" value={userData.first_name} />
                  <InfoField label="Last Name" value={userData.last_name} />
                  <InfoField label="Email" value={userData.email} />
                  <InfoField 
                    label="Phone Number" 
                    value={userData.phone_number ? formatPhoneNumber(userData.phone_number) : null} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white bg-primary p-2 rounded-lg">
                  Display Information
                </CardTitle>
                <p className="text-muted-foreground text-sm ml-4">How others see you</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-6 mb-6">
                  <Avatar className="h-32 w-32 mb-4 sm:mb-0 ring-2 ring-offset-4 ring-primary transition-all duration-200">
                    <AvatarImage src={userData.avatar_url} alt={userData.display_name} />
                    <AvatarFallback className="bg-primary text-white text-2xl">
                      {userData.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full">
                    <InfoField label="Display Name" value={userData.display_name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'delivery':
        return (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white bg-primary p-2 rounded-lg">
                  Delivery Details
                </CardTitle>
                <p className="text-muted-foreground text-sm ml-4">Your primary delivery address</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <InfoField label="Street Address" value={userData.street_address} />
                  </div>
                  <div className="col-span-2">
                    <InfoField label="Residence Type" value={userData.residence_type} />
                  </div>
                  <InfoField label="Address Line 2" value={userData.address_line_2} />
                  <InfoField label="City" value={userData.city} />
                  <InfoField label="State" value={userData.state} />
                  <InfoField label="Zip Code" value={userData.zipcode} />
                  <div className="col-span-2">
                    <InfoField label="Delivery Notes" value={userData.delivery_notes} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white bg-primary p-2 rounded-lg">
                  Order Preferences
                </CardTitle>
                <p className="text-muted-foreground text-sm ml-4">Tell us your preferences</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <InfoField 
                  label="Strain Preference" 
                  value={userData.strain_preference ? 
                    userData.strain_preference.charAt(0).toUpperCase() + userData.strain_preference.slice(1) : null} 
                />
                <InfoField 
                  label="Replacement Preference" 
                  value={userData.replacement_preference === 'similar' ? 'Similar Product' :
                         userData.replacement_preference === 'contact' ? 'Contact Me First' :
                         userData.replacement_preference === 'refund' ? 'Refund' : null} 
                />

                <div className="space-y-2">
                  <Label>Care Package Settings</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full transition-all duration-200 hover:bg-primary hover:text-white"
                      >
                        My Usual Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </DialogClose>
                      <DialogHeader>
                        <DialogTitle>Usual Order</DialogTitle>
                        <DialogDescription>
                          Example order:
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p>14g of Designer Sativa</p>
                        <p>2 Sativa Pens</p>
                        <p>3 Packs of Stiizy Gummies</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderSection()}
    </div>
  );
}