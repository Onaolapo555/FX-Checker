
"use client";

import { useState, useMemo } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface HistoryProps {
  fromCurrency?: string;
  toCurrency?: string;
}

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";

// Helper to calculate start date
const getStartDate = (range: TimeRange) => {
  const date = new Date();
  switch (range) {
    case "1D":
      date.setDate(date.getDate() - 1);
      break;
    case "1W":
      date.setDate(date.getDate() - 7);
      break;
    case "1M":
      date.setMonth(date.getMonth() - 1);
      break;
    case "3M":
      date.setMonth(date.getMonth() - 3);
      break;
    case "1Y":
      date.setFullYear(date.getFullYear() - 1);
      break;
    case "5Y":
      date.setFullYear(date.getFullYear() - 5);
      break;
  }
  return date.toISOString().split("T")[0];
};

export default function History({
  fromCurrency = "USD",
  toCurrency = "EUR",
}: HistoryProps) {
  const [range, setRange] = useState<TimeRange>("1M");

  const isNGNPair = fromCurrency === "NGN" || toCurrency === "NGN";

  const { data: chartData, isLoading, isError } = useQuery({
    queryKey: ["history", fromCurrency, toCurrency, range],
    queryFn: async () => {
      const startDate = getStartDate(range);
      // Try Frankfurter (ECB) first - will fail for NGN
      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/${startDate}..?from=${fromCurrency}&to=${toCurrency}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.rates && Object.keys(data.rates).length > 0) {
            return Object.entries(data.rates as Record<string, Record<string, number>>).map(([date, rates]) => ({
              date,
              rate: rates[toCurrency!],
            }));
          }
        }
        // If NGN pair, Frankfurter will 404 - fall through to fallback
        if (isNGNPair) throw new Error("Frankfurter does not support NGN");
      } catch (e) {
        if (!isNGNPair) throw e;
        // continue to fallback for NGN
      }

      // Fallback for NGN: generate flat line from current live rate (no ECB history available)
      if (isNGNPair) {
        // Fetch current live rate via fallback API
        let liveRate = 0;
        try {
          const fallbackRes = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency!.toLowerCase()}.json`);
          if (fallbackRes.ok) {
            const fd = await fallbackRes.json();
            liveRate = fd[fromCurrency!.toLowerCase()]?.[toCurrency!.toLowerCase()] ?? 0;
          }
        } catch {}
        if (!liveRate) throw new Error("No history available for NGN pair");
        // Generate synthetic history (last 30 days flat, or range-appropriate points)
        const daysMap: Record<TimeRange, number> = { "1D": 2, "1W": 7, "1M": 30, "3M": 90, "1Y": 12, "5Y": 10 };
        const points = daysMap[range] || 30;
        const synthetic: { date: string; rate: number }[] = [];
        for (let i = points - 1; i >= 0; i--) {
          const d = new Date();
          if (range === "1Y") d.setMonth(d.getMonth() - i);
          else if (range === "5Y") d.setFullYear(d.getFullYear() - Math.floor(i/2));
          else d.setDate(d.getDate() - i);
          synthetic.push({ date: d.toISOString().split("T")[0], rate: liveRate });
        }
        return synthetic;
      }
      throw new Error("No data");
    },
    enabled: Boolean(fromCurrency && toCurrency),
  });

  // const { data: chartData, isLoading } = useQuery({
  //   queryKey: ["history", fromCurrency, toCurrency, range],
  //   queryFn: async () => {
  //     const startDate = getStartDate(range);
  //     const res = await fetch(
  //       `https://api.frankfurter.dev/v1/${startDate}..?from=${fromCurrency}&to=${toCurrency}`
  //     );
  //     const data = await res.json();

  //     return Object.entries(data.rates).map(([date, rates]: [string, any]) => ({
  //       date,
  //       rate: rates[toCurrency],
  //     }));
  //   },
  //   enabled: Boolean(fromCurrency && toCurrency),
  // });

  const stats = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;

    const firstPoint = chartData[0].rate;
    const lastPoint = chartData[chartData.length - 1].rate;
    const diff = lastPoint - firstPoint;
    const percentDiff = (diff / firstPoint) * 100;
    const isUp = diff >= 0;

    // Formatting date for the chart header (e.g., MAY 14 16:00 CET)
    const rawDate = chartData[chartData.length - 1].date;
    const dateObj = new Date(rawDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }).toUpperCase() + " 16:00 CET"; // Hardcoding EOD time to match design

    return {
      open: firstPoint.toFixed(4),
      last: lastPoint.toFixed(4),
      change: Math.abs(diff).toFixed(4),
      percent: Math.abs(percentDiff).toFixed(2),
      isUp,
      formattedDate,
    };
  }, [chartData]);

  return (
    <div className="flex flex-col gap-6 w-full text-white  rounded-xl" suppressHydrationWarning>
      
      {/* Top Bar: Stats & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        
        {/* Stats Flexbox */}
        <div className="stats-grid w-full lg:w-auto pb-2 lg:pb-0">
          <div className="bg-[#171719] border border-[#232324] rounded-xl px-5 py-3 min-w-27.5">
            <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-wider">OPEN</p>
            <p className="text-base font-mono">{stats ? stats.open : "---"}</p>
          </div>
          <div className="bg-[#171719] border border-[#232324] rounded-xl px-5 py-3 min-w-27.5">
            <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-wider">LAST</p>
            <p className="text-base font-mono">{stats ? stats.last : "---"}</p>
          </div>
          <div className="bg-[#171719] border border-[#232324] rounded-xl px-5 py-3 min-w-27.5">
            <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-wider">CHANGE</p>
            <p className={`text-base font-mono ${stats?.isUp ? "up" : "down"}`}>
              {stats ? (stats.isUp ? "+" : "-") : ""}{stats ? stats.change : "---"}
            </p>
          </div>
          <div className="bg-[#171719] border border-[#232324] rounded-xl px-5 py-3 min-w-27.5">
            <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-wider">% CHANGE</p>
            <p className={`text-base font-mono flex items-center gap-2 ${stats?.isUp ? "up" : "down"}`}>
              {stats?.isUp ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
              {stats ? `${stats.isUp ? "+" : "-"}${stats.percent}%` : "---"}
            </p>
          </div>
        </div>

        {/* Range Selector Pill */}
        <div className="flex bg-[#171719] border border-[#232324] rounded-xl p-1 shrink-0">
          {(["1D", "1W", "1M", "3M", "1Y", "5Y"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                range === r
                  ? "bg-[#2f2f30] text-white"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-[#171719] mb-10 border border-[#232324] rounded-2xl p-3 w-full">
        
        {/* Chart Header inside the container */}
        <div className="flex justify-between items-center mb-6 ">
          <h2 className="text-sm font-bold tracking-widest">{fromCurrency}/{toCurrency}</h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest">
            {stats ? `${stats.last} • ${stats.formattedDate}` : "---"}
          </p>
        </div>

        {/* Recharts Implementation */}
        <div className="w-full h-80 ">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : isError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-red-400 text-sm gap-2">
              <span>Failed to load rate history.</span>
              {isNGNPair && <span className="text-gray-500 text-xs">ECB history not available for NGN — showing live rate only</span>}
            </div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No data available.
            </div>
          ) : (
            <>
              {isNGNPair && (
                <div className="mb-2 text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-1.5 text-center">
                  ECB history not available for NGN — chart shows flat live rate (NGN not in Frankfurter/ECB)
                </div>
              )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                {/* Custom Gradient Definition */}
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CEF739" stopOpacity={0.6} />
                    <stop offset="90%" stopColor="#CEF739" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#232324" opacity={0.5} />
                
                <XAxis 
                  dataKey="date" 
                  stroke="#555" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tickFormatter={(tick) => {
                    const d = new Date(tick);
                    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
                  }}
                />
                
                <YAxis 
                  domain={["dataMin", "dataMax"]} 
                  stroke="#555" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(tick) => tick.toFixed(4)}
                />
                <Tooltip
                contentStyle={{
                  backgroundColor: "#171719",
                  borderColor: "#28282b",
                  borderRadius: "0.75rem",
                  color: "#fff",
                }}
                formatter={(value) => [
                  typeof value === "number"
                    ? value.toFixed(4)
                    : Array.isArray(value)
                    ? Number(value[0] ?? 0).toFixed(4)
                    : Number(value ?? 0).toFixed(4),
                  "Rate",
                ]}
                labelStyle={{ color: "#626263", marginBottom: "4px" }}
              />

                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#CEF739"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  activeDot={{ r: 5, fill: '#CEF739', stroke: '#000000', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
