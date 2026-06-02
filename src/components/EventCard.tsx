"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import Link from "next/link";
import type { GammaEvent } from "@/lib/types";
import { fmtPercent, fmtVolume, parseMarket } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { calcIntelligenceScores, intelligenceGradeColor, intelligenceGradeIcon } from "@/lib/intelligence";

interface Props {
  event: GammaEvent;
}

export default function EventCard({ event }: Props) {
  const { t } = useLang();
  if (!event) return null;
  const market = event.markets?.[0];
  if (!market || !event.slug) return null;

  const p = parseMarket(market);
  const yesPrice = p.outcomePricesParsed[0] ?? "0";
  const noPrice = p.outcomePricesParsed[1] ?? "0";
  const yesPct = Number(yesPrice) * 100;
  const closed = event.closed || market.closed;

  return (
    <Card
      component={Link}
      href={`/market/${event.slug}`}
      sx={{
        bgcolor: "#161b22",
        color: "#e6edf3",
        borderRadius: 2,
        border: "1px solid #30363d",
        textDecoration: "none",
        transition: "border-color 0.2s",
        "&:hover": { borderColor: "#7c3aed" },
        position: "relative",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: "#8b949e" }}>
            {event.category ?? t("event.category.default")}
          </Typography>
          {(() => {
            if (!event.markets?.[0] || closed) return null;
            const m = parseMarket(event.markets[0]);
            const s = calcIntelligenceScores({
              liquidity: event.liquidity ?? 0,
              volume: event.volume ?? 0,
              openInterest: event.openInterest ?? 0,
              yesPrice: Number(m.outcomePricesParsed[0] ?? 0),
              noPrice: Number(m.outcomePricesParsed[1] ?? 0),
              change24h: (event as any).priceChange24h ?? 0,
              category: event.category,
            });
            if (s.composite < 40) return null;
            const color = intelligenceGradeColor(s.grade);
            const icon = intelligenceGradeIcon(s.grade);
            return (
              <Chip
                label={`${icon} ${s.composite}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: `${color}18`,
                  color,
                }}
              />
            );
          })()}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, lineHeight: 1.3 }}>
          {event.title}
        </Typography>

        {/* Probability bar */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#3fb950" }}>{t("event.yes")} {fmtPercent(yesPrice)}</Typography>
            <Typography variant="caption" sx={{ color: "#f85149" }}>{t("event.no")} {fmtPercent(noPrice)}</Typography>
          </Box>
          <Box sx={{ display: "flex", borderRadius: 1, overflow: "hidden", height: 8, bgcolor: "#21262d" }}>
            <Box sx={{ width: `${yesPct}%`, bgcolor: "#3fb950", transition: "width 0.3s" }} />
            <Box sx={{ flex: 1, bgcolor: "#f85149" }} />
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#8b949e" }}>
            {t("event.vol")} {fmtVolume(event.volume)}
          </Typography>
          {closed && (
            <Chip label={t("event.closed")} size="small" sx={{ color: "#8b949e", borderColor: "#30363d", height: 20 }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
