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
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useUser } from '@supabase/auth-helpers-react';

export default function NewOrder() {
  
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>('Loading...');
  const [streetAddress, setStreetAddress] = useState<string>('Loading...');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState('');
  const [zipcode, setZipcode] = useState('');
  const user = useUser();

  const steps = [
    {
      title: "What would you like to order?",
      content: (
        <Textarea
          className="bg-gray-200 text-black"
          placeholder="Enter the items you want to order..."
          value={orderDetails}
          onChange={(e) => setOrderDetails(e.target.value)}
          rows={3}
        />
      ),
    },
    {
        title: "Confirm your delivery method and address",
        content: (
          <div>
            <Label className="font-bold">Delivery Method</Label>
            <RadioGroup defaultValue="Venmo">
              <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contactless" id="r1" />
                  <Label htmlFor="r1">Contactless</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="person" id="r2" />
                  <Label htmlFor="r2">In Person</Label>
              </div>
            </RadioGroup>
            <Label className="font-bold">Street Address</Label>
            <Textarea
              className="bg-gray-200 text-black mb-3"
              placeholder="Enter your street address"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              rows={2}
            />
            <Label className="font-bold">ZIP Code</Label>
            <Input
              className="bg-gray-200 text-black"
              type="text"
              placeholder="Enter your ZIP code"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />
          </div>
        ),
    },
    {
      title: "Select your payment method.",
      content: (
        <RadioGroup defaultValue="Venmo">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="venmo" id="r1" />
                <Label htmlFor="r1">Venmo</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="r2" />
                <Label htmlFor="r2">Cash</Label>
            </div>
        </RadioGroup>
      ),
    },
    {
      title: "Please confirm your phone number.",
      content: (
        <Input
          className="bg-gray-200 text-black"
          type="tel"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      ),
    },
    {
      title: "Confirm your order details:",
      content: (
        <div className="space-y-1">
          <p className="font-bold">Display Name: {displayName}</p>
          <p className="font-bold">Order Details: {orderDetails}</p>
          <p className="font-bold">Phone Number: {phoneNumber}</p>
          <p className="font-bold">Delivery Address: {streetAddress}, {zipcode}</p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
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
          setUserId(user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, square_loyalty_id, street_address, zipcode, phone_number')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;
          if (data) {
            setDisplayName(data.display_name);
            setAvatarUrl(data.avatar_url);
            setStreetAddress(data.street_address);
            setZipcode(data.zipcode);
            setPhoneNumber(data.phone_number);
            
            if (data.square_loyalty_id) {
              const loyaltyResponse = await fetch(`/api/getLoyaltyBalance?loyaltyId=${data.square_loyalty_id}`);
              if (!loyaltyResponse.ok) {
                throw new Error(`HTTP error! status: ${loyaltyResponse.status}`);
              }
              const loyaltyData: { balance: number } = await loyaltyResponse.json();
              setLoyaltyBalance(loyaltyData.balance);
            } else {
              console.warn('No Square Loyalty ID found for this user');
            }
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
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          display_name: displayName,
          order_details: orderDetails,
          phone_number: phoneNumber,
          street_address: streetAddress,
          zipcode: zipcode,
          status: 'pending'
        });

      if (error) throw error;

      console.log("Order submitted:", data);
      alert("Order submitted successfully!");
      router.push('/Order/Confirmation'); // Redirect to orders page after submission
    } catch (error) {
      console.error("Error submitting order:", error);
      setError('Failed to submit order. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  }

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
                      index <= step ? "bg-primary" : "bg-gray-200"
                    } ${index !== steps.length - 1 ? "mr-1" : ""}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 text-right">
                Step {step + 1} of {steps.length}
              </p>
            </div>
            <h2 className="text-2xl font-bold mb-6">{currentStep.title}</h2>
            <div className="mb-8">{currentStep.content}</div>
            <div className="flex justify-between">
              {step > 0 && (
                <Button onClick={handlePrevious} variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button onClick={handleNext} className={step === 0 ? "ml-auto" : ""}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="ml-auto">
                  Submit Order
                </Button>
              )}
            </div>
          </div>
        </div>
        <div>
        {menuUrl && (
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Image src={menuUrl} width={500} height={100} alt="Current Menu" className="mx-auto" />
          </div>
        )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}