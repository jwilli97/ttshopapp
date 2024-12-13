'use client';

import { useState, useEffect } from "react";
import TokenShop from "@/components/TokenShop";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {

    const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user data including Square Loyalty ID
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('square_loyalty_id')
                        .eq('user_id', user.id)
                        .single();
    
                    if (error) throw error;
                    if (data) {
                        // Fetch loyalty balance using Square Loyalty ID
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
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            <TokenShop loyaltyBalance={loyaltyBalance} />
        </div>
    );
};