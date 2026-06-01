"use client";
// i18n simplificado — sem dependências externas
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "pt-BR" | "en";

const STORAGE_KEY = "polylink-lang";

const translations: Record<Lang, Record<string, string>> = {
  "pt-BR": {
    // Navbar
    "brand.subtitle": "Dashboard Polymarket",
    "nav.lang.pt": "PT",
    "nav.lang.en": "EN",
    // Home
    "hero.subtitle":
      "Dashboard em tempo real do Polymarket — acompanhe probabilidades, volume e movimentos do mercado.",
    "section.trending": "Mercados em Alta",
    // Search
    "search.placeholder": "Buscar mercados... (ex: bitcoin, trump, eleição)",
    "search.noresults": "Nenhum mercado encontrado para",
    // Trending
    "trending.error":
      "Falha ao carregar mercados em alta. A API do Polymarket pode estar temporariamente indisponível.",
    "trending.empty": "Nenhum mercado em alta no momento.",
    // EventCard
    "event.category.default": "Mercado de Previsão",
    "event.yes": "Sim",
    "event.no": "Não",
    "event.vol": "Vol:",
    "event.closed": "ENCERRADO",
    // MarketDetail
    "detail.nomarkets": "Nenhum mercado neste evento.",
    "detail.back": "← Voltar aos mercados",
    "detail.probability": "Probabilidade Atual",
    "detail.stats": "Estatísticas",
    "detail.volume": "Volume",
    "detail.liquidity": "Liquidez",
    "detail.openInterest": "Posição em Aberto",
    "detail.markets": "Mercados",
    "detail.priceHistory": "Histórico de Preço (Sim)",
    "detail.orderbook": "Livro de Ofertas (Sim)",
    "detail.trades": "Negociações Recentes",
    "detail.closed":
      "Este mercado está encerrado. Nenhum livro de ofertas ou negociação disponível.",
    // OrderBook
    "orderbook.price": "Preço",
    "orderbook.size": "Tam.",
    "orderbook.last": "Último:",
    // RecentTrades
    "trades.side": "Lado",
    "trades.price": "Preço",
    "trades.size": "Tam.",
    "trades.buy": "COMPRA",
    "trades.sell": "VENDA",
  },
  en: {
    "brand.subtitle": "Polymarket Dashboard",
    "nav.lang.pt": "PT",
    "nav.lang.en": "EN",
    "hero.subtitle":
      "Real-time Polymarket prediction market dashboard — track probabilities, volume, and market movements.",
    "section.trending": "Trending Markets",
    "search.placeholder": "Search markets... (e.g. bitcoin, trump, election)",
    "search.noresults": "No markets found for",
    "trending.error":
      "Failed to load trending markets. The Polymarket API may be temporarily unavailable.",
    "trending.empty": "No trending markets at the moment.",
    "event.category.default": "Prediction Market",
    "event.yes": "Yes",
    "event.no": "No",
    "event.vol": "Vol:",
    "event.closed": "CLOSED",
    "detail.nomarkets": "No markets in this event.",
    "detail.back": "← Back to markets",
    "detail.probability": "Current Probability",
    "detail.stats": "Market Stats",
    "detail.volume": "Volume",
    "detail.liquidity": "Liquidity",
    "detail.openInterest": "Open Interest",
    "detail.markets": "Markets",
    "detail.priceHistory": "Price History (Yes)",
    "detail.orderbook": "Orderbook (Yes)",
    "detail.trades": "Recent Trades",
    "detail.closed":
      "This market is closed. No live orderbook or trades available.",
    "orderbook.price": "Price",
    "orderbook.size": "Size",
    "orderbook.last": "Last:",
    "trades.side": "Side",
    "trades.price": "Price",
    "trades.size": "Size",
    "trades.buy": "BUY",
    "trades.sell": "SELL",
  },
};

export function t(lang: Lang, key: string, fallback?: string): string {
  return translations[lang]?.[key] ?? fallback ?? key;
}

// Context
const LangCtx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
}>({
  lang: "pt-BR",
  setLang: () => {},
  t: (key: string) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt-BR");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "en" || stored === "pt-BR") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t: (key: string, fallback?: string) => t(lang, key, fallback) }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
