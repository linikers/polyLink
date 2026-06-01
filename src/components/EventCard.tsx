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

interface Props {
  event: GammaEvent;
}

export default function EventCard({ event }: Props) {
  const { t } = useLang();
  const market = event.markets?.[0];
  if (!market) return null;

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
        <Typography variant="body2" sx={{ color: "#8b949e", mb: 0.5 }}>
          {event.category ?? t("event.category.default")}
        </Typography>
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
