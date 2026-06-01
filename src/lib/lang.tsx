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
    "detail.endDate": "Encerramento",
    "detail.priceHistory": "Histórico de Preço (Sim)",
    "detail.orderbook": "Livro de Ofertas (Sim)",
    "detail.trades": "Negociações Recentes",
    "detail.closed":
      "Este mercado está encerrado. Nenhum livro de ofertas ou negociação disponível.",
    // Edge Score
    "edge.title": "Edge Score",
    "edge.subtitle": "Ajuste sua estimativa de probabilidade justa",
    "edge.marketPrice": "Mercado",
    "edge.yourEstimate": "Sua estimativa",
    "edge.edge": "Edge",
    "edge.diff": "Diferença",
    "edge.buyYes": "COMPRAR YES",
    "edge.buyNo": "COMPRAR NO",
    "edge.noEdge": "Sem edge significativo",
    "edge.highEdge": "Edge Alto",
    "edge.estimateLabel": "Probabilidade justa estimada",
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
    // Admin
    "nav.admin": "Admin",
    "admin.dashboard": "Dashboard",
    "admin.favorites": "Favoritos",
    "admin.alerts": "Alertas",
    "admin.whales": "Whales",
    "admin.news": "Notícias",
    "admin.settings": "Configurações",
    "admin.favoritesCount": "Mercados Favoritos",
    "admin.alertsCount": "Alertas Ativos",
    "admin.watchingCount": "Observando",
    "admin.placeholder": "Comece a explorar mercados",
    "admin.placeholderDesc": "Salve mercados como favoritos, crie alertas de preço e gerencie suas preferências aqui.",
    // Categories
    "category.all": "Todos",
    "category.politics": "Política",
    "category.crypto": "Crypto",
    "category.economics": "Economia",
    "category.sports": "Esportes",
    "category.technology": "Tecnologia",
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
    "detail.endDate": "End Date",
    "detail.priceHistory": "Price History (Yes)",
    "detail.orderbook": "Orderbook (Yes)",
    "detail.trades": "Recent Trades",
    "detail.closed":
      "This market is closed. No live orderbook or trades available.",
    // Edge Score
    "edge.title": "Edge Score",
    "edge.subtitle": "Adjust your fair probability estimate",
    "edge.marketPrice": "Market",
    "edge.yourEstimate": "Your estimate",
    "edge.edge": "Edge",
    "edge.diff": "Difference",
    "edge.buyYes": "BUY YES",
    "edge.buyNo": "BUY NO",
    "edge.noEdge": "No significant edge",
    "edge.highEdge": "High Edge",
    "edge.estimateLabel": "Estimated fair probability",
    "orderbook.price": "Price",
    "orderbook.size": "Size",
    "orderbook.last": "Last:",
    "trades.side": "Side",
    "trades.price": "Price",
    "trades.size": "Size",
    "trades.buy": "BUY",
    "trades.sell": "SELL",
    // Admin
    "nav.admin": "Admin",
    "admin.dashboard": "Dashboard",
    "admin.favorites": "Favorites",
    "admin.alerts": "Alerts",
    "admin.whales": "Whales",
    "admin.news": "News",
    "admin.settings": "Settings",
    "admin.favoritesCount": "Favorite Markets",
    "admin.alertsCount": "Active Alerts",
    "admin.watchingCount": "Watching",
    "admin.placeholder": "Start exploring markets",
    "admin.placeholderDesc": "Save markets as favorites, set price alerts, and manage your preferences here.",
    // Categories
    "category.all": "All",
    "category.politics": "Politics",
    "category.crypto": "Crypto",
    "category.economics": "Economics",
    "category.sports": "Sports",
    "category.technology": "Technology",
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
