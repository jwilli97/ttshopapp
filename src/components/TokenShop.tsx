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
    { id: 1, name: 'Joint', cost: 200 },
    { id: 2, name: 'Light Depth Eighth', cost: 400 },
    { id: 3, name: '6 Joint Pack', cost: 800 },
    { id: 4, name: 'Designer Eighth', cost: 1000 },
    { id: 5, name: 'Stiiizy Pen', cost: 1500 }
];


const TokenShop: React.FC<TinyTokenShopProps> = ({ loyaltyBalance }: TinyTokenShopProps) => {

  const [isShopOpen, setIsShopOpen] = useState(false);

  const progressPercentage = loyaltyBalance !== null ? Math.min((loyaltyBalance / 100) * 100, 100) : 0;

  const toggleShop = () => setIsShopOpen(!isShopOpen);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background rounded-lg">
        <div className='flex space-x-2'>
            <div className='mt-2'>
                <ShopIcon />
            </div>
            <h2 className="text-2xl flex items-center font-bold mb-4">Token Shop</h2>
        </div>
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium">Balance:</span>
                <span className="text-xl font-bold">{loyaltyBalance} <CoinIcon /></span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
        </div>
        <div className="border-t pt-4">
            <Button
                onClick={toggleShop}
                className="w-full flex justify-between items-center"
                variant="outline"
            >
            <span>Shop</span>
            {isShopOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </Button>
            {isShopOpen && (
                <ul className="mt-4 space-y-2">
                    {shopItems.map((item) => (
                        <li key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span>{item.name}</span>
                            <span className="font-medium"><CoinIcon /> {item.cost}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );
};

export default TokenShop;