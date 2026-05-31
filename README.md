# polyLink 🔗

**Real-time Polymarket prediction market dashboard.**

Track probabilities, orderbook depth, price history, and recent trades across prediction markets — all from a clean, dark-themed dashboard built with Next.js and MUI.

## Features

- **Trending Markets** — See the highest-volume prediction markets at a glance
- **Search** — Find any Polymarket market by keyword
- **Market Detail** — Deep dive into probability splits, volume, liquidity, and open interest
- **Price History Chart** — Visualize Yes price movements over time
- **Orderbook** — Real-time buy/sell depth for the Yes outcome
- **Recent Trades** — Live trade feed for any market

## Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [MUI 6](https://mui.com/) (Material UI)
- [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Polymarket Public APIs](https://docs.polymarket.com/api/overview) (read-only, no auth needed)
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/linikers/polyLink)

No environment variables needed — all data comes from Polymarket's public APIs.

## API Sources

- **Gamma API** — Market discovery, search, event details
- **CLOB API** — Real-time prices, orderbook, price history
- **Data API** — Recent trades, open interest

All read-only and publicly accessible.

## CLI Analysis Script

In addition to the web dashboard, polyLink includes a CLI analysis tool:

```bash
node scripts/analyze.mjs trending
node scripts/analyze.mjs search "bitcoin"
node scripts/analyze.mjs market will-donald-trump-win-the-2024-presidential-election
node scripts/analyze.mjs book TOKEN_ID
node scripts/analyze.mjs history CONDITION_ID
node scripts/analyze.mjs trades
```

Great for quick terminal lookups or scripting automated analysis.
