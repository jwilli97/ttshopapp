"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import BottomNav from "@/components/BottomNav";
import LogOutButton from "@/components/logoutButton";
import { ChevronRight, ChevronLeft, Coins, X } from "lucide-react";
import { useUser } from '@supabase/auth-helpers-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import Intercom from '@intercom/messenger-js-sdk';
import { Checkbox } from "@/components/ui/checkbox";

interface OrderDetails {
  item: string;
  tokenRedemption: string;
  phoneNumber: string;
  deliveryResidenceType: string;
  deliveryStreetAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipcode: string;
  deliveryMethod: string;
  deliveryNotes: string;
  paymentMethod: string;
  cashDetails?: string;
  total: number | null;
}

interface TinyTokenShopItem {
  id: number;
  name: string;
  cost: number;
}

const tokenShopItems: TinyTokenShopItem[] = [
  { id: 1, name: 'Holiday Joint', cost: 2 },
  { id: 2, name: 'Top Shelf Eighth', cost: 7 },
  { id: 3, name: 'Moonrock Blunt', cost: 8 },
  { id: 4, name: '5 Pack Infused Joints', cost: 12 },
  { id: 5, name: 'Kurvana Pen', cost: 15 },
  { id: 6, name: 'Stizzy Battery/Pod Set', cost: 18 },
  { id: 7, name: 'Sampler Pack', cost: 21 },
]

const formatPhoneNumber = (phoneNumber: string) => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the number has exactly 10 digits
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phoneNumber;
};

