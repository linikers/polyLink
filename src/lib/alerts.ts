"use client";

// Engine de alertas — localStorage + polling

export type AlertType = "whale" | "volume" | "odds" | "opportunity";

export interface AlertRule {
  id: string;
  type: AlertType;
  label: string;
  enabled: boolean;
  threshold: number;
  marketId?: string;
  lastTriggered?: number;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: "info" | "warning" | "high";
  timestamp: number;
  read: boolean;
  marketSlug?: string;
}

const RULES_KEY = "polylink-alert-rules";
const EVENTS_KEY = "polylink-alert-events";
const MAX_EVENTS = 100;

// --- Rules ---
export function loadRules(): AlertRule[] {
  if (typeof window === "undefined") return defaultRules();
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultRules();
}

export function saveRules(rules: AlertRule[]) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function defaultRules(): AlertRule[] {
  return [
    { id: "whale-1", type: "whale", label: "Compra > US$ 10k", enabled: false, threshold: 10000 },
    { id: "volume-1", type: "volume", label: "Aumento de volume > 200%", enabled: false, threshold: 200 },
    { id: "odds-1", type: "odds", label: "Mudança de odds > 10%", enabled: false, threshold: 10 },
    { id: "opportunity-1", type: "opportunity", label: "Edge Score > 80", enabled: true, threshold: 80 },
  ];
}

// --- Events ---
export function loadEvents(): AlertEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveEvents(events: AlertEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
}

export function addEvent(event: Omit<AlertEvent, "id" | "timestamp" | "read">) {
  const events = loadEvents();
  events.unshift({
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    read: false,
  });
  saveEvents(events);
  return events[0];
}

export function markAsRead(eventId: string) {
  const events = loadEvents();
  const ev = events.find((e) => e.id === eventId);
  if (ev) ev.read = true;
  saveEvents(events);
}

export function markAllAsRead() {
  const events = loadEvents();
  events.forEach((e) => (e.read = true));
  saveEvents(events);
}

export function unreadCount(): number {
  return loadEvents().filter((e) => !e.read).length;
}

// --- Cache for previous state (to detect changes) ---
let prevMarkets: Map<string, { volume: number; yesPrice: number }> = new Map();

// --- Alert engine with real Polymarket API ---
// Polls the Gamma API every 30s and checks rules against real data.

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export function startAlertEngine(
  rules: AlertRule[],
  onAlert: (event: AlertEvent) => void
) {
  if (pollingInterval) clearInterval(pollingInterval);

  const tick = async () => {
    const enabled = rules.filter((r) => r.enabled);
    if (enabled.length === 0) return;

    try {
      const { getTopMarketsForAlerts } = await import("@/lib/api");
      const markets = await getTopMarketsForAlerts(50);

      const triggerTypes = new Set(enabled.map((r) => r.type));

      for (const market of markets) {
        const prev = prevMarkets.get(market.id);

        // Odds alert: detect price change > threshold
        if (triggerTypes.has("odds") && prev) {
          const oddsRule = enabled.find((r) => r.type === "odds")!;
          const change = Math.abs(market.yesPrice - prev.yesPrice) * 100;
          if (change >= oddsRule.threshold) {
            onAlert(addEvent({
              ruleId: oddsRule.id,
              type: "odds",
              title: `Odds mudaram — ${market.title.slice(0, 40)}`,
              message: `Probabilidade YES variou ${change.toFixed(1)}% (${(prev.yesPrice * 100).toFixed(0)}% → ${(market.yesPrice * 100).toFixed(0)}%)`,
              severity: change >= 15 ? "high" : "warning",
              marketSlug: market.slug,
            }));
          }
        }

        // Volume alert: detect volume spike > threshold
        if (triggerTypes.has("volume") && prev && prev.volume > 0) {
          const volRule = enabled.find((r) => r.type === "volume")!;
          const volIncrease = ((market.volume - prev.volume) / prev.volume) * 100;
          if (volIncrease >= volRule.threshold) {
            onAlert(addEvent({
              ruleId: volRule.id,
              type: "volume",
              title: `Volume explodiu — ${market.title.slice(0, 40)}`,
              message: `Volume aumentou ${volIncrease.toFixed(0)}% ($${(prev.volume / 1000).toFixed(0)}K → $${(market.volume / 1000).toFixed(0)}K)`,
              severity: "warning",
              marketSlug: market.slug,
            }));
          }
        }

        // Whale alert: detect large orders via CLOB (only for top markets to limit API calls)
        if (triggerTypes.has("whale") && !prev) {
          // On first tick, just collect data. Detection starts on second tick.
        }

        // Update cache
        prevMarkets.set(market.id, {
          volume: market.volume,
          yesPrice: market.yesPrice,
        });
      }

      // Whale: check orderbook for top 10 markets
      if (triggerTypes.has("whale") && markets.length > 0) {
        const whaleRule = enabled.find((r) => r.type === "whale")!;
        try {
          const { getOrderBook } = await import("@/lib/api");
          // Check top 5 liquid markets for large bids/asks
          const topMarkets = markets
            .sort((a, b) => (b.liquidity ?? 0) - (a.liquidity ?? 0))
            .slice(0, 5);

          for (const m of topMarkets) {
            // We need the tokenId — for now, skip real whale detection
            // and focus on volume-based whale signals
            if (m.volume > whaleRule.threshold) {
              onAlert(addEvent({
                ruleId: whaleRule.id,
                type: "whale",
                title: `Grande movimentação — ${m.title.slice(0, 40)}`,
                message: `Volume significativo detectado: $${(m.volume / 1000).toFixed(0)}K`,
                severity: "high",
                marketSlug: m.slug,
              }));
            }
          }
        } catch {
          // Orderbook API may fail, skip whale alerts this tick
        }
      }

      // Opportunity alert: use edge score logic (markets where yesPrice is extreme)
      if (triggerTypes.has("opportunity")) {
        const oppRule = enabled.find((r) => r.type === "opportunity")!;
        for (const market of markets) {
          // Simple heuristic: markets with >80% or <20% may be mispriced
          const edgeCandidate = Math.min(market.yesPrice, 1 - market.yesPrice) < 0.2;
          if (edgeCandidate && market.volume > 10000) {
            const edgeScore = Math.round((1 - Math.min(market.yesPrice, 1 - market.yesPrice) / 0.5) * 100);
            if (edgeScore >= oppRule.threshold) {
              onAlert(addEvent({
                ruleId: oppRule.id,
                type: "opportunity",
                title: `Oportunidade — ${market.title.slice(0, 40)}`,
                message: `Edge Score estimado: ${edgeScore}/100 — YES: ${(market.yesPrice * 100).toFixed(0)}%`,
                severity: edgeScore >= 90 ? "high" : "warning",
                marketSlug: market.slug,
              }));
            }
          }
        }
      }
    } catch (err) {
      console.error("[AlertEngine] API error:", err);
    }
  };

  // Initial tick
  tick();
  pollingInterval = setInterval(tick, 30000);

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    prevMarkets.clear();
  };
}

export function stopAlertEngine() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
