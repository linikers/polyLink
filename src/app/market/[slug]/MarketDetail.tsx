"use client";

import { useEffect, useState, use } from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  Grid2,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import type { GammaEvent } from "@/lib/types";
import { fmtVolume, fmtPercent, parseMarket } from "@/lib/api";
import OrderBook from "@/components/OrderBook";
import PriceChart from "@/components/PriceHistoryChart";
import RecentTrades from "@/components/RecentTrades";

interface Props {
  event: GammaEvent;
}

export default function MarketDetail({ event }: Props) {
  const market = event.markets?.[0];
  if (!market) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography sx={{ color: "#8b949e" }}>No markets in this event.</Typography>
      </Container>
    );
  }

  const p = parseMarket(market);
  const yesPrice = p.outcomePricesParsed[0] ?? "0";
  const noPrice = p.outcomePricesParsed[1] ?? "0";
  const yesPct = Number(yesPrice) * 100;
  const yesTokenId = p.clobTokenIdsParsed[0] ?? "";
  const conditionId = p.conditionId;
  const closed = event.closed || market.closed;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back link */}
      <Link href="/" style={{ color: "#7c3aed", textDecoration: "none", fontSize: 14 }}>
        ← Back to markets
      </Link>

      {/* Header */}
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ color: "#8b949e", textTransform: "uppercase", letterSpacing: 1 }}>
            {event.category ?? "Prediction Market"}
          </Typography>
          {closed && <Chip label="CLOSED" size="small" sx={{ color: "#f85149", borderColor: "#f85149" }} />}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#e6edf3", mb: 1 }}>
          {event.title}
        </Typography>
        {event.description && (
          <Typography variant="body2" sx={{ color: "#8b949e", maxWidth: 700 }}>
            {event.description}
          </Typography>
        )}
      </Box>

      {/* Probability + Volume */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: "#8b949e", mb: 1.5 }}>
                Current Probability
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: "#3fb950", fontWeight: 600 }}>
                  Yes {fmtPercent(yesPrice)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#f85149", fontWeight: 600 }}>
                  No {fmtPercent(noPrice)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", borderRadius: 1, overflow: "hidden", height: 12, bgcolor: "#21262d" }}>
                <Box sx={{ width: `${yesPct}%`, bgcolor: "#3fb950", transition: "width 0.5s" }} />
                <Box sx={{ flex: 1, bgcolor: "#f85149" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: "#8b949e", mb: 1.5 }}>
                Market Stats
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>Volume</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {fmtVolume(event.volume)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>Liquidity</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {fmtVolume(event.liquidity ?? 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>Open Interest</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {fmtVolume(event.openInterest ?? 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>Markets</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {event.markets?.length ?? 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Price Chart */}
      {conditionId && !closed && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
            Price History (Yes)
          </Typography>
          <PriceChart conditionId={conditionId} />
        </Box>
      )}

      {/* Orderbook + Trades */}
      {yesTokenId && !closed && (
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
              Orderbook (Yes)
            </Typography>
            <OrderBook tokenId={yesTokenId} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
              Recent Trades
            </Typography>
            <RecentTrades conditionId={conditionId} />
          </Grid2>
        </Grid2>
      )}

      {closed && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" sx={{ color: "#8b949e" }}>
            This market is closed. No live orderbook or trades available.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
