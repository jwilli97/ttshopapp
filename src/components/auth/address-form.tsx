'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from 'lucide-react';
import type { DeliveryAddress } from '@/app/types/auth';
import { getSupabaseClient } from "@/lib/supabaseClient";

interface AddressFormProps {
  defaultValues?: DeliveryAddress;
  onSubmit: (data: DeliveryAddress) => void;
  isLoading?: boolean;
  error?: string;
}

export function AddressForm({ defaultValues, onSubmit, isLoading = false, error = '' }: AddressFormProps) {
  const [formData, setFormData] = useState<DeliveryAddress>(defaultValues || {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    buildingType: 'house',
    deliveryMethod: 'handoff' as const,
    deliveryInstructions: ''
  });
  const [isValidDeliveryZone, setIsValidDeliveryZone] = useState<boolean>(true);
  const supabase = getSupabaseClient();

  // Check delivery zone using Supabase
  const checkDeliveryZone = async (zipCode: string) => {
    if (!zipCode) return;

    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('delivery_time, delivery_fee, delivery_range')
        .eq('zipcode', zipCode)
        .single();

      if (error || !data) {
        setIsValidDeliveryZone(false);
        setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }));
      } else {
        setIsValidDeliveryZone(true);
      }
    } catch (err) {
      console.error('Error fetching delivery zone:', err);
      setIsValidDeliveryZone(false);
      setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }));
    }
  };

  // Update delivery method when building type changes
  const updateDeliveryMethod = (newBuildingType: string) => {
    if (newBuildingType === 'apartment' && formData.deliveryMethod === 'contactless') {
      setFormData(prev => ({ ...prev, deliveryMethod: 'handoff' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street" className="text-white">
              Street Address
            </Label>
            <Input
              id="street"
              placeholder="Street address"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
              className="text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-white">
              City
            </Label>
            <Input
              id="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              className="text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state" className="text-white">
                State
              </Label>
              <Input
                id="state"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                className="text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-white">
                Zip Code
              </Label>
              <Input
                id="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={(e) => {
                  const newZipCode = e.target.value;
                  setFormData({ ...formData, zipCode: newZipCode });
                  checkDeliveryZone(newZipCode);
                }}
                required
                className="text-white"
              />
              {!isValidDeliveryZone && formData.zipCode && (
                <p className="text-sm font-semibold text-[#FF9494]">
                  Address out of range for deliveries - pickup only
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Building Type</Label>
            <RadioGroup
              value={formData.buildingType}
              onValueChange={(value) => {
                setFormData({ ...formData, buildingType: value as 'house' | 'apartment' });
                updateDeliveryMethod(value as 'house' | 'apartment');
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="house" id="house" />
                <Label htmlFor="house" className="text-white">House/Townhouse</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="apartment" id="apartment" />
                <Label htmlFor="apartment" className="text-white">Apartment/Highrise</Label>
              </div>
            </RadioGroup>
            {formData.buildingType === 'apartment' && (
              <p className="text-sm text-amber-600">
                Note: Contactless delivery is not available for apartments/highrises
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white">Delivery Method</Label>
            {!isValidDeliveryZone && formData.zipCode && (
              <p className="text-sm font-semibold text-[#FF9494] mb-2">
                Only pickup is available for this location
              </p>
            )}
            <RadioGroup
              value={formData.deliveryMethod}
              onValueChange={(value) => 
                setFormData({ ...formData, deliveryMethod: value as 'handoff' | 'contactless' | 'pickup' | 'dropoff' })
              }
            >
              {isValidDeliveryZone && (
                <>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="handoff" id="handoff" />
                    <Label htmlFor="handoff" className="text-white">In-person Handoff</Label>
                  </div>
                  {formData.buildingType !== 'apartment' && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="contactless" id="contactless" />
                      <Label htmlFor="contactless" className="text-white">Contactless Delivery</Label>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="text-white">Pickup</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-white">
              Delivery Instructions
            </Label>
            <Textarea
              id="instructions"
              placeholder="Add delivery instructions"
              value={formData.deliveryInstructions}
              onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
              className="text-white"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/75 h-11 mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Complete Registration'}
        </Button>
      </form>
    </div>
  );
}

