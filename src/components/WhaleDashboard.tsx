"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { fmtVolume, fmtPercent } from "@/lib/api";

interface Whale {
  address: string;
  totalVolume: number;
  tradeCount: number;
  buyCount: number;
  sellCount: number;
  topMarket?: string;
  confidence: number;
}

export default function WhaleDashboard() {
  const [whales, setWhales] = useState<Whale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchWhales() {
      try {
        // Fetch recent trades from Polymarket Data API
        const res = await fetch("https://data-api.polymarket.com/trades?limit=200");
        if (!res.ok) throw new Error("API error");
        const trades = await res.json();

        // Aggregate by wallet address
        const walletMap = new Map<string, {
          volume: number;
          count: number;
          buys: number;
          sells: number;
          markets: Map<string, number>;
        }>();

        for (const t of trades) {
          if (!t.maker) continue;
          const addr = t.maker.toLowerCase();
          if (!walletMap.has(addr)) {
            walletMap.set(addr, { volume: 0, count: 0, buys: 0, sells: 0, markets: new Map() });
          }
          const w = walletMap.get(addr)!;
          const size = Number(t.size) * Number(t.price) || 0;
          w.volume += size;
          w.count++;
          if (t.side === "BUY") w.buys++; else w.sells++;
          if (t.market) {
            w.markets.set(t.market, (w.markets.get(t.market) ?? 0) + 1);
          }
        }

        // Sort by volume descending, take top 20
        const sorted = Array.from(walletMap.entries())
          .sort((a, b) => b[1].volume - a[1].volume)
          .slice(0, 20)
          .map(([address, data]) => {
            // Confidence: based on trade frequency + volume consistency
            const freq = Math.min(data.count / 50, 1);
            const volConsistency = Math.min(data.volume / 50000, 1);
            const confidence = Math.round((freq * 0.5 + volConsistency * 0.5) * 100);

            // Top market
            const topMarket = Array.from(data.markets.entries())
              .sort((a, b) => b[1] - a[1])[0]?.[0];

            return {
              address,
              totalVolume: data.volume,
              tradeCount: data.count,
              buyCount: data.buys,
              sellCount: data.sells,
              topMarket,
              confidence,
            };
          });

        if (!cancelled) setWhales(sorted);
      } catch {
        if (!cancelled) setWhales([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWhales();
    const interval = setInterval(fetchWhales, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
      </Box>
    );
  }

  if (whales.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "#484f58" }}>
        <Typography variant="body2">Nenhuma whale identificada ainda. Tente novamente em instantes.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
        Top 20 wallets por volume de trade — atualizado a cada 60s
      </Typography>

      <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }}>#</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }}>Wallet</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">Volume</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">Trades</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">Compra/Venda</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">Confiança</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {whales.map((w, i) => (
                <TableRow key={w.address}>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1 }}>
                    {i + 1}
                  </TableCell>
                  <TableCell sx={{ borderColor: "#30363d", py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 10,
                          bgcolor: i < 3 ? "#7c3aed" : "#21262d",
                        }}
                      >
                        {w.address.slice(2, 4)}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: "#e6edf3", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {w.address.slice(0, 6)}...{w.address.slice(-4)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 1 }} align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#e6edf3" }}>
                      {fmtVolume(w.totalVolume)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 1 }} align="right">
                    {w.tradeCount}
                  </TableCell>
                  <TableCell sx={{ borderColor: "#30363d", py: 1 }} align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      <Chip label={`+${w.buyCount}`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(63,185,80,0.15)", color: "#3fb950" }} />
                      <Chip label={`-${w.sellCount}`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(248,81,73,0.15)", color: "#f85149" }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: "#30363d", py: 1 }} align="right">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end" }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "#21262d",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${w.confidence}%`,
                            height: "100%",
                            bgcolor: w.confidence >= 70 ? "#3fb950" : w.confidence >= 40 ? "#f0883e" : "#f85149",
                            borderRadius: 2,
                            transition: "width 0.5s",
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#8b949e", minWidth: 30 }}>
                        {w.confidence}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
