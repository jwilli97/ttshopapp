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
import { supabase } from "@/lib/supabaseClient";

interface AddressFormProps {
  defaultValues?: DeliveryAddress;
  onSubmit: (data: DeliveryAddress) => void;
  onBack: () => void;
}

export function AddressForm({ defaultValues, onSubmit, onBack }: AddressFormProps) {
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
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
      </div>
      <div>
      <h1 className="text-xl font-semibold ml-2">CREATE ACCOUNT</h1>
      </div>
      
      <div className="h-2 bg-gray-100 rounded">
        <div className="h-full w-5/6 bg-primary rounded" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-medium">DELIVERY ADDRESS</h2>
          
          <Input
            placeholder="Street address"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            required
          />

          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
            <div className="space-y-1">
              <Input
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={(e) => {
                  const newZipCode = e.target.value;
                  setFormData({ ...formData, zipCode: newZipCode });
                  checkDeliveryZone(newZipCode);
                }}
                required
              />
              {!isValidDeliveryZone && formData.zipCode && (
                <p className="text-sm font-semibold text-[#FF9494]">
                  Address out of range for deliveries - pickup only
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Building type</p>
            <RadioGroup
              value={formData.buildingType}
              onValueChange={(value) => {
                setFormData({ ...formData, buildingType: value as 'house' | 'apartment' });
                updateDeliveryMethod(value as 'house' | 'apartment');
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="house" id="house" />
                <Label htmlFor="house">House/Townhouse</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="apartment" id="apartment" />
                <Label htmlFor="apartment">Apartment/Highrise</Label>
              </div>
            </RadioGroup>
            {formData.buildingType === 'apartment' && (
              <p className="text-sm text-amber-600">
                Note: Contactless delivery is not available for apartments/highrises
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Delivery Method</p>
            {!isValidDeliveryZone && formData.zipCode && (
              <p className="text-sm font-semibold text-[#FF9494] mb-2">
                Only pickup is available for this location
              </p>
            )}
            <RadioGroup
              value={formData.deliveryMethod}
              onValueChange={(value) => 
                setFormData({ ...formData, deliveryMethod: value as 'handoff' | 'contactless' | 'pickup' })
              }
            >
              {isValidDeliveryZone && (
                <>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="handoff" id="handoff" />
                    <Label htmlFor="handoff">In-person Handoff</Label>
                  </div>
                  {formData.buildingType !== 'apartment' && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="contactless" id="contactless" />
                      <Label htmlFor="contactless">Contactless Delivery</Label>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup">Pickup</Label>
              </div>
            </RadioGroup>
          </div>

          <Textarea
            placeholder="Add delivery instructions"
            value={formData.deliveryInstructions}
            onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
          />
        </div>

        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm space-y-2">
          <Button
            type="submit"
            className="w-full bg-primary"
          >
            NEXT
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit({
              street: 'test',
              city: 'test',
              state: 'test',
              zipCode: 'test',
              buildingType: 'house',
              deliveryMethod: 'handoff',
              deliveryInstructions: ''
            })}
            className="w-full bg-gray-200 hover:bg-gray-300 text-black"
          >
            SKIP VERIFICATION (DEV ONLY)
          </Button>
        </div>
      </form>
    </div>
  );
}

