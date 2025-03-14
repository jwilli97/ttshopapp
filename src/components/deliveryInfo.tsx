import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";

interface DeliveryZone {
  delivery_time: string | null;
  delivery_fee: number | null;
  delivery_range: string;
}

interface DeliveryInfoProps {
  zipcode: string;
  hideIfFreeDelivery?: boolean;
}

export default function DeliveryInfo({ zipcode, hideIfFreeDelivery = false }: DeliveryInfoProps) {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryZone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkDeliveryZone() {
      if (!zipcode) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('delivery_zones')
          .select('delivery_time, delivery_fee, delivery_range')
          .eq('zipcode', zipcode)
          .single();

        if (error) {
          console.error('Error checking delivery zone:', error);
          setDeliveryInfo(null);
        } else {
          setDeliveryInfo(data as DeliveryZone); 
        }
      } catch (err) {
        console.error('Error fetching delivery zone:', err);
        setDeliveryInfo(null);
      } finally {
        setLoading(false);
      }
    }

    checkDeliveryZone();
  }, [zipcode]);

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-gray-500">Checking delivery availability...</p>
      </div>
    );
  }

  if (!deliveryInfo) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-red-500">Delivery not available in this area</p>
      </div>
    );
  }

  if (hideIfFreeDelivery && deliveryInfo.delivery_fee === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p>
        <strong>Estimated Time Frame:</strong><br />{deliveryInfo.delivery_time || 'Not available'}
      </p>
      {deliveryInfo.delivery_fee !== null && (
        <p>
          {deliveryInfo.delivery_fee === 0 ? (
            'Free Delivery'
          ) : (
            `Delivery Fee: $${deliveryInfo.delivery_fee.toFixed(2)}`
          )}
        </p>
      )}
      {deliveryInfo.delivery_range && (
        <p className="text-sm text-gray-400">{deliveryInfo.delivery_range}</p>
      )}
    </div>
  );
}