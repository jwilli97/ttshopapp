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
import { ChevronRight, ChevronLeft, Coins } from "lucide-react";
import { useUser } from '@supabase/auth-helpers-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
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
}

interface TinyTokenShopItem {
  id: number;
  name: string;
  cost: number;
}

const tokenShopItems: TinyTokenShopItem[] = [
  { id: 1, name: 'Mystery Preroll', cost: 200 },
  { id: 2, name: 'Mystery Light Depth Eighth', cost: 400 },
  { id: 3, name: 'Blind 6 Joint Pack', cost: 800 },
  { id: 4, name: 'Blind Edibles Box', cost: 1000 },
  { id: 5, name: 'Mystery Pen', cost: 1500 },
]

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
      nextStep: () => 'deliveryInfo',
    },
    {
      id: 'deliveryInfo',
      title: "Confirm your delivery information:",
      content: (
        <div>
          <p className="font-bold mb-2">Delivery Method</p>
          <RadioGroup 
            className="mb-4"
            defaultValue={orderDetails.deliveryMethod} 
            onValueChange={(value) => {
              setOrderDetails({ ...orderDetails, deliveryMethod: value });
              if (value === 'Contactless') {
                setOrderDetails(prev => ({ ...prev, paymentMethod: 'Venmo' }));
              }
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Contactless" id="r1" />
              <Label htmlFor="r1">Contactless</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Handoff" id="r2" />
              <Label htmlFor="r2">Handoff</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pickup" id="r3" />
              <Label htmlFor="r3">Pickup</Label>
            </div>
          </RadioGroup>
          <div>
            <p className="font-bold mb-1">Delivery Address</p>
            <div>
              <Input 
                className="bg-gray-200 text-black"
                type="text" 
                placeholder="Enter a new address" 
                value={streetAddress}
                onChange={(e) => {
                  setStreetAddress(e.target.value);
                  setOrderDetails(prev => ({
                    ...prev,
                    deliveryStreetAddress: e.target.value
                  }));
                }}
                disabled
              />
              <div className="flex flex-row">
                <Input 
                  className="bg-gray-200 text-black" 
                  type="text" 
                  placeholder="City" 
                  value={city} 
                  onChange={(e) => {
                    setCity(e.target.value);
                    setOrderDetails(prev => ({ ...prev, deliveryCity: e.target.value }));
                  }} 
                  disabled
                />
                <Input 
                  className="bg-gray-200 text-black" 
                  type="text" 
                  placeholder="State" 
                  value={state} 
                  onChange={(e) => {
                    setState(e.target.value);
                    setOrderDetails(prev => ({ ...prev, deliveryState: e.target.value }));
                  }} 
                  disabled
                />
                <Input 
                  className="bg-gray-200 text-black" 
                  type="text" 
                  placeholder="ZIP Code" 
                  value={zipcode} 
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryZipcode: e.target.value }))} 
                  disabled
                />
              </div>
              <p className="mt-2 font-bold">Residence Type</p>
              <Input className="bg-gray-200 text-black" type="text" placeholder="Enter residence type" value={residenceType} onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryResidenceType: e.target.value }))} disabled />
            </div>
            <p className="mt-2 font-bold">Delivery Instructions</p>
            <Textarea 
              className="bg-gray-200 text-black mt-2"
              placeholder="Delivery Notes"
              value={orderDetails.deliveryNotes}
              onChange={(e) => setOrderDetails({ ...orderDetails, deliveryNotes: e.target.value })}
              rows={2}
              disabled
            />
            <div className="flex justify-between mt-1">
              <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-primary bg-transparent hover:bg-primary hover:text-white">
                    Use Other Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Enter Delivery Address</DialogTitle>
                    <DialogDescription>
                      Enter a new delivery address for this order.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={newAddress.streetAddress}
                        onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipcode">ZIP Code</Label>
                        <Input
                          id="zipcode"
                          value={newAddress.zipcode}
                          onChange={(e) => setNewAddress({ ...newAddress, zipcode: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="residenceType">Residence Type</Label>
                      <Input
                        id="residenceType"
                        placeholder="House, Apartment, etc."
                        value={newAddress.residenceType}
                        onChange={(e) => setNewAddress({ ...newAddress, residenceType: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex justify-between space-x-2">
                    <Button variant="outline" onClick={async () => {
                      if (!userId) return;

                      // Update both order details and Supabase profile
                      setOrderDetails(prev => ({
                        ...prev,
                        deliveryStreetAddress: newAddress.streetAddress,
                        deliveryCity: newAddress.city,
                        deliveryState: newAddress.state,
                        deliveryZipcode: newAddress.zipcode,
                        deliveryResidenceType: newAddress.residenceType,
                      }));

                      // Update local state variables
                      setStreetAddress(newAddress.streetAddress);
                      setCity(newAddress.city);
                      setState(newAddress.state);
                      setZipcode(newAddress.zipcode);
                      setResidenceType(newAddress.residenceType);

                      // Update profile in Supabase
                      await supabase
                        .from('profiles')
                        .update({
                          street_address: newAddress.streetAddress,
                          city: newAddress.city,
                          state: newAddress.state,
                          zipcode: newAddress.zipcode,
                          residence_type: newAddress.residenceType,
                        })
                        .eq('user_id', userId);

                      setShowAddressDialog(false);
                    }}>
                      Set as Default
                    </Button>
                    <Button onClick={() => {
                      // Update order details with new address (one-time use)
                      setOrderDetails(prev => ({
                        ...prev,
                        deliveryStreetAddress: newAddress.streetAddress,
                        deliveryCity: newAddress.city,
                        deliveryState: newAddress.state,
                        deliveryZipcode: newAddress.zipcode,
                        deliveryResidenceType: newAddress.residenceType,
                      }));

                      // Update local state variables for display
                      setStreetAddress(newAddress.streetAddress);
                      setCity(newAddress.city);
                      setState(newAddress.state);
                      setZipcode(newAddress.zipcode);
                      setResidenceType(newAddress.residenceType);

                      setShowAddressDialog(false);
                    }}>
                      Use Once
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="text-sm mt-4 font-bold text-gray-500">Estimated Time Frame: 7:30pm - 9:30pm</p>
        </div>
      ),
      nextStep: () => 'paymentMethod',
    },
    {
      id: 'paymentMethod',
      title: "Select your payment method",
      content: (
        <div>
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
      ),
      nextStep: () => 'confirmation',
    },
    {
      id: 'confirmation',
      title: "Confirm your order details:",
      content: (
        <div className="space-y-1">
          <p className="font-bold">Order Details: {orderDetails.item}</p>
          {orderDetails.tokenRedemption && (
            <p className="font-bold">Token Redemption: {orderDetails.tokenRedemption}</p>
          )}
          <p className="font-bold">Phone Number: {orderDetails.phoneNumber}</p>
          <p className="font-bold">Delivery Address: {orderDetails.deliveryStreetAddress}, {orderDetails.deliveryCity}, {orderDetails.deliveryState} {orderDetails.deliveryZipcode}</p>
          <p className="font-bold">Residence Type: {orderDetails.deliveryResidenceType}</p>
          <p className="font-bold">Delivery Method: {orderDetails.deliveryMethod}</p>
          <p className="font-bold">Payment Method: {orderDetails.paymentMethod}</p>
          {orderDetails.paymentMethod === 'Cash' && orderDetails.cashDetails && (
            <p className="font-bold">Cash Details: {orderDetails.cashDetails}</p>
          )}
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
      // Handle case when there's no next step (e.g., submit order)
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
        status: 'pending',
        // Only include cash_details if payment method is Cash
        ...(orderDetails.paymentMethod === 'Cash' && { cash_details: orderDetails.cashDetails || '' })
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) throw error;

      console.log("Order submitted:", data);

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

    // Show success message
    alert(`${selectedItem.name} added to your order. It will be redeemed when you submit the order.`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-background">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => router.push('/Account')}>
            <Avatar>
              <AvatarImage src={avatarUrl} alt="Profile Picture" />
              <AvatarFallback className="text-2xl">TT</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{displayName}</p>
              <p className="text-sm text-gray-500 hover:text-gray-700">View Account</p>
            </div>
          </div>
          <LogOutButton />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
                <Button onClick={handlePrevious} variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              )}
              {currentStep.id === 'confirmation' ? (
                <>
                  <Button 
                    onClick={() => setCurrentStepIndex(0)} 
                    variant="outline"
                    className="mx-2"
                  >
                    Edit Order
                  </Button>
                  <Button onClick={handleNext}>
                    Submit Order
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext} className={currentStepIndex === 0 ? "ml-auto" : ""}>
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
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Token Shop</DialogTitle>
                    <DialogDescription className="text-black">Redeem your tokens for rewards</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {tokenShopItems.map((item) => (
                      <Card key={item.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {item.name}
                          </CardTitle>
                          <Badge variant="secondary">{item.cost} Tokens</Badge>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => handleRewardClaim(item.id)}
                            disabled={loyaltyBalance === null || loyaltyBalance < item.cost}
                          >
                            Claim Reward
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <DialogFooter className="relative">
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
        <div className="mt-8">
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