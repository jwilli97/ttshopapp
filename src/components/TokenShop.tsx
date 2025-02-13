'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CoinIcon from "@/components/icons/coinIcon";
import ShopIcon from "@/components/icons/shopIcon";

interface TinyTokenShopProps {
    loyaltyBalance: number | null;
};

interface ShopItem {
    id: number;
    name: string;
    cost: number;
};

const shopItems: ShopItem[] = [
  { id: 1, name: 'Holiday Joint', cost: 2 },
  { id: 2, name: 'Top Shelf Eighth', cost: 7 },
  { id: 3, name: 'Moonrock Blunt', cost: 8 },
  { id: 4, name: '5 Pack Infused Joints', cost: 12 },
  { id: 5, name: 'Kurvana Pen', cost: 15 },
  { id: 6, name: 'Stizzy Battery/Pod Set', cost: 18 },
  { id: 7, name: 'Sampler Pack', cost: 21 },
];

const maxValue = 50;
const tickValues = Array.from({ length: 11 }, (_, i) => i * 5); // Creates [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

const TokenShop: React.FC<TinyTokenShopProps> = ({ loyaltyBalance }: TinyTokenShopProps) => {
  const [isShopOpen, setIsShopOpen] = useState(false);

  const progressPercentage = loyaltyBalance !== null ? Math.min((loyaltyBalance / maxValue) * 100, 100) : 0;

  const toggleShop = () => setIsShopOpen(!isShopOpen);

  return (
    <div className="w-full max-w-md mx-auto pb-4 pr-4 pl-4 bg-background text-white rounded-lg">
        <div className="animate-in motion-preset-confetti motion-duration-1500">
        <span className="flex items-center text-2xl font-bold"><CoinIcon />{loyaltyBalance}</span>
        </div>
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">Token Balance</span>
            </div>
            <Progress value={progressPercentage} className="w-full [&>div]:bg-accent bg-muted/45 backdrop-blur-sm rounded-full border border-muted/10" />
            <div className="relative w-full h-2 mt-1">
                {tickValues.map((value) => {
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
                    <span className="text-lg">View Token Shop</span>
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
    </div>
  );
};

export default TokenShop;