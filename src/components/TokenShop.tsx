'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CoinIcon from "@/components/icons/coinIcon";
import ShopIcon from "@/components/icons/shopIcon";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface TokenShopProps {
    userId: string;
};

interface ShopItem {
    id: number;
    name: string;
    cost: number;
};

const shopItems: ShopItem[] = [
  { id: 1, name: 'Top Shelf Eighth', cost: 7 },
  { id: 2, name: 'Moonrock Blunt', cost: 8 },
  { id: 3, name: '5 Pack Infused Joints', cost: 12 },
  { id: 4, name: 'Kurvana Pen', cost: 15 },
  { id: 5, name: 'Stizzy Battery/Pod Set', cost: 18 },
  { id: 6, name: 'Sampler Pack', cost: 21 },
];

const maxValue = 50;
const tickValues = Array.from({ length: 11 }, (_, i) => i * 5); // Creates [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

const TokenShop: React.FC<TokenShopProps> = ({ userId }) => {
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        async function fetchLoyaltyBalance() {
            if (!userId) {
                console.log('No userId provided');
                return;
            }

            try {
                console.log('Fetching profile data for user:', userId);
                
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('square_loyalty_id, loyalty_balance, loyalty_balance_updated_at')
                    .eq('user_id', userId)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                    setError(profileError.message);
                    return;
                }

                if (!profile) {
                    console.log('No profile found');
                    return;
                }

                console.log('Profile data:', {
                    square_loyalty_id: profile.square_loyalty_id,
                    loyalty_balance: profile.loyalty_balance,
                    loyalty_balance_updated_at: profile.loyalty_balance_updated_at
                });

                // Always set the cached balance first if it exists
                if (typeof profile.loyalty_balance === 'number') {
                    console.log('Setting cached balance:', profile.loyalty_balance);
                    setLoyaltyBalance(profile.loyalty_balance);
                }

                // Only fetch from Square API if we have a loyalty ID
                if (profile.square_loyalty_id) {
                    const lastUpdate = profile.loyalty_balance_updated_at ? new Date(profile.loyalty_balance_updated_at) : null;
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

                    if (!lastUpdate || lastUpdate < fiveMinutesAgo) {
                        console.log('Fetching fresh balance from Square API');
                        const response = await fetch(
                            `/api/getLoyaltyBalance?loyaltyId=${profile.square_loyalty_id}&userId=${userId}`
                        );
                        
                        if (!response.ok) {
                            throw new Error(`API error: ${response.status}`);
                        }

                        const data = await response.json();
                        console.log('Received new balance:', data.balance);
                        setLoyaltyBalance(data.balance);
                    }
                }
            } catch (error) {
                console.error('Error fetching loyalty balance:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch balance');
            } finally {
                setIsLoading(false);
            }
        }

        fetchLoyaltyBalance();
    }, [userId, supabase]);

    const progressPercentage = loyaltyBalance !== null ? Math.min((loyaltyBalance / maxValue) * 100, 100) : 0;

    const toggleShop = () => setIsShopOpen(!isShopOpen);

    return (
        <div className="w-full max-w-md mx-auto pb-4 pr-4 pl-4 bg-background text-white rounded-lg">
            {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
            ) : error ? (
                <div className="text-red-500">Error: {error}</div>
            ) : (
                <>
                    <div className="animate-in motion-preset-confetti motion-duration-1500">
                        <span className="flex items-center text-2xl font-bold">
                            <CoinIcon />{loyaltyBalance ?? 0}
                        </span>
                    </div>
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white">Token Balance</span>
                        </div>
                        <Progress value={progressPercentage} className="w-full [&>div]:bg-accent bg-muted/45 backdrop-blur-sm rounded-full border border-muted/10" />
                        <div className="relative w-full h-2 mt-1">
                            {tickValues.map((value: number) => {
                                const tickPosition = (value / maxValue) * 100;
                                return (
                                    <div
                                        key={value}
                                        className="absolute transform -translate-x-1/2"
                                        style={{ left: `${tickPosition}%` }}
                                    >
                                        <span className="text-xs text-white">{value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <Button
                            onClick={toggleShop}
                            className="w-full flex justify-between items-center"
                            variant="outline"
                        >
                            <div className="flex items-center gap-2">
                                <ShopIcon />
                                <span className="text-lg">Browse Token Shop</span>
                            </div>
                            {isShopOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                        </Button>
                        {isShopOpen && (
                            <ul className="mt-4 text-background space-y-2">
                                {shopItems.map((item) => (
                                    <li key={item.id} className="flex justify-between items-center p-2 bg-muted/45 backdrop-blur-sm rounded-md border border-muted/10">
                                        <span>{item.name}</span>
                                        <span className="flex items-center font-medium">{item.cost} <CoinIcon /></span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TokenShop;