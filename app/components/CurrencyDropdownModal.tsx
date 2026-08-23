"use client";

import { FaCheck, FaSearch } from "react-icons/fa";

// Helper to generate flag URL from currency code
const getFlagUrl = (code: string) => {
  const countryCode = code.slice(0, 2).toLowerCase();
  const finalCode = code === "EUR" ? "eu" : countryCode;
  return `https://flagcdn.com/w40/${finalCode}.png`;
};

interface DropdownProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredCurrencies: { favorites: [string, string][]; others: [string, string][] };
  selectedCurrency: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export function CurrencyDropdownModal({
  searchQuery,
  setSearchQuery,
  filteredCurrencies,
  selectedCurrency,
  onSelect,
}: DropdownProps) {
  return (
    <div className="absolute right-0 top-12 w-72 max-h-80 bg-[#1A1A1C] border border-[#2f2f30] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Search Input Box */}
      <div className="p-3 border-b border-[#2f2f30] flex items-center gap-2 bg-[#202022]">
        <FaSearch className="text-gray-400 text-xs" />
        <input
          type="text"
          placeholder="Search currency..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none text-xs w-full text-white placeholder-gray-500"
          autoFocus
        />
      </div>

      {/* Options List */}
      <div className="overflow-y-auto flex-1 p-2 divide-y divide-[#232324]">
        {/* FAVORITES SECTION */}
        {filteredCurrencies.favorites.length > 0 && (
          <div className="pb-2">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-2">
              Popular Currencies
            </span>
            {filteredCurrencies.favorites.map(([code, name]) => (
              <CurrencyRow
                key={code}
                code={code}
                name={name}
                isSelected={selectedCurrency === code}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}

        {/* OTHERS SECTION */}
        {filteredCurrencies.others.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-2">
              All Currencies
            </span>
            {filteredCurrencies.others.map(([code, name]) => (
              <CurrencyRow
                key={code}
                code={code}
                name={name}
                isSelected={selectedCurrency === code}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent for each row item inside the selector
function CurrencyRow({
  code,
  name,
  isSelected,
  onSelect,
}: {
  code: string;
  name: string;
  isSelected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(code)}
      className={`w-full text-left flex items-center justify-between p-2 rounded-xl text-xs hover:bg-[#2E2E2E] transition ${
        isSelected ? "bg-[#252528] text-[#CEF739]" : "text-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden pr-2">
        <img
          className="w-4 h-4 rounded-full object-cover shrink-0"
          src={getFlagUrl(code)}
          alt={code}
        />
        <span className="font-bold">{code}</span>
        <span className="text-[11px] text-gray-400 truncate">{name}</span>
      </div>

      {isSelected && <FaCheck className="text-[#CEF739] text-xs shrink-0" />}
    </button>
  );
}