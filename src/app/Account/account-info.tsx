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
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={isEditing ? (editedData?.first_name || userData.first_name || '') : (userData.first_name || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={isEditing ? (editedData?.last_name || userData.last_name || '') : (userData.last_name || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={userData.email}
                      readOnly
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      placeholder="(555) 555-5555"
                      value={isEditing 
                        ? (editedData?.phone_number || '') 
                        : formatPhoneNumber(userData.phone_number || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
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
                  {isEditing ? (
                    <AvatarSelectionModal 
                      avatarUrl={editedData?.avatar_url || userData.avatar_url}
                      onAvatarSelect={handleAvatarSelect}
                      onSelect={handleAvatarSelect}
                      onClose={() => setIsAvatarModalOpen(false)}
                      onOpenChange={setIsAvatarModalOpen}
                      isOpen={isAvatarModalOpen}
                      avatars={predefinedAvatars}
                    />
                  ) : (
                    <Avatar className="h-32 w-32 mb-4 sm:mb-0 ring-2 ring-offset-4 ring-primary transition-all duration-200">
                      <AvatarImage src={userData.avatar_url} alt={userData.display_name} />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {userData.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="w-full space-y-2">
                    <Label htmlFor="display_name" className="text-sm font-medium">Display Name</Label>
                    <Input
                      id="display_name"
                      name="display_name"
                      value={isEditing ? (editedData?.display_name || userData.display_name || '') : (userData.display_name || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="residence_type" className="text-sm font-medium">Residence Type</Label>
                  <Input
                    id="residence_type"
                    name="residence_type"
                    value={isEditing ? (editedData?.residence_type || userData.residence_type || '') : (userData.residence_type || '')}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={cn(
                      "transition-all duration-200",
                      !isEditing && "bg-muted border-none text-black",
                      isEditing && "border-2 focus:border-primary text-white"
                    )}
                  />
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
                <p className="text-muted-foreground text-sm ml-4">Where we'll deliver your orders</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="street_address" className="text-sm font-medium">Street Address</Label>
                    <Input
                      id="street_address"
                      name="street_address"
                      value={isEditing ? (editedData?.street_address || userData.street_address || '') : (userData.street_address || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line_2" className="text-sm font-medium">Address Line 2</Label>
                    <Input
                      id="address_line_2"
                      name="address_line_2"
                      value={isEditing ? (editedData?.address_line_2 || userData.address_line_2 || '') : (userData.address_line_2 || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={isEditing ? (editedData?.city || userData.city || '') : (userData.city || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={isEditing ? (editedData?.state || userData.state || '') : (userData.state || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipcode" className="text-sm font-medium">Zip Code</Label>
                    <Input
                      id="zipcode"
                      name="zipcode"
                      value={isEditing ? (editedData?.zipcode || userData.zipcode || '') : (userData.zipcode || '')}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={cn(
                        "transition-all duration-200",
                        !isEditing && "bg-muted border-none text-black",
                        isEditing && "border-2 focus:border-primary text-white"
                      )}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="delivery_notes" className="text-sm font-medium">Delivery Notes</Label>
                  <Input
                    id="delivery_notes"
                    name="delivery_notes"
                    value={isEditing ? (editedData?.delivery_notes || userData.delivery_notes || '') : (userData.delivery_notes || '')}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={cn(
                      "transition-all duration-200",
                      !isEditing && "bg-muted border-none text-black",
                      isEditing && "border-2 focus:border-primary text-white"
                    )}
                  />
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
                <p className="text-muted-foreground text-sm ml-4">Customize your ordering experience</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="strain-preference">Strain Preference</Label>
                  <Select
                    disabled={!isEditing}
                    value={editedData?.strain_preference || userData.strain_preference}
                    onValueChange={(value) => 
                      setEditedData(prev => ({
                        ...(prev || userData),
                        strain_preference: value
                      }))
                    }
                  >
                    <SelectTrigger className={cn(
                      "w-full transition-all duration-200",
                      !isEditing && "bg-muted border-none text-black",
                      isEditing && "border-2 focus:border-primary text-white"
                    )}>
                      <SelectValue placeholder="Select preferred strain type" />
                    </SelectTrigger>
                    <SelectContent>
                      {strainOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replacement-preference">Replacement Preference</Label>
                  <Select
                    disabled={!isEditing}
                    value={editedData?.replacement_preference || userData.replacement_preference}
                    onValueChange={(value) =>
                      setEditedData(prev => ({
                        ...(prev || userData),
                        replacement_preference: value
                      }))
                    }
                  >
                    <SelectTrigger className={cn(
                      "w-full transition-all duration-200",
                      !isEditing && "bg-muted border-none text-black",
                      isEditing && "border-2 focus:border-primary text-white"
                    )}>
                      <SelectValue placeholder="Select replacement preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {replacementOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Care Package Settings</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full transition-all duration-200 hover:bg-primary hover:text-white",
                          !isEditing && "bg-muted border-none text-black",
                          isEditing && "border-2 focus:border-primary text-white"
                        )}
                      >
                        Configure Care Package
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70  transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </DialogClose>
                      <DialogHeader>
                        <DialogTitle>Care Package Preferences</DialogTitle>
                        <DialogDescription>
                          Configure your care package preferences. This will be used when we prepare special packages for you.
                        </DialogDescription>
                      </DialogHeader>
                      {/* Add care package configuration options here */}
                      <div className="py-4">
                        <p>Care package configuration coming soon...</p>
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
      <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleEdit} 
            className="w-full sm:w-auto"
          >
            Edit Information
          </Button>
        )}
      </div>
    </div>
  );
}