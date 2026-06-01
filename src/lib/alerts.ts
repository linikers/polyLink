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

// --- Simulated alert engine ---
// For now, generates demo alerts to test the UI.
// In the future, replace with real polling from Polymarket API.

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export function startAlertEngine(
  rules: AlertRule[],
  onAlert: (event: AlertEvent) => void
) {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(() => {
    const enabled = rules.filter((r) => r.enabled);
    if (enabled.length === 0) return;

    // Demo: simulate random alerts every cycle
    // Replace with real API calls in production
    const demoAlerts: Record<AlertType, () => Omit<AlertEvent, "id" | "timestamp" | "read"> | null> = {
      whale: () => ({
        ruleId: "whale-1",
        type: "whale",
        title: "Grande movimentação detectada",
        message: `Wallet 0x${Math.random().toString(36).slice(2, 8)}... comprou YES — Valor: US$ ${(Math.random() * 50000 + 10000).toFixed(0)}`,
        severity: "high" as const,
        marketSlug: undefined,
      }),
      volume: () => ({
        ruleId: "volume-1",
        type: "volume",
        title: "Volume em alta",
        message: `Volume aumentou ${(Math.random() * 300 + 150).toFixed(0)}% nas últimas 24h`,
        severity: "warning" as const,
        marketSlug: undefined,
      }),
      odds: () => ({
        ruleId: "odds-1",
        type: "odds",
        title: "Odds mudaram",
        message: `Probabilidade YES variou ${(Math.random() * 15 + 5).toFixed(1)}% na última hora`,
        severity: "warning" as const,
        marketSlug: undefined,
      }),
      opportunity: () => ({
        ruleId: "opportunity-1",
        type: "opportunity",
        title: "Oportunidade detectada!",
        message: `Edge Score de ${(Math.random() * 20 + 80).toFixed(0)}/100 em um mercado`,
        severity: "high" as const,
        marketSlug: undefined,
      }),
    };

    enabled.forEach((rule) => {
      // Random chance to fire (20% per cycle for demo)
      if (Math.random() > 0.2) return;

      const generator = demoAlerts[rule.type];
      if (!generator) return;

      const alertData = generator();
      if (!alertData) return;

      const ev = addEvent(alertData);
      onAlert(ev);
    });
  }, 30000); // Check every 30s

  return () => {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = null;
  };
}

export function stopAlertEngine() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