export default function NewOrder() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>('Loading...');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [residenceType, setResidenceType] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('Loading...');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('Loading...');
  const [state, setState] = useState<string>('Loading...');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    item: '',
    tokenRedemption: '',
    phoneNumber: '',
    deliveryResidenceType: '',
    deliveryStreetAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZipcode: '',
    deliveryMethod: '',
    deliveryNotes: '',
    paymentMethod: '',
    cashDetails: '',
    total: null,
  })
  const [zipcode, setZipcode] = useState('');
  const [showTokenShop, setShowTokenShop] = useState(false);
  const user = useUser();
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
    residenceType: '',
    saveAsDefault: false
  });
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [preferredDeliveryMethod, setPreferredDeliveryMethod] = useState<string>('Handoff');

  const steps = [
    {
      id: 'item',
      title: "What would you like to order?",
      content: (
        <div>
          <Textarea
            className="bg-gray-200 text-black"
            placeholder="Enter the items you want to order..."
            value={orderDetails.item}
            onChange={(e) => setOrderDetails({ ...orderDetails, item: e.target.value })}
            rows={3}
          />
        </div>
      ),
      nextStep: () => 'deliveryAndConfirmation',
    },
    {
      id: 'deliveryAndConfirmation',
      title: "Review & Confirm Order",
      content: (
        <div className="space-y-6">
          {/* Order Items */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-100">
            <h3 className="font-bold mb-2">Order Items</h3>
            <p>{orderDetails.item}</p>
            {orderDetails.tokenRedemption && (
              <p className="mt-2">
                <span className="font-semibold">Token Redemption: </span>
                {orderDetails.tokenRedemption}
              </p>
            )}
          </div>

          {/* Delivery Information */}
          <div>
            <h3 className="font-bold mb-2">Delivery Address</h3>
            <p>{orderDetails.deliveryStreetAddress}, {orderDetails.deliveryCity}, {orderDetails.deliveryState} {orderDetails.deliveryZipcode}</p>
            <p className="mt-1"><span className="font-semibold">Residence Type: </span>{orderDetails.deliveryResidenceType}</p>
            <p className="mt-1"><span className="font-semibold">Delivery Method: </span>{orderDetails.deliveryMethod}</p>
            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="mt-2 text-primary">
                  Edit Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-white">Enter New Delivery Address</DialogTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 rounded-sm"
                    onClick={() => setShowAddressDialog(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <Input 
                    type="text" 
                    placeholder="Street Address" 
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                  <Input 
                    type="text" 
                    placeholder="Address Line 2" 
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                  <div className="flex flex-row gap-2">
                    <Input 
                      type="text" 
                      placeholder="City" 
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <Input 
                      type="text" 
                      placeholder="State" 
                      onChange={(e) => setState(e.target.value)}
                    />
                    <Input 
                      type="text" 
                      placeholder="ZIP Code" 
                      onChange={(e) => setZipcode(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 text-white">
                    <Label>Residence Type</Label>
                    <RadioGroup 
                      defaultValue={residenceType}
                      onValueChange={(value) => setResidenceType(value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="House" id="house" />
                        <Label htmlFor="house">House/Townhouse</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Apartment" id="apartment" />
                        <Label htmlFor="apartment">Apartment/Highrise</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex mt-2 gap-2 justify-between">
                    <Button 
                      className="text-primary border-primary"
                      variant="outline"
                      onClick={async () => {
                        // Update only the current order details
                        setOrderDetails(prev => ({
                          ...prev,
                          deliveryStreetAddress: streetAddress,
                          deliveryCity: city,
                          deliveryState: state,
                          deliveryZipcode: zipcode,
                          deliveryResidenceType: residenceType
                        }));
                        setShowAddressDialog(false);
                      }}
                    >
                      Use Once
                    </Button>
                    <Button 
                      onClick={async () => {
                        try {
                          // Update both order details and user profile in Supabase
                          const { error } = await supabase
                            .from('profiles')
                            .update({
                              street_address: streetAddress,
                              city: city,
                              state: state,
                              zipcode: zipcode,
                              residence_type: residenceType
                            })
                            .eq('user_id', userId);

                          if (error) throw error;

                          setOrderDetails(prev => ({
                            ...prev,
                            deliveryStreetAddress: streetAddress,
                            deliveryCity: city,
                            deliveryState: state,
                            deliveryZipcode: zipcode,
                            deliveryResidenceType: residenceType
                          }));

                          // Update local state
                          setStreetAddress(streetAddress);
                          setCity(city);
                          setState(state);
                          setZipcode(zipcode);
                          setResidenceType(residenceType);

                          setShowAddressDialog(false);
                          alert('Default address updated successfully!');
                        } catch (error) {
                          console.error('Error updating default address:', error);
                          alert('Failed to update default address. Please try again.');
                        }
                      }}
                    >
                      Set as Default
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Delivery Method */}
          <div>
            
          </div>

          {/* Estimated Time */}
          <div>
            <p className="font-bold text-gray-500">Estimated Time Frame: 7:30pm - 9:30pm</p>
          </div>

          {/* Phone Number */}
          <div>
            <h3 className="font-bold mb-2">Phone Number</h3>
            <p>{formatPhoneNumber(orderDetails.phoneNumber)}</p>
          </div>

          {/* Total and Payment */}
          <div>
            <h3 className="font-bold mb-2">Total</h3>
            <p className="text-xl mb-4">{orderDetails.total === null ? 'Pending' : `$${orderDetails.total}`}</p>
            
            <h3 className="font-bold mb-2">Payment Method</h3>
            <RadioGroup 
              defaultValue={orderDetails.paymentMethod} 
              onValueChange={(value) => setOrderDetails({ ...orderDetails, paymentMethod: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Venmo" id="p1" />
                <Label htmlFor="p1">Venmo</Label>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Cash" id="p2" />
                  <Label htmlFor="p2">Cash</Label>
                </div>
                {orderDetails.deliveryMethod === 'Contactless' && orderDetails.paymentMethod === 'Cash' && (
                  <Textarea
                    className="bg-white text-black"
                    placeholder="Please specify where you will leave the cash and if you need change..."
                    value={orderDetails.cashDetails || ''}
                    onChange={(e) => setOrderDetails({ ...orderDetails, cashDetails: e.target.value })}
                    rows={2}
                  />
                )}
              </div>
            </RadioGroup>
            {orderDetails.deliveryMethod === 'Contactless' && orderDetails.paymentMethod === 'Venmo' && (
              <p className="text-red-500 text-sm mt-4">Prepayment required for Venmo & contactless delivery</p>
            )}
          </div>
        </div>
      ),
      nextStep: () => null,
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    const nextStepId = currentStep.nextStep();
    const nextStepIndex = steps.findIndex(step => step.id === nextStepId);
    if (nextStepIndex !== -1) {
      setCurrentStepIndex(nextStepIndex);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const menuResponse = await fetch('/api/getMenuUrl');
        if (!menuResponse.ok) {
            throw new Error(`HTTP error! status: ${menuResponse.status}`);
        }
        const menuData: { url: string } = await menuResponse.json();
        setMenuUrl(menuData.url);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Authenticated user:', user);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw profileError;
          }

          if (profileData) {
            // Initialize Intercom with user data
            Intercom({
              app_id: 'cdcmnvsm',
              user_id: profileData.user_id,
              name: profileData.display_name,
              email: profileData.email,
              created_at: profileData.created_at,
            });
            
            // Add custom CSS for Intercom positioning
            const style = document.createElement('style');
            style.innerHTML = `
              #intercom-container {
                bottom: 50px !important;
              }
              .intercom-lightweight-app-launcher {
                bottom: 50px !important;
              }
            `;
            document.head.appendChild(style);

            console.log('User profile:', profileData);
            setUserId(profileData.user_id); // Make sure this is set correctly
            setDisplayName(profileData.display_name);
            setAvatarUrl(profileData.avatar_url);
            setDeliveryNotes(profileData.delivery_notes);
            setResidenceType(profileData.residence_type);
            setStreetAddress(profileData.street_address);
            setCity(profileData.city);
            setState(profileData.state);
            setZipcode(profileData.zipcode);
            setPhoneNumber(profileData.phone_number);
            setFirstName(profileData.first_name);
            setLastName(profileData.last_name);
            setPreferredDeliveryMethod(profileData.delivery_method || 'handoff');

            //autofill orders with user profile data
            setOrderDetails((prev) => ({
              ...prev,
              phoneNumber: profileData.phone_number,
              deliveryResidenceType: profileData.residence_type,
              deliveryStreetAddress: profileData.street_address,
              deliveryCity: profileData.city,
              deliveryState: profileData.state,
              deliveryZipcode: profileData.zipcode,
              deliveryNotes: profileData.delivery_notes,
              deliveryMethod: profileData.delivery_method || 'handoff',
            }));
            
            if (profileData.square_loyalty_id) {
              const loyaltyResponse = await fetch(`/api/getLoyaltyBalance?loyaltyId=${profileData.square_loyalty_id}`);
              if (!loyaltyResponse.ok) {
                throw new Error(`HTTP error! status: ${loyaltyResponse.status}`);
              }
              const loyaltyData: { balance: number } = await loyaltyResponse.json();
              setLoyaltyBalance(loyaltyData.balance);
            } else {
              console.warn('No Square Loyalty ID found for this user');
            }
          } else {
            console.error('No profile data found for user');
            setError('No profile data found. Please contact support.');
          }
        }
      } catch (error) {
        console.error("There was a problem fetching data:", error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSubmit = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      const orderData = {
        user_id: userId,
        display_name: displayName,
        full_name: `${firstName} ${lastName}`.trim(),
        order_details: orderDetails,
        token_redemption: orderDetails.tokenRedemption,
        phone_number: orderDetails.phoneNumber,
        residence_type: orderDetails.deliveryResidenceType,
        street_address: orderDetails.deliveryStreetAddress,
        city: orderDetails.deliveryCity,
        state: orderDetails.deliveryState,
        zipcode: orderDetails.deliveryZipcode,
        delivery_method: orderDetails.deliveryMethod,
        delivery_notes: orderDetails.deliveryNotes,
        payment_method: orderDetails.paymentMethod,
        status: 'received',
        // Only include cash_details if payment method is Cash
        ...(orderDetails.paymentMethod === 'Cash' && { cash_details: orderDetails.cashDetails || '' }),
        total: orderDetails.total,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) throw error;

      // If a reward was selected, redeem it after the order is submitted
      if (orderDetails.tokenRedemption) {
        await redeemTokenReward();
      }

      router.push('/Order/Confirmation');
    } catch (error: any) {
      console.error("Error submitting order:", error);
      setError(error.message || 'Failed to submit order. Please try again.');
    }
  };

  const redeemTokenReward = async () => {
    const selectedItem = tokenShopItems.find(item => 
      `${item.name} (${item.cost} tokens)` === orderDetails.tokenRedemption
    );

    if (!selectedItem) {
      throw new Error('Selected reward not found');
    }

    console.log('Attempting to redeem reward:', selectedItem);

    // First, fetch the user's Square Loyalty ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('square_loyalty_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userData?.square_loyalty_id) {
      console.error('Error fetching Square Loyalty ID:', userError);
      throw new Error('Failed to fetch Square Loyalty ID');
    }

    const squareLoyaltyId = userData.square_loyalty_id;

    const redeemResponse = await fetch('/api/redeemRewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: squareLoyaltyId,
        points: -selectedItem.cost,
        reason: `Redeemed ${selectedItem.name}`
      }),
    });

    if (!redeemResponse.ok) {
      const errorData = await redeemResponse.json();
      console.error('Redeem error data:', errorData);
      throw new Error(errorData.error || 'Failed to redeem reward');
    }

    const redeemResult = await redeemResponse.json();
    console.log('Redeem result:', redeemResult);
    
    // Update the loyalty balance
    setLoyaltyBalance(prevBalance => prevBalance !== null ? prevBalance - selectedItem.cost : null);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  }

  const handleRewardClaim = (itemId: number) => {
    // Find the selected item
    const selectedItem = tokenShopItems.find(item => item.id === itemId);
    if (!selectedItem) {
      alert('Selected item not found');
      return;
    }

    // Check if user has enough tokens
    if (loyaltyBalance === null || loyaltyBalance < selectedItem.cost) {
      alert('Insufficient tokens to claim this reward');
      return;
    }

    // Update order details with the selected reward
    setOrderDetails(prevDetails => ({
      ...prevDetails,
      tokenRedemption: `${selectedItem.name} (${selectedItem.cost} tokens)`,
    }));

    // Close the token shop dialog
    setShowTokenShop(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-background">
        <div className="flex mt-10 items-center justify-center"> 
          <h1 className="text-4xl text-white font-bold">Order</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="mb-6">
              <div className="flex mb-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-grow ${
                      index <= currentStepIndex ? "bg-primary" : "bg-gray-200"
                    } ${index !== steps.length - 1 ? "mr-1" : ""}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 text-right">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
            <h2 className="text-2xl font-bold mb-6">{currentStep.title}</h2>
            <div className="mb-8">{currentStep.content}</div>
            <div className="flex justify-between">
              {currentStepIndex > 0 && (
                <Button className="bg-primary text-white" onClick={handlePrevious} variant="outline">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}
              {currentStep.id === 'deliveryAndConfirmation' ? (
                <>
                  <Button onClick={handleNext} className="bg-primary text-white">
                    Submit Order
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext} className={`${currentStepIndex === 0 ? "ml-auto" : ""} text-white`}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mt-8 flex flex-col justify-center items-center">
              <Dialog open={showTokenShop} onOpenChange={setShowTokenShop}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-accent">
                    <Coins className="mr-2 h-4 w-4" />
                    Token Shop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white mt-2 text-2xl">Token Shop</DialogTitle>
                    <p className="text-white text-md">Redeem your tokens for rewards</p>
                  </DialogHeader>
                  <div className="grid gap-4">
                    {tokenShopItems.map((item) => (
                      <Card key={item.id}>
                        <div className="flex flex-row justify-between items-center p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-col text-sm font-medium text-white">
                              <Badge variant="secondary" className="bg-accent">{item.cost} Tokens</Badge>
                              <p>{item.name}</p>
                            </div>
                          </div>
                          <div>
                            <Button
                              onClick={() => handleRewardClaim(item.id)}
                              disabled={loyaltyBalance === null || loyaltyBalance < item.cost}
                              size="sm"
                            >
                              Claim Reward
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <DialogFooter className="sticky bottom-0 bg-transparent z-10 pt-4">
                    <div className="flex justify-center">
                      <Button onClick={() => setShowTokenShop(false)}>Close</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <p className="text-sm font-medium mr-4">Tokens: <strong>{loyaltyBalance}</strong></p>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-20">
          {menuUrl && (
            <Image 
              src={menuUrl} 
              width={500} 
              height={500} 
              alt="Current Menu" 
              className="mx-auto" 
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
        </div>
      </main>
      
      <footer>
        <BottomNav />
      </footer>
    </div>
  );
}