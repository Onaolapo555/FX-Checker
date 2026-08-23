"use client";

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import starImgFill from '../../../public/assets/images/icon-star-filled.svg';
import starImg from '../../../public/assets/images/icon-star.svg';
import { fetchBulkRates } from '@/services/currency';

// Helper to generate flag URL (CDN) - works for NGN -> ng.png
const getFlagUrl = (code: string) => {
  const countryCode = code.slice(0, 2).toLowerCase();
  const finalCode = code === "EUR" ? "eu" : countryCode;
  return `https://flagcdn.com/w40/${finalCode}.png`;
};

interface CompareProps {
    fromCurrency?: string;
    amount?: number | string;
    pinnedCurrencies: string[];
    togglePin: (code: string) => void;
}

const COMPARE_CURRENCIES = [
    { code: 'GBP', name: 'British Pound' },
    { code: 'EUR', name: 'Euro' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'NGN', name: 'Nigerian Naira' },
];

function Compare({ fromCurrency = 'USD', amount = 1000, pinnedCurrencies = [], togglePin = () => {} }: CompareProps){

    const sortedCurrencies = [...COMPARE_CURRENCIES].sort((a, b) => {
        const aPinned = pinnedCurrencies.includes(a.code);
        const bPinned = pinnedCurrencies.includes(b.code);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
    });


    const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;

    const { data: ratesData, isLoading, isError } = useQuery({
        queryKey: ['compareRates', fromCurrency],
        queryFn: async () => {
            const symbols = COMPARE_CURRENCIES.map(c => c.code);
            return fetchBulkRates(fromCurrency!, symbols);
        },
        enabled: Boolean(fromCurrency),
    });

    return (
        <div className='mb-50 border bg-[#171719] p-5 rounded-2xl border-[#131314] text-white'>
            <span className='flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-[#626263]'>
                <h1 className='text-2xl uppercase'>
                    MULTI CURRENCY <span className='text-white font-semibold'>{numericAmount.toLocaleString()} FROM {fromCurrency}</span>
                </h1>
                <p className='text-xl'>{COMPARE_CURRENCIES.length} PAIRS</p>
            </span>

            <div className='mt-5 flex flex-col gap-4'>
                {isLoading ? (
                    <div className='p-8 text-center text-[#626263]'>Loading currency comparison...</div>
                ) : isError ? (
                    <div className='p-8 text-center text-red-400'>Failed to load comparison rates. Try again later.</div>
                ) : numericAmount === 0 ? (
                    <div className='p-8 text-center text-[#626263]'>Enter an amount to compare</div>
                ) : (
                    sortedCurrencies.map((currency) => {
                        const rate = ratesData?.[currency.code] || 0;
                        const convertedValue = rate ? (numericAmount * rate).toFixed(2) : '---';
                        const formattedRate = rate ? rate.toFixed(4) : '---';
                        const isPinned = pinnedCurrencies.includes(currency.code);

                        return (
                            <div 
                                key={currency.code} 
                                className='flex p-4 border-2 justify-between items-center bg-[#202022] border-[#28282b] rounded-2xl hover:border-[#38383d] transition-colors'
                            >
                                <div className='flex items-center gap-5'>
                                    <span>
                                        <img 
                                            className='w-[30px] h-[30px] border rounded-full object-cover' 
                                            src={getFlagUrl(currency.code)} 
                                            alt={`${currency.code} flag`}
                                            width={30}
                                            height={30} 
                                        />
                                    </span>
                                    <span className='flex flex-col'>
                                        <h3 className='text-2xl font-mono font-bold'>{currency.code}</h3>
                                        <p className='text-sm text-[#898989]'>{currency.name}</p>
                                    </span>
                                </div>
                                
                                <div className='flex gap-5 items-center'>
                                    <span className='flex flex-col text-right'>
                                        <h3 className='text-2xl font-mono font-semibold'>{convertedValue}</h3>
                                        <p className='text-sm text-[#898989] font-mono'>@ {formattedRate}</p>
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => togglePin(currency.code)}
                                        className={`border-2 rounded-md flex items-center p-3 cursor-pointer transition-colors ${
                                            isPinned ? 'border-[#CEF739] bg-[#CEF739]/10' : 'border-[#28282b] hover:border-[#404046]'
                                        }`}
                                    >
                                        <Image src={isPinned ? starImgFill : starImg}
                                         alt="star icon" 
                                         className='flex shrink-0'
                                         width={15}
                                         height={15}/>
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

export default Compare;