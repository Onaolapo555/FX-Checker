"use client";

import History from './History';
import Compare from './Compare';
import Favourites from './Favourites';
import Log from './Log';
import { LogItem } from './Log';

// Shared tab types
export type TabType = 'history' | 'compare' | 'favorites' | 'log';


interface TabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    fromCurrency?: string;
    toCurrency?: string;
    amount?: string | number;
    pinnedCurrencies: string[];
    togglePin: (code: string) => void;
    logs?: LogItem[];
    clearLogs?: () => void;
    removeLog?: (id: string) => void;
}

const TABS: { id: TabType; label: string }[] = [
  { id: 'history', label: 'HISTORY' },
  { id: 'compare', label: 'COMPARE' },
  { id: 'favorites', label: 'FAVOURITES' },
  { id: 'log', label: 'LOG' },
];

export default function Tabs({ 
    activeTab, 
    setActiveTab, 
    fromCurrency, 
    toCurrency, 
    amount = "1000",
    pinnedCurrencies, 
    togglePin, 
    logs = [], 
    clearLogs = () => {}, 
    removeLog = () => {} 
}: TabsProps) {
  return (
    <div className="w-[90%] m-auto mt-10"  suppressHydrationWarning>

      {/* 1. Mobile View: Custom Styled Select Box */}
      <div className="block md:hidden">
        <label htmlFor="forex-tabs" className="sr-only">Select View</label>
        <div className="text-white px-3 bg-[#171719] rounded-2xl border-[#232324] border focus-within:ring-2 focus-within:ring-[#CEF739] font-medium">
          <select
            id="forex-tabs"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full py-3.5 focus:outline-none bg-transparent rounded-2xl text-sm font-semibold cursor-pointer"
          >
            {TABS.map((tab) => (
              <option key={tab.id} value={tab.id} className="bg-[#171719] text-white">
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Desktop View: Styled Toggle Bar */}
      <div className="hidden md:flex items-center justify-between border-b border-[#232324]">
        <div className="flex space-x-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold text-xs tracking-wider transition-all duration-200 border-b-2 rounded-t-lg cursor-pointer ${
                  isActive
                    ? 'border-[#CEF739] text-[#CEF739] bg-[#171719]/40'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-[#171719]/20'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Conditional Content Panel */}
      <div className="mt-6 text-white">
        {activeTab === 'history' && (
          <History fromCurrency={fromCurrency} toCurrency={toCurrency} />
        )}
        {activeTab === 'compare' && (
          <Compare fromCurrency={fromCurrency} amount={amount} pinnedCurrencies={pinnedCurrencies} togglePin={togglePin} />
        )}
        {activeTab === 'favorites' && (
          <Favourites fromCurrency={fromCurrency} pinnedCurrencies={pinnedCurrencies} togglePin={togglePin} />
        )}
        {activeTab === 'log' && (
          <Log logs={logs} clearLogs={clearLogs} removeLog={removeLog} />
        )}
      </div>
    </div>
  );
}