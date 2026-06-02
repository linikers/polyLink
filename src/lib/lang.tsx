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
    "admin.arbitrage": "Arbitragem",
    "admin.opportunities": "Oportunidades",
    "admin.portfolio": "Portfolio",
    "admin.settings": "Configurações",
    "admin.favoritesCount": "Mercados Favoritos",
    "admin.alertsCount": "Alertas Ativos",
    "admin.watchingCount": "Observando",
    "admin.placeholder": "Comece a explorar mercados",
    "admin.placeholderDesc": "Salve mercados como favoritos, crie alertas de preço e gerencie suas preferências aqui.",
    // Intelligence Score
    "intel.title": "Intelligence Score",
    "intel.subtitle": "Score composto — quanto mais alto, mais confiável é o mercado",
    "intel.score": "Score",
    "intel.liquidity": "Liquidez",
    "intel.volume": "Volume",
    "intel.volatility": "Volatilidade",
    "intel.whale": "Atividade Whale",
    "intel.edge": "Edge Score",
    "intel.news": "Relevância Notícias",
    "intel.edgeLabel": "Sua estimativa (Edge Score manual)",
    "intel.edgeDesc": "Ajuste o slider para estimar a probabilidade justa",
    "intel.marketPrice": "Mercado",
    "intel.yourGuess": "Seu palpite",
    "intel.recYes": "📈 Comprar YES",
    "intel.recNo": "📉 Comprar NO",
    "intel.edgeLabel2": "de Edge",
    // Portfolio
    "portfolio.title": "Portfolio",
    "portfolio.add": "Nova Posição",
    "portfolio.addTitle": "Registrar Posição",
    "portfolio.totalInvested": "Investido",
    "portfolio.pnl": "P&L",
    "portfolio.pnlPercent": "ROI",
    "portfolio.winRate": "Win Rate",
    "portfolio.totalTrades": "Trades",
    "portfolio.openPositions": "Abertas",
    "portfolio.noOpen": "Nenhuma posição aberta. Clique em \"Nova Posição\" para começar.",
    "portfolio.noClosed": "Nenhuma posição fechada ainda.",
    "portfolio.closed": "Fechadas",
    "portfolio.market": "Mercado",
    "portfolio.side": "Lado",
    "portfolio.entryPrice": "Entrada",
    "portfolio.qty": "Qtd",
    "portfolio.invested": "Valor",
    "portfolio.date": "Data",
    "portfolio.actions": "Ações",
    "portfolio.close": "Fechar",
    "portfolio.entry": "Entrada",
    "portfolio.exit": "Saída",
    "portfolio.marketTitle_field": "Título do Mercado",
    "portfolio.entryPrice_field": "Preço de Entrada (0-1)",
    "portfolio.qty_field": "Quantidade de shares",
    "portfolio.category_field": "Categoria",
    "portfolio.category_placeholder": "opcional",
    "portfolio.exitPrice_field": "Preço de Saída (0-1)",
    "portfolio.cancel": "Cancelar",
    "portfolio.confirm": "Adicionar",
    "portfolio.confirmClose": "Fechar Posição",
    "portfolio.closeTitle": "Fechar Posição",
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
    "admin.arbitrage": "Arbitrage",
    "admin.opportunities": "Opportunities",
    "admin.portfolio": "Portfolio",
    "admin.settings": "Settings",
    "admin.favoritesCount": "Favorite Markets",
    "admin.alertsCount": "Active Alerts",
    "admin.watchingCount": "Watching",
    "admin.placeholder": "Start exploring markets",
    "admin.placeholderDesc": "Save markets as favorites, set price alerts, and manage your preferences here.",
    // Intelligence Score
    "intel.title": "Intelligence Score",
    "intel.subtitle": "Composite score — higher is more reliable",
    "intel.score": "Score",
    "intel.liquidity": "Liquidity",
    "intel.volume": "Volume",
    "intel.volatility": "Volatility",
    "intel.whale": "Whale Activity",
    "intel.edge": "Edge Score",
    "intel.news": "News Relevance",
    "intel.edgeLabel": "Your estimate (Manual Edge Score)",
    "intel.edgeDesc": "Adjust the slider to estimate fair probability",
    "intel.marketPrice": "Market",
    "intel.yourGuess": "Your guess",
    "intel.recYes": "📈 Buy YES",
    "intel.recNo": "📉 Buy NO",
    "intel.edgeLabel2": "Edge",
    // Portfolio
    "portfolio.title": "Portfolio",
    "portfolio.add": "New Position",
    "portfolio.addTitle": "Register Position",
    "portfolio.totalInvested": "Invested",
    "portfolio.pnl": "P&L",
    "portfolio.pnlPercent": "ROI",
    "portfolio.winRate": "Win Rate",
    "portfolio.totalTrades": "Trades",
    "portfolio.openPositions": "Open",
    "portfolio.noOpen": "No open positions. Click \"New Position\" to start.",
    "portfolio.noClosed": "No closed positions yet.",
    "portfolio.closed": "Closed",
    "portfolio.market": "Market",
    "portfolio.side": "Side",
    "portfolio.entryPrice": "Entry",
    "portfolio.qty": "Qty",
    "portfolio.invested": "Value",
    "portfolio.date": "Date",
    "portfolio.actions": "Actions",
    "portfolio.close": "Close",
    "portfolio.entry": "Entry",
    "portfolio.exit": "Exit",
    "portfolio.marketTitle_field": "Market Title",
    "portfolio.entryPrice_field": "Entry Price (0-1)",
    "portfolio.qty_field": "Share Quantity",
    "portfolio.category_field": "Category",
    "portfolio.category_placeholder": "optional",
    "portfolio.exitPrice_field": "Exit Price (0-1)",
    "portfolio.cancel": "Cancel",
    "portfolio.confirm": "Add",
    "portfolio.confirmClose": "Close Position",
    "portfolio.closeTitle": "Close Position",
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
