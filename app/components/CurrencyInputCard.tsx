"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import chevronDown from "@/public/assets/images/icon-chevron-down.svg";
import { CurrencyDropdownModal } from "./CurrencyDropdownModal";

// Helper to generate flag URL from currency code
const getFlagUrl = (code: string) => {
  const countryCode = code.slice(0, 2).toLowerCase();
  const finalCode = code === "EUR" ? "eu" : countryCode;
  return `https://flagcdn.com/w40/${finalCode}.png`;
};

interface CurrencyInputCardProps {
  label: string;
  amount: string;
  onAmountChange: (value: string) => void;
  currency: string;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onCloseDropdown: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredCurrencies: { favorites: [string, string][]; others: [string, string][] };
  onSelectCurrency: (code: string) => void;
}

export function CurrencyInputCard({
  label,
  amount,
  onAmountChange,
  currency,
  isDropdownOpen,
  onToggleDropdown,
  onCloseDropdown,
  searchQuery,
  setSearchQuery,
  filteredCurrencies,
  onSelectCurrency,
}: CurrencyInputCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isDropdownOpen) {
          onCloseDropdown();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, onCloseDropdown]);

  return (
    <div ref={containerRef} className="w-full border-2 rounded-3xl bg-[#202022] border-[#232324] p-4 relative">
      <h1 className="text-xl text-gray-400 font-medium">{label}</h1>
      <div className="flex justify-between items-center mt-5 gap-4">
        <input
          className="rounded-xl text-4xl w-[50%] bg-transparent outline-none font-bold"
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />

        {/* Currency Selector Container */}
        <div className="relative">
          <button
            type="button"
            onClick={onToggleDropdown}
            className="border p-2 flex gap-3 items-center rounded-xl bg-[#2E2E2E] border-[#2f2f30] hover:bg-[#383838] transition cursor-pointer"
          >
            <img
              className="w-5 h-5 rounded-full object-cover"
              src={getFlagUrl(currency)}
              alt={currency}
            />
            <span className="font-semibold">{currency}</span>
            <Image src={chevronDown} alt="chevron down" width={12} height={12} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu safely placed outside the inner flex layout */}
      {isDropdownOpen && (
        <CurrencyDropdownModal
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredCurrencies={filteredCurrencies}
          selectedCurrency={currency}
          onSelect={onSelectCurrency}
          onClose={onCloseDropdown}
        />
      )}
    </div>
  );
}