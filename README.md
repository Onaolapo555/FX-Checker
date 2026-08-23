# FX Checker — Foreign Exchange Checker

Live currency converter with rate history, multi-currency compare, favorites, and conversion log.

![Preview](./frontend-code/preview.jpg)

> Built for the [Frontend Mentor FX Checker challenge](https://www.frontendmentor.io/challenges/foreign-exchange-currency-converter). Converts between currencies using live ECB rates, with a fallback API for extended currencies like Nigerian Naira (NGN).

---

## What it does

A single-page-first app to check, convert, and track foreign exchange rates without an account.

**Core flow:** Enter amount → pick SEND / RECEIVE currencies → see live rate `1 USD = 0.8547 EUR` update as you type → swap, favorite, or log the conversion.

## What problem it solves

*   **Stale rates** — pulls live EOD rates from the European Central Bank (ECB) via Frankfurter, not hard-coded tables.
*   **Too many tabs** — compare one amount across 9 currencies at once instead of converting one-by-one.
*   **Lost context** — pinned favorites and conversion log persist in `localStorage`, so your pairs survive reloads.
*   **No NGN elsewhere** — ECB doesn't cover NGN. This project adds NGN (Nigerian Naira) via a fallback API so `USD ↔ NGN`, `EUR ↔ NGN`, `GBP ↔ NGN` all work.
*   **History without guesswork** — 1D / 1W / 1M / 3M / 1Y / 5Y chart shows open, last, absolute and % change.

Perfect for travelers, freelancers, remote teams, and small businesses pricing in multiple currencies.

---

## Features

### Converter
- Real-time conversion as you type (bidirectional: edit SEND or RECEIVE)
- Searchable currency picker grouped as **Popular** + **All Currencies** with flag, code, name, and selected check
- Live pair rate footer, swap button, favorite toggle

### Live Markets Ticker
- Scrolling ticker in header: `EUR/USD`, `GBP/USD`, `USD/JPY`, `USD/CAD`, `USD/AUD`, `USD/NGN` with rates from live APIs

### Rate History
- Area line chart (Recharts) with gradient, grid, tooltip
- Range switch: 1D, 1W, 1M, 3M, 1Y, 5Y
- Stats: OPEN / LAST / CHANGE / % CHANGE. For NGN pairs shows live-rate flat line with note (ECB has no history for NGN)

### Compare
- Converts your SEND amount into 9 currencies at once (GBP, EUR, CAD, JPY, AUD, CHF, CNY, NZD, **NGN**) with reference rate `@ 0.8547`
- Pin/unpin rows — pinned items sort to top, sync to Favorites

### Favorites
- Pinned pairs list with live rate, updated when base currency changes
- Unpin with star button

### Conversion Log
- Every **LOG CONVERSION** creates an entry: time, pair `USD → NGN`, send/receive amounts, rate
- Delete single entry or **CLEAR ALL**

### Persistence & UX
- `localStorage`: `fx_last_tab`, `fx_pinned`, `fx_logs` (hydration-safe, no SSR mismatch)
- Responsive: desktop toggle tabs / mobile select, hover & focus-visible states (`#CEF739` ring), keyboard navigable
- Flags via `flagcdn.com/w40/{code}.png` (`EUR → eu`, `NGN → ng`)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.10 (App Router), React 19.2.4, TypeScript 5 |
| Styling | Tailwind CSS 4, custom `globals.css` |
| Data | TanStack Query 5.101 (caching, 5m stale, 24h for currency list) |
| Chart | Recharts 3.10 (ResponsiveContainer + AreaChart) |
| Icons | react-icons, local SVGs in `public/assets` |
| APIs | `api.frankfurter.dev/v1` (ECB) + `cdn.jsdelivr.net/npm/@fawazahmed0/currency-api` (fallback for NGN / 170+ currencies) |

No API key, no backend.

---

## Quick Start

**Prereqs:** Node.js 18+ and npm.

```bash
# 1. Clone
git clone <your-repo-url>
cd foreign-exchnage-checker

# 2. Install
npm install

# 3. Run dev server
npm run dev
# open http://localhost:3000

# 4. Build & preview production
npm run build
npm start

# 5. Lint
npm run lint
```

No `.env` required.

---

## How It Works

**Rates:**
- `GET /v1/currencies` → picker list (+ injected `NGN: "Nigerian Naira"` in `app/components/RateCard.tsx`)
- `GET /v1/latest?base=USD&symbols=EUR` → single pair (converter + favorites)
- `GET /v1/latest?base=USD&symbols=GBP,EUR,...` → bulk (compare)
- `GET /v1/2024-01-01..?from=USD&to=EUR` → time series (history)

If Frankfurter returns 404 or missing symbol (e.g., NGN), `services/currency.ts:fetchExchangeRate()` and `fetchBulkRates()` automatically retry the fawazahmed CDN:

```ts
// fallback example
fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`)
// -> { usd: { ngn: 1350.12, eur: 0.856, ... } }
```

**State:** `app/page.tsx` lifts `fromCurrency`, `toCurrency`, `sendAmount`, `activeTab`, `pinnedCurrencies`, `logs`. Saves to `localStorage` after hydration. `Providers.tsx` creates one `QueryClient` per session.

**Flags:** `CurrencyInputCard.tsx` + `CurrencyDropdownModal.tsx` + `Compare.tsx` all use `code.slice(0,2).toLowerCase()` → `ng` for NGN.

---

## Project Structure

```
app/
  page.tsx                 # orchestrator: state + localStorage + layout
  layout.tsx               # Geist fonts, Providers
  globals.css              # Tailwind + ticker animation
  components/
    Header.tsx             # logo + live markets ticker
    RateCard.tsx           # converter (SEND/RECEIVE + swap + fav + log)
    CurrencyInputCard.tsx  # amount input + picker button + dropdown
    CurrencyDropdownModal.tsx # search + Popular/All list
    Providers.tsx          # TanStack Query provider
    Tabs/
      AllTab.tsx           # mobile select / desktop tabs router
      History.tsx          # chart + range + stats (NGN fallback)
      Compare.tsx          # multi-currency list (9 incl. NGN)
      Favourites.tsx       # pinned pairs
      Log.tsx              # conversion history
