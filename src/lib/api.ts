// Polymarket API client — no auth needed for read-only endpoints

const GAMMA = "https://gamma-api.polymarket.com";
const CLOB = "https://clob.polymarket.com";
const DATA = "https://data-api.polymarket.com";

export const REVALIDATE = 30; // seconds for ISR / server components

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Polymarket API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

function parseJsonField(val: string): unknown {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

// ─── Gamma API ────────────────────────────────────────

export async function searchMarkets(query: string) {
  const data = await fetchJson<{ events: any[]; pagination: any }>(
    `${GAMMA}/public-search?q=${encodeURIComponent(query)}`
  );
  return data;
}

export async function getTrendingEvents(limit = 10, offset = 0) {
  const events = await fetchJson<any[]>(
    `${GAMMA}/events?limit=${limit}&offset=${offset}&active=true&closed=false&order=volume&ascending=false`
  );
  return events;
}

export async function getEventBySlug(slug: string) {
  const events = await fetchJson<any[]>(
    `${GAMMA}/events?slug=${encodeURIComponent(slug)}`
  );
  return events[0] ?? null;
}

export async function getMarketBySlug(slug: string) {
  const markets = await fetchJson<any[]>(
    `${GAMMA}/markets?slug=${encodeURIComponent(slug)}`
  );
  return markets[0] ?? null;
}

export async function getMarketsByTag(tag: string, limit = 20) {
  const markets = await fetchJson<any[]>(
    `${GAMMA}/markets?limit=${limit}&tag=${encodeURIComponent(tag)}&order=volume&ascending=false`
  );
  return markets;
}

// ─── CLOB API ─────────────────────────────────────────

export async function getOrderBook(tokenId: string) {
  return fetchJson<{ bids: any[]; asks: any[]; last_trade_price: string; tick_size: string }>(
    `${CLOB}/book?token_id=${tokenId}`
  );
}

export async function getPrice(tokenId: string) {
  return fetchJson<{ price: string }>(`${CLOB}/price?token_id=${tokenId}&side=buy`);
}

export async function getMidpoint(tokenId: string) {
  return fetchJson<{ mid: string }>(`${CLOB}/midpoint?token_id=${tokenId}`);
}

export async function getPriceHistory(conditionId: string, interval = "all", fidelity = 100) {
  return fetchJson<{ history: { t: number; p: string }[] }>(
    `${CLOB}/prices-history?market=${conditionId}&interval=${interval}&fidelity=${fidelity}`
  );
}

// ─── Data API ─────────────────────────────────────────

export async function getRecentTrades(limit = 20, conditionId?: string) {
  let url = `${DATA}/trades?limit=${limit}`;
  if (conditionId) url += `&market=${conditionId}`;
  return fetchJson<any[]>(url);
}

// ─── Price history with multiple intervals ──────────

export const PRICE_INTERVALS = [
  { id: "7d", label: "7d", fidelity: 50 },
  { id: "1m", label: "1m", fidelity: 100 },
  { id: "all", label: "Max", fidelity: 200 },
] as const;

export type PriceInterval = (typeof PRICE_INTERVALS)[number]["id"];

// ─── Helpers ──────────────────────────────────────────

export function parseMarket(market: any) {
  const outcomes = parseJsonField(market.outcomes) as string[] ?? ["Yes", "No"];
  const outcomePrices = parseJsonField(market.outcomePrices) as string[] ?? [];
  const clobTokenIds = parseJsonField(market.clobTokenIds) as string[] ?? [];
  return { ...market, outcomesParsed: outcomes, outcomePricesParsed: outcomePrices, clobTokenIdsParsed: clobTokenIds };
}

export function fmtPercent(price: string): string {
  return `${(Number(price) * 100).toFixed(1)}%`;
}

export function fmtVolume(vol: number | string): string {
  const v = Number(vol);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

// ─── Real-time data for alerts ───────────────────────

export interface AlertMarketData {
  id: string;
  slug: string;
  title: string;
  category?: string;
  volume: number;
  liquidity?: number;
  yesPrice: number;
  noPrice: number;
  change24h?: number;
}

export async function getTopMarketsForAlerts(limit = 50): Promise<AlertMarketData[]> {
  const events = await fetchJson<any[]>(
    `${GAMMA}/events?limit=${limit}&active=true&closed=false&order=volume&ascending=false`
  );
  return events.map((evt: any) => {
    const market = evt.markets?.[0];
    const p = market ? parseMarket(market) : null;
    return {
      id: evt.id,
      slug: evt.slug,
      title: evt.title,
      category: evt.category,
      volume: evt.volume ? Number(evt.volume) : 0,
      liquidity: evt.liquidity ? Number(evt.liquidity) : 0,
      yesPrice: p ? Number(p.outcomePricesParsed[0] ?? 0) : 0,
      noPrice: p ? Number(p.outcomePricesParsed[1] ?? 0) : 0,
      change24h: evt.priceChange24h ? Number(evt.priceChange24h) : undefined,
    };
  });
}

// ─── Category helpers ───────────────────────────────

export const CATEGORIES = [
  { id: "politics", labelKey: "category.politics" },
  { id: "crypto", labelKey: "category.crypto" },
  { id: "economics", labelKey: "category.economics" },
  { id: "sports", labelKey: "category.sports" },
  { id: "technology", labelKey: "category.technology" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export async function getEventsByCategory(
  category: CategoryId,
  limit = 20,
  offset = 0
): Promise<any[]> {
  return fetchJson<any[]>(
    `${GAMMA}/events?limit=${limit}&offset=${offset}&tag=${category}&active=true&closed=false&order=volume&ascending=false`
  );
}
