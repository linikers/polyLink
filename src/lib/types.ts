// Polymarket API types

export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  description?: string;
  outcomes: string; // JSON-encoded
  outcomePrices: string; // JSON-encoded ["0.65","0.35"]
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  marketType: string;
  clobTokenIds: string; // JSON-encoded ["YES_TOKEN","NO_TOKEN"]
  endDate: string;
  category?: string;
  createdAt: string;
}

export interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  volume: number;
  liquidity: number;
  openInterest: number;
  active: boolean;
  closed: boolean;
  category?: string;
  startDate?: string;
  endDate?: string;
  markets: GammaMarket[];
}

export interface SearchResult {
  events: GammaEvent[];
  pagination: { hasMore: boolean; totalResults: number };
}

export interface OrderBookEntry {
  price: string;
  size: string;
}

export interface OrderBook {
  market: string;
  asset_id: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  min_order_size: string;
  tick_size: string;
  last_trade_price: string;
}

export interface PricePoint {
  t: number; // unix timestamp
  p: string; // price
}

export interface PriceHistory {
  history: PricePoint[];
}

export interface Trade {
  side: string;
  size: string;
  price: string;
  timestamp: string;
  title: string;
  slug: string;
  outcome: string;
  transactionHash: string;
  conditionId: string;
}

// Parsed versions (after JSON.parse)
export interface ParsedMarket extends Omit<GammaMarket, "outcomes" | "outcomePrices" | "clobTokenIds"> {
  outcomesParsed: string[];
  outcomePricesParsed: string[];
  clobTokenIdsParsed: string[];
}
