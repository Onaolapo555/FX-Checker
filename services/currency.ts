
import { CurrencyPair } from "@/types/currency";

// Helper to fetch NGN rate from fallback API (supports NGN)
async function fetchNGNRate(): Promise<number | null> {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    if (!res.ok) return null;
    const data = await res.json();
    return data?.usd?.ngn ?? null;
  } catch {
    return null;
  }
}

// Fetch market pairs for your Header ticker
export async function fetchLiveMarkets(): Promise<CurrencyPair[]> {
  // Primary: Frankfurter for ECB pairs
  let frankfurterRates: Record<string, number> | null = null;
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,GBP,JPY,CAD,AUD');
    if (res.ok) {
      const data = await res.json();
      frankfurterRates = data.rates;
    }
  } catch {
    // fall through to fallback
  }

  // Fallback NGN rate
  const ngnRate = await fetchNGNRate();

  if (!frankfurterRates && ngnRate === null) {
    throw new Error('Failed to fetch live market pairs');
  }

  const pairs: CurrencyPair[] = [];

  if (frankfurterRates) {
    pairs.push(
      { symbol: 'EUR/USD', rate: (1 / frankfurterRates.EUR).toFixed(4), change: '+0.18%' },
      { symbol: 'GBP/USD', rate: (1 / frankfurterRates.GBP).toFixed(4), change: '-0.24%' },
      { symbol: 'USD/JPY', rate: frankfurterRates.JPY.toFixed(2), change: '+0.45%' },
      { symbol: 'USD/CAD', rate: frankfurterRates.CAD.toFixed(4), change: '-0.08%' },
      { symbol: 'USD/AUD', rate: frankfurterRates.AUD.toFixed(4), change: '+0.12%' },
    );
  }

  if (ngnRate !== null) {
    pairs.push({ symbol: 'USD/NGN', rate: ngnRate.toFixed(2), change: '+0.31%' });
  }

  return pairs;
}

// Generic rate fetcher that supports NGN via fallback
export async function fetchExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  // Try Frankfurter first (fast, ECB)
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.[to] !== undefined) return data.rates[to] as number;
    }
  } catch {}
  // Fallback to fawazahmed API (supports 170+ currencies including NGN)
  const fallbackRes = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.toLowerCase()}.json`);
  if (!fallbackRes.ok) throw new Error(`Failed to fetch rate ${from}->${to}`);
  const fallbackData = await fallbackRes.json();
  const rate = fallbackData?.[from.toLowerCase()]?.[to.toLowerCase()];
  if (rate === undefined) throw new Error(`Rate not found for ${from}->${to}`);
  return rate as number;
}

export async function fetchBulkRates(base: string, symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  // Try Frankfurter for bulk
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${symbols.join(',')}`);
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        // If all symbols returned, use it. Otherwise supplement with fallback
        const returned = Object.keys(data.rates);
        if (returned.length === symbols.length) return data.rates;
        // Partial: fetch missing via fallback
        const missing = symbols.filter(s => !(s in data.rates));
        if (missing.length > 0) {
          const fallbackRes = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`);
          if (fallbackRes.ok) {
            const fd = await fallbackRes.json();
            const bulk = fd[base.toLowerCase()] || {};
            for (const m of missing) {
              const v = bulk[m.toLowerCase()];
              if (v !== undefined) data.rates[m] = v;
            }
          }
        }
        return data.rates;
      }
    }
  } catch {}
  // Full fallback
  const fallbackRes = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`);
  if (!fallbackRes.ok) throw new Error(`Failed to fetch bulk rates for ${base}`);
  const fd = await fallbackRes.json();
  const bulk = fd[base.toLowerCase()] || {};
  const result: Record<string, number> = {};
  for (const sym of symbols) {
    const v = bulk[sym.toLowerCase()];
    if (v !== undefined) result[sym] = v;
  }
  return result;
}