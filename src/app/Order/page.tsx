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
import DeliveryInfo from "@/components/deliveryInfo";
import LogOutButton from "@/components/logoutButton";
import { ChevronRight, ChevronLeft, Coins, X } from "lucide-react";
import { useUser } from '@supabase/auth-helpers-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import Intercom from '@intercom/messenger-js-sdk';
import ShopIcon from "@/components/icons/shopIcon";
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
  pickupTime?: string;
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

const PICKUP_LOCATION = "Placeholder: 123 Main Street, Houston, TX 77002";
const PICKUP_TIMES = ["7:30 PM", "8:30 PM"];

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

const capitalizeFirst = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
  const [activeMenu, setActiveMenu] = useState<string>("");
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
    pickupTime: undefined,
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
  const [userData, setUserData] = useState<{
    usual_order?: string;
    usual_total?: number | null;
  } | null>(null);

  const steps = [
    {
      id: 'item',
      title: "What can we get for you?",
      content: (
        <div>
          <Textarea
            className="bg-gray-200 text-black placeholder:text-gray-600"
            placeholder="Type your order here..."
            value={orderDetails.item}
            onChange={(e) => setOrderDetails({ ...orderDetails, item: e.target.value })}
            rows={3}
          />

          {/* Add selected token redemption display */}
          {orderDetails.tokenRedemption && (
            <div className="mt-2 mb-2 p-2 bg-accent/40 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">{orderDetails.tokenRedemption}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-primary hover:text-primary/80"
                onClick={() => setOrderDetails({ ...orderDetails, tokenRedemption: '' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="mt-2 w-full space-y-2">
            {/* Add Usual Order button */}
            {userData?.usual_order && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-accent flex items-center gap-2 justify-center bg-primary text-white hover:bg-primary/80"
                onClick={async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    
                    if (!session) {
                      console.error("No session found");
                      return;
                    }

                    // Create order details object using profile data
                    const orderData = {
                      user_id: userId,
                      display_name: displayName,
                      full_name: `${firstName} ${lastName}`.trim(),
                      order_details: {
                        item: userData.usual_order,
                        phoneNumber: phoneNumber,
                        deliveryResidenceType: residenceType,
                        deliveryStreetAddress: streetAddress,
                        deliveryCity: city,
                        deliveryState: state,
                        deliveryZipcode: zipcode,
                        deliveryMethod: preferredDeliveryMethod,
                        deliveryNotes: deliveryNotes || '',
                        paymentMethod: '', // This will need to be selected
                        total: userData.usual_total,
                      },
                      phone_number: phoneNumber,
                      residence_type: residenceType,
                      street_address: streetAddress,
                      city: city,
                      state: state,
                      zipcode: zipcode,
                      delivery_method: preferredDeliveryMethod,
                      status: 'processing',
                      total: userData.usual_total
                    };

                    // Insert new order into orders table
                    const { error } = await supabase
                      .from('orders')
                      .insert(orderData);

                    if (error) throw error;

                    // Redirect to order confirmation page
                    router.push('/Order/Confirmation');
                  } catch (error) {
                    console.error('Error placing usual order:', error);
                    alert('Failed to place usual order. Please try again.');
                  }
                }}
              >
                Place Usual Order
              </Button>
            )}

            {/* Existing Token Shop Dialog */}
            <Dialog open={showTokenShop} onOpenChange={setShowTokenShop}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-accent flex items-center gap-2 justify-center hover:text-black [&>svg]:hover:text-black">
                  <ShopIcon />
                  Redeem Tokens
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-4 rounded-sm hover:bg-background"
                  onClick={() => setShowTokenShop(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
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
                            <Badge variant="secondary" className="bg-accent text-black">{item.cost} Tokens</Badge>
                            <p>{item.name}</p>
                          </div>
                        </div>
                        <div>
                          <Button
                            onClick={() => handleRewardClaim(item.id)}
                            disabled={loyaltyBalance === null || loyaltyBalance < item.cost}
                            size="sm"
                          >
                            Redeem
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <DialogFooter className="w-full pt-4">
                  <Button 
                    onClick={() => setShowTokenShop(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {/* <p className="text-black text-sm mt-1">Please note that we have a $100 minimum order requirement.</p> */}
        </div>
      ),
      nextStep: () => 'deliveryAndConfirmation',
    },
    {
      id: 'deliveryAndConfirmation',
      title: "Review & Confirm Order",
      content: (
        <div className="space-y-4 text-black">
          {/* Order Items */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-100">
            <h3 className="font-bold mb-2">Order Items:</h3>
            <p>{(orderDetails.item)}</p>
            {orderDetails.tokenRedemption && (
              <p className="mt-2">
                <span className="font-semibold">Token Redemption: </span><br />
                {orderDetails.tokenRedemption}
              </p>
            )}
          </div>

          {/* Delivery Information */}
          <div>
            <h3 className="font-bold">
              {orderDetails.deliveryMethod === 'Pickup' ? 'Meetup Location:' : 'Delivery Address:'}
            </h3>
            
            {orderDetails.deliveryMethod === 'Pickup' ? (
              <div>
                <p>{PICKUP_LOCATION}</p>
                <div className="mt-4">
                  <Label className="font-bold">Select Pickup Time:</Label>
                  <RadioGroup 
                    value={orderDetails.pickupTime}
                    onValueChange={(value) => setOrderDetails(prev => ({
                      ...prev,
                      pickupTime: value
                    }))}
                    className="mt-2"
                  >
                    {PICKUP_TIMES.map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <RadioGroupItem value={time} id={`pickup-${time}`} />
                        <Label htmlFor={`pickup-${time}`}>{time}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                {orderDetails.pickupTime && (
                  <p className="mt-2 text-green-600">Pickup scheduled for {orderDetails.pickupTime}</p>
                )}
              </div>
            ) : (
              <>
                <p>{(orderDetails.deliveryStreetAddress)}, {capitalizeFirst(orderDetails.deliveryCity)}, {orderDetails.deliveryState.toUpperCase()} {orderDetails.deliveryZipcode}</p>
                <div className="mt-2 space-y-2">
                  <p><span className="font-semibold">Residence Type: </span><br />{capitalizeFirst(orderDetails.deliveryResidenceType)}</p>
                  <p><span className="font-semibold">Delivery Method: </span><br />{capitalizeFirst(orderDetails.deliveryMethod)}</p>
                </div>
              </>
            )}
            
            {/* Only show Edit Address button for non-pickup orders */}
            {orderDetails.deliveryMethod !== 'Pickup' && (
              <div>
                <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="text-primary bg-white hover:bg-white mt-2">
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

                      <div className="mt-2">
                        <DeliveryInfo zipcode={zipcode} />
                      </div>

                      <div>
                        <Label>Delivery Method</Label>
                        <RadioGroup 
                          defaultValue={orderDetails.deliveryMethod}
                          onValueChange={(value) => {
                            setOrderDetails(prev => ({
                              ...prev,
                              deliveryMethod: value,
                            }));
                            // Close dialog after selection
                            setShowAddressDialog(false);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Handoff" id="handoff" />
                            <Label htmlFor="handoff">Handoff</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Contactless" id="contactless" />
                            <Label htmlFor="contactless">Contactless</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Pickup" id="pickup" />
                            <Label htmlFor="pickup">Pickup</Label>
                          </div>
                        </RadioGroup>
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
                                .eq('user_id', userId as string);

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
            )}
          </div>

          {/* Phone Number */}
          <div>
            <h3 className="font-bold">Phone Number:</h3>
            <p>{formatPhoneNumber(orderDetails.phoneNumber)}</p>
          </div>

          {/* Estimated Time */}
          <div>
            <DeliveryInfo zipcode={orderDetails.deliveryZipcode} />
          </div>

          {/* Total and Payment */}
          <div>
            <h3 className="font-bold">Total:</h3>
            <p className="mb-4">{orderDetails.total === null ? 'Pending Confirmation' : `$${orderDetails.total}`}</p>
            
            <h3 className="font-bold mb-2">Payment Method:</h3>
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
                    value={capitalizeFirst(orderDetails.cashDetails || '')}
                    onChange={(e) => setOrderDetails({ ...orderDetails, cashDetails: e.target.value })}
                    rows={2}
                  />
                )}
              </div>
            </RadioGroup>
            {orderDetails.deliveryMethod === 'Contactless' && orderDetails.paymentMethod === 'Venmo' && (
              <p className="text-red-500 text-sm mt-2">Prepayment required for Venmo & contactless delivery</p>
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
        // Fetch active menu
        const fetchActiveMenu = async () => {
          try {
              const response = await fetch('/api/getMenuUrl');
              const data = await response.json();
              console.log("Received data:", data);
              
              setActiveMenu(data.currentMenu?.url || "No active menu set");
          } catch (error) {
              console.error("Error fetching active menu:", error);
              setActiveMenu("Error loading active menu");
          }
      };

      fetchActiveMenu();

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
            // Add this line to set the userData
            setUserData(profileData);

            // Initialize Intercom with user data
            Intercom({
              app_id: 'cdcmnvsm',
              user_id: profileData.user_id as string,
              name: profileData.display_name as string,
              email: profileData.email as string,
              created_at: profileData.created_at as number,
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
            setUserId(profileData.user_id as string);
            setDisplayName(profileData.display_name as string);
            setAvatarUrl(profileData.avatar_url as string);
            setDeliveryNotes(profileData.delivery_notes as string);
            setResidenceType(profileData.residence_type as string);
            setStreetAddress(profileData.street_address as string);
            setCity(profileData.city as string);
            setState(profileData.state as string);
            setZipcode(profileData.zipcode as string);
            setPhoneNumber(profileData.phone_number as string);
            setFirstName(profileData.first_name as string);
            setLastName(profileData.last_name as string);
            setPreferredDeliveryMethod(profileData.delivery_method as string || 'handoff');
            // Set loyalty balance directly from profile data
            setLoyaltyBalance(profileData.loyalty_balance as number);

            setOrderDetails((prev) => ({
              ...prev,
              phoneNumber: profileData.phone_number as string,
              deliveryResidenceType: profileData.residence_type as string,
              deliveryStreetAddress: profileData.street_address as string,
              deliveryCity: profileData.city as string,
              deliveryState: profileData.state as string,
              deliveryZipcode: profileData.zipcode as string,
              deliveryNotes: profileData.delivery_notes as string,
              deliveryMethod: profileData.delivery_method as string || 'handoff',
            }));
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

    // Add order items validation
    if (!orderDetails.item.trim()) {
      alert('Please enter items you would like to order');
      return;
    }

    // Add payment method validation
    if (!orderDetails.paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // Add pickup time validation
    if (orderDetails.deliveryMethod === 'Pickup' && !orderDetails.pickupTime) {
      alert('Please select a pickup time');
      return;
    }

    // Add validation for cash details if needed
    if (orderDetails.paymentMethod === 'Cash' && 
        orderDetails.deliveryMethod === 'Contactless' && 
        !orderDetails.cashDetails) {
      alert('Please provide cash placement details for contactless delivery');
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
        street_address: orderDetails.deliveryMethod === 'Pickup' ? PICKUP_LOCATION : orderDetails.deliveryStreetAddress,
        city: orderDetails.deliveryMethod === 'Pickup' ? 'Houston' : orderDetails.deliveryCity,
        state: orderDetails.deliveryMethod === 'Pickup' ? 'TX' : orderDetails.deliveryState,
        zipcode: orderDetails.deliveryMethod === 'Pickup' ? '77002' : orderDetails.deliveryZipcode,
        delivery_method: orderDetails.deliveryMethod,
        pickup_time: orderDetails.pickupTime,
        delivery_notes: orderDetails.deliveryNotes,
        payment_method: orderDetails.paymentMethod,
        status: 'processing',
        ...(orderDetails.paymentMethod === 'Cash' && { cash_details: orderDetails.cashDetails || '' }),
        total: orderDetails.total,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) throw error;

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

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('square_loyalty_id')
      .eq('user_id', userId as string)
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-black">{currentStep.title}</h2>
              <div className="mb-8 text-black">{currentStep.content}</div>
            </div>
            <div className="flex flex-col gap-2">
              {currentStep.id === 'deliveryAndConfirmation' ? (
                <Button 
                  onClick={handleNext} 
                  className="bg-primary text-white w-full"
                  disabled={
                    !orderDetails.item.trim() || 
                    !orderDetails.paymentMethod || 
                    (orderDetails.paymentMethod === 'Cash' && 
                     orderDetails.deliveryMethod === 'Contactless' && 
                     !orderDetails.cashDetails)
                  }
                >
                  Submit Order
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full text-white">
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {currentStepIndex > 0 && (
                <Button className="w-full bg-white text-primary hover:bg-white" onClick={handlePrevious}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mb-32 mt-8 rounded-lg w-full max-w-4xl mx-auto px-4">
            {activeMenu ? (
                <div className="relative w-full aspect-[3/4] md:aspect-[4/3]">
                    <Image 
                        src={activeMenu}
                        alt="Current Menu"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 800px"
                        priority
                        onClick={() => window.open(activeMenu, '_blank')}
                    />
                </div>
            ) : (
                <p className="text-gray-700">No active menu set</p>
            )}
        </div>
      </main>
      
      <footer>
        <BottomNav />
      </footer>
    </div>
  );
}