services/
  currency.ts              # fetchLiveMarkets, fetchExchangeRate, fetchBulkRates + NGN fallback
types/
  currency.ts              # CurrencyPair
public/assets/
  images/                  # logos, icons, flags
frontend-code/             # original FEM challenge brief + preview.jpg
designs/                   # Figma exports
```

---

## Adding a New Currency

Example: adding NGN (already done) — repeat for any other:

1.  **Picker:** Inject after Frankfurter fetch in `RateCard.tsx`:
    ```ts
    const data = await res.json() as Record<string,string>;
    if (!data["NGN"]) data["NGN"] = "Nigerian Naira";
    return data;
    ```
    Add to `FAVORITE_CURRENCIES = ["USD","EUR","GBP","NGN",...]` to show under Popular.

2.  **Converter / Compare / Favorites:** No extra work — they call `fetchExchangeRate()` / `fetchBulkRates()` which already fallback to fawazahmed for non-ECB codes.

3.  **Ticker:** Add `USD/NGN` in `services/currency.ts:fetchLiveMarkets()` (already done via `fetchNGNRate()`).

4.  **Compare list:** Add to `COMPARE_CURRENCIES` in `Compare.tsx`.

5.  **Flags:** Works automatically if `flagcdn.com/w40/{cc}.png` exists (`NGN -> ng.png`). EUR needs `eu` override (already handled).

To add, say, `KES` (Kenyan Shilling): inject `KES`, add to `COMPARE_CURRENCIES`, done — fallback handles rates.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build + type check |
| `npm run start` | Serve built app |
| `npm run lint` | ESLint (next/core-web-vitals) |

---

## Data & Limitations

- Frankfurter covers 30 ECB currencies only (AUD–ZAR). NGN, KES, GHS, etc. come from fallback.
- Frankfurter history `/{start}..` has no NGN → History shows flat live-rate line with warning, not empty error.
- Ticker `% change` is currently mock (`+0.18%`) — replace with real 24h calc if needed.
- `localStorage` is per-browser, no cross-device sync. Log is session-private.

---

## Deployment

Any static host works. Recommended:

```bash
npm run build
# Vercel, Netlify, or GitHub Pages (next export if needed)
```

Works on Vercel with zero config.

---

## Roadmap

- [ ] Real 24h change calculation for ticker (compare `latest` vs `latest -1 day`)
- [ ] Light theme toggle
- [ ] URL persistence for `?from=USD&to=NGN&amount=1000` shareable links
- [ ] CSV export for log
- [ ] Keyboard shortcuts (focus search, swap, range switch)

---

## Acknowledgments

- [Frankfurter API](https://frankfurter.dev) — free ECB rates, no key
- [fawazahmed0/currency-api](https://github.com/fawazahmed0/currency-api) — 170+ currencies fallback incl. NGN
- [Frontend Mentor](https://www.frontendmentor.io/challenges/foreign-exchange-currency-converter) for the challenge + Figma
- Flags by [flagcdn.com](https://flagcdn.com)

## License

MIT — use, modify, and share freely.
