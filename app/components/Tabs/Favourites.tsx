
"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import starImgFill from '../../../public/assets/images/icon-star-filled.svg';
import ArrowRight from '../../../public/assets/images/icon-arrow-right.svg';
import { fetchBulkRates } from '@/services/currency';

interface FavouritesProps {
    fromCurrency?: string;
    pinnedCurrencies: string[];
    togglePin: (code: string) => void;
}

// const ALL_CURRENCY_DETAILS: Record<string, { name: string }> = {
//     GBP: { name: 'British Pound' },
//     EUR: { name: 'Euro' },
//     CAD: { name: 'Canadian Dollar' },
//     JPY: { name: 'Japanese Yen' },
//     AUD: { name: 'Australian Dollar' },
//     CHF: { name: 'Swiss Franc' },
//     CNY: { name: 'Chinese Yuan' },
//     NZD: { name: 'New Zealand Dollar' },
// };

function Favourites({ fromCurrency = 'USD', pinnedCurrencies, togglePin }: FavouritesProps) {
    // Fetch live rates specifically for the pinned items (supports NGN via fallback)
    const { data: ratesData, isLoading, isError } = useQuery({
        queryKey: ['favouriteRates', fromCurrency, pinnedCurrencies],
        queryFn: async () => {
            if (pinnedCurrencies.length === 0) return {};
            return fetchBulkRates(fromCurrency!, pinnedCurrencies);
        },
        enabled: Boolean(fromCurrency && pinnedCurrencies.length > 0),
    });

    // bg-[#171719]
    return (
        <div className='mb-50 border bg-[#171719]  p-5 rounded-2xl border-[#131314] text-white '>
            <div className='flex gap-2 flex-row justify-between items-center'>
                <h1 className='text-2xl font-semibold uppercase'>Pinned pairs</h1>
                <p className='text-xl text-[#626263]'>{pinnedCurrencies.length} FAVOURITES</p>
            </div>
 
            {/* Cards Box Container */}
            <div className='mt-5 flex flex-col gap-4 '>
                {isLoading && pinnedCurrencies.length > 0 ? (
                    <div className='p-8 text-center text-[#626263]'>Loading favourites...</div>
                ) : isError ? (
                    <div className='p-8 text-center text-red-400 rounded-2xl'>Failed to load favourite rates.</div>
                ) :
                 pinnedCurrencies.length === 0 ? (
                    <div  className='p-8 text-center text-[#626263] rounded-2xl'>
                        <h1 className="text-2xl text-white mb-15
                        "> No pinned pairs yet.</h1>
                        <p>Pin a pair to track its rate here. Tap the star icon on any coversion or camparison row</p>
                    </div>
                ) :
                 (
                    pinnedCurrencies.map((code) => {
                        const rate = ratesData?.[code] || 0;
                        const formattedRate = rate ? rate.toFixed(4) : '---';

                        return (
                            <div key={code} className='flex p-4 border-2 justify-between items-center bg-[#202022] border-[#28282b] rounded-2xl'>
                                <div className='flex items-center gap-5 text-2xl font-mono font-bold'>
                                    <span>{fromCurrency}</span>
                                    <span>
                                        <Image src={ArrowRight} alt="arrow" />
                                    </span>
                                    <span>{code}</span>
                                </div>
                                 
                                <div className='flex gap-5 items-center'>
                                    <span className='flex flex-col text-right'>
                                        <h3 className='text-2xl font-mono font-semibold'>{formattedRate}</h3>
                                        <p className='text-sm text-[#626263] font-mono'>Live Rate</p>
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => togglePin(code)}
                                        className='border-2 border-[#CEF739] bg-[#CEF739]/10 rounded-md flex items-center p-3 cursor-pointer hover:bg-[#CEF739]/20 transition-colors'
                                    >
                                        <Image src={starImgFill} alt="unpin" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Favourites;