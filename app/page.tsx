

"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import RateCard from "./components/RateCard";
import Tabs from "./components/Tabs/AllTab";
import { LogItem } from "./components/Tabs/Log";

export default function Home() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [sendAmount, setSendAmount] = useState("1000");

  // Hydration-safe: use defaults initially, hydrate from localStorage after mount
  const [activeTab, setActiveTab] = useState<string>("compare");
  const [pinnedCurrencies, setPinnedCurrencies] = useState<string[]>(["GBP"]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state once on mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedTab = localStorage.getItem("fx_last_tab");
    if (savedTab) setActiveTab(savedTab);
    const savedPinned = localStorage.getItem("fx_pinned");
    if (savedPinned) {
      try { 
        setPinnedCurrencies(JSON.parse(savedPinned)); 
      } catch {}
    }
    const savedLogs = localStorage.getItem("fx_logs");
    if (savedLogs) {
      try { 
        setLogs(JSON.parse(savedLogs)); 
      } catch {}
    }
    setIsHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save states to localStorage when they change (after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("fx_last_tab", activeTab);
  }, [activeTab, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("fx_pinned", JSON.stringify(pinnedCurrencies));
  }, [pinnedCurrencies, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("fx_logs", JSON.stringify(logs));
  }, [logs, isHydrated]);

  const togglePin = (code: string) => {
    setPinnedCurrencies((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const addLog = (conversionData: {
    from: string;
    to: string;
    sendAmount: string;
    receiveAmount: string;
    rate: string;
  }) => {
    const newEntry = {
      id: Date.now().toString(),
      ...conversionData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const clearLogs = () => setLogs([]);
  const removeLog = (id: string) => setLogs((prev) => prev.filter(log => log.id !== id));

  return (
    <main>
      <Header />
      
      <RateCard 
        fromCurrency={fromCurrency} 
        toCurrency={toCurrency}
        setFromCurrency={setFromCurrency}
        setToCurrency={setToCurrency}
        pinnedCurrencies={pinnedCurrencies}
        togglePin={togglePin}
        addLog={addLog}
        sendAmount={sendAmount}
        setSendAmount={setSendAmount}
      />

      <Tabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fromCurrency={fromCurrency} 
        toCurrency={toCurrency}
        amount={sendAmount}
        pinnedCurrencies={pinnedCurrencies}
        togglePin={togglePin}
        logs={logs}
        clearLogs={clearLogs}
        removeLog={removeLog}
      />
    </main>
  );
}