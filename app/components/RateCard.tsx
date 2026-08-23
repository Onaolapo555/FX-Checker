

"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

// Image Imports
import exchangeIcon1 from "@/public/assets/images/icon-exchange-vertical.svg";
import exchangeIcon2 from "@/public/assets/images/icon-exchange.svg";

import { CurrencyInputCard } from "./CurrencyInputCard";
import { fetchExchangeRate } from "@/services/currency";

interface RateCardProps {
  fromCurrency: string;
  toCurrency: string;
  setFromCurrency: (c: string) => void;
  setToCurrency: (c: string) => void;
  pinnedCurrencies: string[];
  togglePin: (code: string) => void;
  addLog: (data: { from: string; to: string; sendAmount: string; receiveAmount: string; rate: string }) => void;
  sendAmount: string;
  setSendAmount: (v: string) => void;
}

// Initial list of popular currencies to prioritize as favorites
const FAVORITE_CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "JPY"];

export default function RateCard({ 
  fromCurrency, 
  toCurrency, 
  setFromCurrency, 
  setToCurrency,
  pinnedCurrencies,
  togglePin,
  addLog,
  sendAmount,
  setSendAmount,
}: RateCardProps) {
  // --- STATE ---
  const [receiveAmount, setReceiveAmount] = useState<string>("");
  const [lastEdited, setLastEdited] = useState<"send" | "receive">("send");

  // Dropdown UI States
  const [isSendDropdownOpen, setIsSendDropdownOpen] = useState(false);
  const [isReceiveDropdownOpen, setIsReceiveDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [isFavorited, setIsFavorited] = useState(false);

  const isCurrentPinned = pinnedCurrencies.includes(toCurrency);

  // --- TANSTACK QUERIES ---

  // 1. Fetch supported currencies list (Frankfurter + NGN injection)
  const { data: currenciesData } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const res = await fetch("https://api.frankfurter.dev/v1/currencies");
      const data = (await res.json()) as Record<string, string>;
      // Inject Nigerian Naira - not in ECB/Frankfurter but supported via fallback API
      if (!data["NGN"]) data["NGN"] = "Nigerian Naira";
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hrs
  });

  // 2. Fetch live exchange rate between selected currencies (supports NGN via fallback)
  const { data: exchangeRate, isLoading, isError: isRateError } = useQuery({
    queryKey: ["exchangeRate", fromCurrency, toCurrency],
    queryFn: async () => {
      return fetchExchangeRate(fromCurrency, toCurrency);
    },
    enabled: Boolean(fromCurrency && toCurrency),
  });

  // --- CALCULATION LOGIC ---
  const computedSend = useMemo(() => {
    if (!exchangeRate) return sendAmount;
    if (lastEdited === "send") return sendAmount;
    const num = parseFloat(receiveAmount);
    return isNaN(num) ? "" : (num / exchangeRate).toFixed(2);
  }, [receiveAmount, exchangeRate, lastEdited, sendAmount]);

  const computedReceive = useMemo(() => {
    if (!exchangeRate) return receiveAmount;
    if (lastEdited === "receive") return receiveAmount;
    const num = parseFloat(sendAmount);
    return isNaN(num) ? "" : (num * exchangeRate).toFixed(2);
  }, [sendAmount, exchangeRate, lastEdited, receiveAmount]);

  // Sync inputs dynamically
  const displaySend = lastEdited === "send" ? sendAmount : computedSend;
  const displayReceive = lastEdited === "receive" ? receiveAmount : computedReceive;

  // Log conversion handler
  const handleSaveToLog = () => {
    const finalSend = displaySend;
    const finalReceive = displayReceive;
    const calculatedRate = Number(finalReceive) / Number(finalSend) || exchangeRate || 0;

    addLog({
      from: fromCurrency,
      to: toCurrency,
      sendAmount: String(finalSend),
      receiveAmount: String(finalReceive),
      rate: calculatedRate.toFixed(4),
    });
  };

  // Swap currencies handler
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Filter and prioritize currencies (Favorites top, others below)
  const filteredCurrencies = useMemo(() => {
    if (!currenciesData) return { favorites: [], others: [] };

    const query = searchQuery.toLowerCase();
    const allEntries = Object.entries(currenciesData).filter(
      ([code, name]) =>
        code.toLowerCase().includes(query) || name.toLowerCase().includes(query)
    );

    const favorites = allEntries.filter(([code]) =>
      FAVORITE_CURRENCIES.includes(code)
    );
    const others = allEntries.filter(
      ([code]) => !FAVORITE_CURRENCIES.includes(code)
    );

    return { favorites, others };
  }, [currenciesData, searchQuery]);

  return (
    <div className="mt-10 m-auto w-[90%] text-white">
      <h1 className="text-2xl font-bold">CHECK THE RATE</h1>

      <main className="mt-5 bg-[#171719] rounded-3xl border border-[#232324]">
        <div className="p-5 flex flex-col md:flex-row gap-5 items-center">
          
          {/* SEND CARD */}
          <CurrencyInputCard
            label="SEND"
            amount={displaySend}
            onAmountChange={(val) => {
              setLastEdited("send");
              setSendAmount(val);
            }}
            currency={fromCurrency}
            isDropdownOpen={isSendDropdownOpen}
            onToggleDropdown={() => {
              setIsSendDropdownOpen(!isSendDropdownOpen);
              setIsReceiveDropdownOpen(false);
            }}
            onCloseDropdown={() => setIsSendDropdownOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredCurrencies={filteredCurrencies}
            onSelectCurrency={(code) => {
              setFromCurrency(code);
              setIsSendDropdownOpen(false);
              setSearchQuery("");
            }}
          />

          {/* SWAP BUTTON */}
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Currencies"
            className="flex justify-center border-2 shrink-0 p-3 rounded-xl bg-[#202022] border-[#232324] hover:bg-[#2E2E2E] transition active:scale-95 cursor-pointer"
          >
            <Image className="md:hidden block" src={exchangeIcon1} alt="swap vertical" />
            <Image className="hidden md:flex" src={exchangeIcon2} alt="swap horizontal" />
          </button>

          {/* RECEIVE CARD */}
          <CurrencyInputCard
            label="RECEIVE"
            amount={displayReceive}
            onAmountChange={(val) => {
              setLastEdited("receive");
              setReceiveAmount(val);
            }}
            currency={toCurrency}
            isDropdownOpen={isReceiveDropdownOpen}
            onToggleDropdown={() => {
              setIsReceiveDropdownOpen(!isReceiveDropdownOpen);
              setIsSendDropdownOpen(false);
            }}
            onCloseDropdown={() => setIsReceiveDropdownOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredCurrencies={filteredCurrencies}
            onSelectCurrency={(code) => {
              setToCurrency(code);
              setIsReceiveDropdownOpen(false);
              setSearchQuery("");
            }}
          />
        </div>

        {/* FOOTER STATS & ACTIONS */}
        <div className="p-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-t border-dashed border-[#202022]">
          <div className="text-center lg:text-left text-sm text-gray-400">
            {isLoading
              ? "Updating rate..."
              : isRateError
                ? "Rate unavailable for this pair"
                : `1 ${fromCurrency} = ${exchangeRate?.toFixed(4) || "..."} ${toCurrency}`}
          </div>

          <div className="m-auto lg:mr-0 flex gap-4 items-center text-xs font-semibold">
            {/* Favorite / Pin button action */}
            <button
  type="button"
  onClick={() => togglePin(toCurrency)}
  className={`border py-3 px-5 rounded-xl transition flex gap-2 items-center cursor-pointer ${
    isCurrentPinned
      ? "bg-[#b8df32] text-black border-[#CEF739]"
      : "bg-transparent text-white border-white hover:bg-white/10"
  }`}>
     {isCurrentPinned ? (
    <AiFillStar size={16} className="text-black" />
    ) : (
     <AiOutlineStar size={16} className="text-white" />
    )}
    {isCurrentPinned ? "FAVOURITED" : "FAVOURITE"}
     </button>
            <button
              type="button"
              onClick={handleSaveToLog}
              className="px-5 py-3 rounded-xl border-[#CEF739] text-[#CEF739] border hover:bg-[#CEF739]/10 transition cursor-pointer atall outline-0 focus-visible:outline-2 focus-visible:outli-[#CEF739] focus-visible:outline-offset-3"
            >
              LOG CONVERSION
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

