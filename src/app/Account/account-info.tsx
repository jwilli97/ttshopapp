"use client";

import { useState, Dispatch, SetStateAction } from "react";
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
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";

interface AccountInfoProps {
  userData: UserData;
  section: 'personal' | 'delivery' | 'preferences';
  setUserData: Dispatch<SetStateAction<UserData | null>>;
}

export default function AccountInfo({ userData, section, setUserData }: AccountInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData> | null>(null);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No session found");
        return;
      }

      const updates = {
        street_address: editedData?.street_address || userData.street_address,
        address_line_2: editedData?.address_line_2 || userData.address_line_2,
        city: editedData?.city || userData.city,
        state: editedData?.state || userData.state,
        zipcode: editedData?.zipcode || userData.zipcode,
        residence_type: editedData?.residence_type || userData.residence_type,
        delivery_notes: editedData?.delivery_notes || userData.delivery_notes,
        display_name: editedData?.display_name || userData.display_name,
        avatar_url: editedData?.avatar_url || userData.avatar_url,
        strain_preference: editedData?.strain_preference || userData.strain_preference,
        replacement_preference: editedData?.replacement_preference || userData.replacement_preference,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update local state
      setUserData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates
        };
      });

      setIsEditing(false);
      setEditedData(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

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
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white rounded-lg">
                  Private Information
                </CardTitle>
                <p className="text-muted-foreground text-sm">Your personal contact details</p>
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
              <CardHeader className="space-y-1 flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white rounded-lg">
                      Display Information
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">How others see you</p>
                  </div>
                  {userData.membership_tier && (
                    <Badge variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white">
                      {userData.membership_tier}
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={() => isEditing ? handleSubmit() : handleEdit()}
                  variant={isEditing ? "default" : "outline"}
                  className="transition-all duration-200"
                >
                  {isEditing ? "Save Changes" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-6 mb-6">
                  {isEditing ? (
                    <AvatarSelectionModal
                      isOpen={isAvatarModalOpen}
                      onOpenChange={setIsAvatarModalOpen}
                      avatarUrl={editedData?.avatar_url || userData.avatar_url}
                      onAvatarSelect={handleAvatarSelect}
                      onClose={() => setIsAvatarModalOpen(false)}
                      avatars={predefinedAvatars}
                      onSelect={handleAvatarSelect}
                    />
                  ) : (
                    <Avatar className="h-32 w-32 mb-4 sm:mb-0 ring-2 ring-offset-4 ring-primary transition-all duration-200">
                      <AvatarImage src={userData.avatar_url} alt={userData.display_name} />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {userData.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="w-full space-y-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          name="display_name"
                          value={editedData?.display_name || ''}
                          onChange={handleInputChange}
                          className="max-w-md"
                        />
                      </div>
                    ) : (
                      <InfoField label="Display Name" value={userData.display_name} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'delivery':
        return (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white rounded-lg">
                  Delivery Details
                </CardTitle>
                <p className="text-muted-foreground text-sm">Your primary delivery address</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="street_address">Street Address</Label>
                        <Input
                          id="street_address"
                          name="street_address"
                          value={editedData?.street_address || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    ) : (
                      <InfoField label="Street Address" value={userData.street_address} />
                    )}
                  </div>
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="address_line_2">Address Line 2</Label>
                        <Input
                          id="address_line_2"
                          name="address_line_2"
                          value={editedData?.address_line_2 || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={editedData?.city || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={editedData?.state || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipcode">Zip Code</Label>
                        <Input
                          id="zipcode"
                          name="zipcode"
                          value={editedData?.zipcode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoField label="Address Line 2" value={userData.address_line_2} />
                      <InfoField label="City" value={userData.city} />
                      <InfoField label="State" value={userData.state} />
                      <InfoField label="Zip Code" value={userData.zipcode} />
                    </>
                  )}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="residence_type">Residence Type</Label>
                        <Select
                          name="residence_type"
                          value={editedData?.residence_type || ''}
                          onValueChange={(value) => 
                            setEditedData(prev => ({
                              ...(prev || userData),
                              residence_type: value
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select residence type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <InfoField 
                        label="Residence Type" 
                        value={userData.residence_type ? 
                          userData.residence_type.charAt(0).toUpperCase() + userData.residence_type.slice(1) : null} 
                      />
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="delivery_notes">Delivery Notes</Label>
                        <Input
                          id="delivery_notes"
                          name="delivery_notes"
                          value={editedData?.delivery_notes || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    ) : (
                      <InfoField label="Delivery Notes" value={userData.delivery_notes} />
                    )}
                  </div>
                </div>
                <div className="pt-4 flex">
                  <Button 
                    onClick={() => isEditing ? handleSubmit() : handleEdit()}
                    variant={isEditing ? "default" : "outline"}
                    className="transition-all duration-200 w-full hover:bg-background"
                  >
                    {isEditing ? "Save Changes" : "Edit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-white rounded-lg">
                    Order Preferences
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">Tell us your preferences</p>
                </div>
                <Button 
                  onClick={() => isEditing ? handleSubmit() : handleEdit()}
                  variant={isEditing ? "default" : "outline"}
                  className="transition-all duration-200"
                >
                  {isEditing ? "Save Changes" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="strain_preference">Strain Preference</Label>
                      <Select
                        name="strain_preference"
                        value={editedData?.strain_preference || ''}
                        onValueChange={(value) => 
                          setEditedData(prev => ({
                            ...(prev || userData),
                            strain_preference: value
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select strain preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indica">Indica</SelectItem>
                          <SelectItem value="sativa">Sativa</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="replacement_preference">Replacement Preference</Label>
                      <Select
                        name="replacement_preference"
                        value={editedData?.replacement_preference || ''}
                        onValueChange={(value) => 
                          setEditedData(prev => ({
                            ...(prev || userData),
                            replacement_preference: value
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select replacement preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contact">Contact Me First</SelectItem>
                          <SelectItem value="similar">Similar Product</SelectItem>
                          <SelectItem value="refund">No Replacement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoField 
                      label="Strain Preference" 
                      value={userData.strain_preference ? 
                        userData.strain_preference.charAt(0).toUpperCase() + userData.strain_preference.slice(1) : null} 
                    />
                    <InfoField 
                      label="Replacement Preference" 
                      value={userData.replacement_preference === 'similar' ? 'Similar Product' :
                             userData.replacement_preference === 'contact' ? 'Contact Me First' :
                             userData.replacement_preference === 'refund' ? 'No Replacement' : null} 
                    />
                  </>
                )}

                <div className="space-y-2">
                  <Label>Usual Order</Label>
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
                        <DialogTitle>My Usual</DialogTitle>
                        {/* <DialogDescription>
                          Example order:
                        </DialogDescription> */}
                      </DialogHeader>
                      <div className="py-4">
                        {userData.usual_order ? (
                          <>
                            <p>{userData.usual_order}</p>
                            <p>Total: ${userData.usual_total}</p>
                          </>
                        ) : (
                          <>
                            <p><strong>Example Order:</strong></p>
                            <p>7g Designer Sativa</p>
                            <p>2 Sativa Pens</p>
                            <p>Total: $150</p>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-muted-foreground text-sm">
                  <p>Please contact us to make changes to your usual order</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderSection()}
    </div>
  );
}