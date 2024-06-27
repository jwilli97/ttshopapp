'use client';

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import CoinIcon from "./icons/coinIcon";

interface TinyTokenShopProps {
    loyaltyBalance: number | null;
}

const TinyTokenShop: React.FC<TinyTokenShopProps> = ({ loyaltyBalance }) => {

    const [showShop, setShowShop] = useState<boolean>(false);

    const toggleShop = (): void => {
        setShowShop(!showShop);
    }

    // Calculate progress bar value based on loyalty balance (currently assuming max = 100)
    const progressPercentage = loyaltyBalance ? Math.min((loyaltyBalance / 100) * 100, 100) : 0;

    return (
        <div className="w-96">
            <div>
                <p className="mb-0.5">Token Balance</p>
            </div>
            <div className="flex flex-row align-left items-center mb-2">
                <CoinIcon />
                <p className="ml-1">{loyaltyBalance !== null ? loyaltyBalance : 'Loading your tokens...'}</p>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-0.5" />
            <div className="flex flex-row space-x-20">
                <p className="text-xs font-thin">0</p>
                <p className="text-xs font-thin">25</p>
                <p className="text-xs font-thin">50</p>
                <p className="text-xs font-thin">75</p>
                <p className="text-xs font-thin">100</p>
            </div>
            <div className="mt-2">
                <div className="flex flex-row align-left items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF15C" className="size-5">
                        <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
                        <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clipRule="evenodd" />
                    </svg>
                    <p className="hover:font-bold cursor-pointer ml-1 mr-0.5" onClick={toggleShop}>Tiny Token Shop</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </div>
                {showShop && (
                    <div className="mt-4 p-4 border rounded shadow bg-primary">
                       <div className="flex flex-row space-x-16 ml-8 mt-2">
                            <div className="flex flex-col">
                                <div className="flex flex-row">
                                <CoinIcon />
                                <p className="ml-1 mb-1">200</p>
                                </div>
                                <div className="flex flex-row">
                                <CoinIcon />
                                <p className="ml-1 mb-1">400</p>
                                </div>
                                <div className="flex flex-row">
                                <CoinIcon />
                                <p className="ml-1 mb-1">800</p>
                                </div>
                                <div className="flex flex-row">
                                <CoinIcon />
                                <p className="ml-1 mb-1">1000</p>
                                </div>
                                <div className="flex flex-row">
                                <CoinIcon />
                                <p className="ml-1 mb-1">1500</p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="mb-1 font-bold">Joint</p>
                                <p className="mb-1 font-bold">Light-Depth Eighth</p>
                                <p className="mb-1 font-bold">6 Joint Pack</p>
                                <p className="mb-1 font-bold">Designer Eighth</p>
                                <p className="mb-1 font-bold">Stiiizy Pen</p>
                            </div>
                       </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TinyTokenShop;
