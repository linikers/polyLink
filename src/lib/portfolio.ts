// Portfolio Management — localStorage-based position tracking

export interface Position {
  id: string;
  marketSlug: string;
  marketTitle: string;
  side: "YES" | "NO";
  entryPrice: number;  // 0-1
  quantity: number;    // number of shares
  entryDate: number;   // unix ms
  status: "open" | "closed";
  exitPrice?: number;
  exitDate?: number;
  category?: string;
  pnl?: number;        // realized P&L (calculated on close)
}

export interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  openPositions: number;
}

const STORAGE_KEY = "polylink-portfolio";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── CRUD ─────────────────────────────────────────

export function loadPositions(): Position[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePositions(positions: Position[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // localStorage cheio ou desabilitado — ignora
  }
}

export function addPosition(pos: Omit<Position, "id" | "entryDate" | "status">): Position[] {
  const positions = loadPositions();
  const newPos: Position = {
    ...pos,
    id: generateId(),
    entryDate: Date.now(),
    status: "open",
  };
  positions.unshift(newPos);
  savePositions(positions);
  return positions;
}

export function closePosition(
  id: string,
  exitPrice: number
): Position[] {
  const positions = loadPositions();
  const idx = positions.findIndex((p) => p.id === id);
  if (idx === -1) return positions;

  const pos = positions[idx];
  if (pos.status === "closed") return positions;

  const costBasis = pos.entryPrice * pos.quantity;
  const exitValue = exitPrice * pos.quantity;
  const pnl = pos.side === "YES"
    ? exitValue - costBasis
    : costBasis - exitValue; // for NO, profit when exitPrice < entryPrice... 
  // Actually for NO: bought at entryPrice, sold when resolved NO = 1.
  // If side is NO, we profit when the NO price goes up (i.e., YES goes down)
  // Simpler: PnL = (exitPrice - entryPrice) * quantity * (side === "YES" ? 1 : -1)
  // Because buying NO at 0.4 and selling at 0.6 is +0.2 profit
  
  const realizedPnl = pos.side === "YES"
    ? (exitPrice - pos.entryPrice) * pos.quantity
    : (pos.entryPrice - exitPrice) * pos.quantity;
  // Actually simplest: PnL = (exitPrice - entryPrice) * quantity for YES
  // For NO: if you buy NO at 0.3 and it resolves to YES=1 (NO=0), you lose 0.3
  // If you buy NO at 0.7 and it resolves to NO=1 (NO wins), you gain 0.3
  // PnL for NO = (entryPrice - exitPrice) * quantity? No...
  // Let me think:
  // YES position: buy at 0.4, sell at 0.6 → PnL = (0.6-0.4)*qty = +0.2*qty ✓
  // NO position: buy at 0.4, sell at 0.6 → PnL = (0.6-0.4)*qty = +0.2*qty (NO price went up, you profit)
  // Actually it's the same! Both YES and NO are just tokens you buy and sell.
  // PnL = (exitPrice - entryPrice) * quantity regardless of side.
  // If the NO token price goes up, you profit. If it goes down, you lose.

  positions[idx] = {
    ...pos,
    status: "closed",
    exitPrice,
    exitDate: Date.now(),
    pnl: Math.round((exitPrice - pos.entryPrice) * pos.quantity * 100) / 100,
  };
  savePositions(positions);
  return positions;
}

export function removePosition(id: string): Position[] {
  const positions = loadPositions().filter((p) => p.id !== id);
  savePositions(positions);
  return positions;
}

// ─── Métricas ──────────────────────────────────────

export function calcMetrics(positions: Position[]): PortfolioMetrics {
  const open = positions.filter((p) => p.status === "open");
  const closed = positions.filter((p) => p.status === "closed");

  const totalInvested = open.reduce((s, p) => s + p.entryPrice * p.quantity, 0);
  const currentValue = open.reduce((s, p) => s + p.entryPrice * p.quantity, 0); // unknown until exit
  const realizedPnl = closed.reduce((s, p) => s + (p.pnl ?? 0), 0);
  const totalTrades = closed.length;

  return {
    totalInvested,
    currentValue,
    pnl: realizedPnl,
    pnlPercent: totalInvested > 0 ? (realizedPnl / totalInvested) * 100 : 0,
    winRate: totalTrades > 0
      ? (closed.filter((p) => (p.pnl ?? 0) > 0).length / totalTrades) * 100
      : 0,
    totalTrades,
    winningTrades: closed.filter((p) => (p.pnl ?? 0) > 0).length,
    openPositions: open.length,
  };
}

// ─── Hook React ────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

export function usePortfolio() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalInvested: 0,
    currentValue: 0,
    pnl: 0,
    pnlPercent: 0,
    winRate: 0,
    totalTrades: 0,
    winningTrades: 0,
    openPositions: 0,
  });

  useEffect(() => {
    const p = loadPositions();
    setPositions(p);
    setMetrics(calcMetrics(p));
  }, []);

  const refresh = useCallback(() => {
    const p = loadPositions();
    setPositions(p);
    setMetrics(calcMetrics(p));
  }, []);

  const add = useCallback(
    (pos: Omit<Position, "id" | "entryDate" | "status">) => {
      const updated = addPosition(pos);
      setPositions(updated);
      setMetrics(calcMetrics(updated));
    },
    []
  );

  const close = useCallback((id: string, exitPrice: number) => {
    const updated = closePosition(id, exitPrice);
    setPositions(updated);
    setMetrics(calcMetrics(updated));
  }, []);

  const remove = useCallback((id: string) => {
    const updated = removePosition(id);
    setPositions(updated);
    setMetrics(calcMetrics(updated));
  }, []);

  return { positions, metrics, add, close, remove, refresh };
}
