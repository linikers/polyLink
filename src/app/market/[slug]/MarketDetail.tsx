"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  Grid2,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Link from "next/link";
import type { GammaEvent } from "@/lib/types";
import { fmtVolume, fmtPercent, parseMarket } from "@/lib/api";
import OrderBook from "@/components/OrderBook";
import PriceChart from "@/components/PriceHistoryChart";
import RecentTrades from "@/components/RecentTrades";
import { useLang } from "@/lib/lang";
import IntelligenceScoreCard from "@/components/IntelligenceScore";
import ErrorBoundary from "@/components/ErrorBoundary";
import TradeDialog from "@/components/TradeDialog";
import { translateText, getCachedTranslation } from "@/lib/translate";
import TranslateIcon from "@mui/icons-material/Translate";

interface Props {
  event: GammaEvent;
}

/** Fallback compacto para seções que falham — não quebra o layout */
function SectionFallback({ label }: { label: string }) {
  return (
    <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
      <CardContent sx={{ textAlign: "center", py: 4 }}>
        <ErrorOutlineIcon sx={{ fontSize: 24, color: "#484f58", mb: 1 }} />
        <Typography variant="body2" sx={{ color: "#484f58" }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function MarketDetail({ event }: Props) {
  const { t } = useLang();
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState<"YES" | "NO">("YES");
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(getCachedTranslation(event.title));
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(event.description ? getCachedTranslation(event.description) : null);
  const [translating, setTranslating] = useState(false);
  const market = event.markets?.[0];
  if (!market) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography sx={{ color: "#8b949e" }}>{t("detail.nomarkets")}</Typography>
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

  const handleTranslate = async () => {
    if (translating) return;
    setTranslating(true);
    try {
      if (!translatedTitle && event.title) {
        const t = await translateText(event.title);
        setTranslatedTitle(t);
      }
      if (!translatedDesc && event.description) {
        const d = await translateText(event.description);
        setTranslatedDesc(d);
      }
    } catch {
      // silent
    } finally {
      setTranslating(false);
    }
  };

  const displayTitle = translatedTitle || event.title;
  const displayDesc = translatedDesc || event.description;

  return (
    <>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back link */}
      <Link href="/" style={{ color: "#7c3aed", textDecoration: "none", fontSize: 14 }}>
        {t("detail.back")}
      </Link>

      {/* Header */}
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ color: "#8b949e", textTransform: "uppercase", letterSpacing: 1 }}>
            {event.category ?? t("event.category.default")}
          </Typography>
          {closed && <Chip label={t("event.closed")} size="small" sx={{ color: "#f85149", borderColor: "#f85149" }} />}
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#e6edf3", mb: 1, flex: 1 }}>
            {displayTitle}
          </Typography>
          <Chip
            icon={translating ? <CircularProgress size={12} /> : <TranslateIcon sx={{ fontSize: 14 }} />}
            label={translating ? "Traduzindo..." : "PT"}
            size="small"
            variant="outlined"
            onClick={handleTranslate}
            disabled={translating}
            sx={{
              mt: 0.5,
              color: translatedTitle ? "#7c3aed" : "#484f58",
              borderColor: translatedTitle ? "#7c3aed44" : "#30363d",
              cursor: translating ? "default" : "pointer",
              "&:hover": { borderColor: "#7c3aed", color: "#7c3aed" },
            }}
          />
        </Box>
        {event.description && (
          <Typography variant="body2" sx={{ color: "#8b949e", maxWidth: 700 }}>
            {displayDesc}
          </Typography>
        )}
      </Box>

      {/* Probability + Stats — sempre seguro, sem fetch externo */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: "#8b949e", mb: 1.5 }}>
                {t("detail.probability")}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: "#3fb950", fontWeight: 600 }}>
                  {t("event.yes")} {fmtPercent(yesPrice)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#f85149", fontWeight: 600 }}>
                  {t("event.no")} {fmtPercent(noPrice)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", borderRadius: 1, overflow: "hidden", height: 12, bgcolor: "#21262d" }}>
                <Box sx={{ width: `${yesPct}%`, bgcolor: "#3fb950", transition: "width 0.5s" }} />
                <Box sx={{ flex: 1, bgcolor: "#f85149" }} />
              </Box>
              {/* Trade buttons */}
              {!closed && (
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => { setTradeSide("YES"); setTradeOpen(true); }}
                    sx={{ color: "#3fb950", borderColor: "#3fb95044", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "rgba(63,185,80,0.1)" } }}
                  >
                    📈 {t("event.yes")} {fmtPercent(yesPrice)}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => { setTradeSide("NO"); setTradeOpen(true); }}
                    sx={{ color: "#f85149", borderColor: "#f8514944", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "rgba(248,81,73,0.1)" } }}
                  >
                    📉 {t("event.no")} {fmtPercent(noPrice)}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: "#8b949e", mb: 1.5 }}>
                {t("detail.stats")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("detail.volume")}</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {fmtVolume(event.volume)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("detail.liquidity")}</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {fmtVolume(event.liquidity ?? 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("detail.openInterest")}</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {fmtVolume(event.openInterest ?? 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("detail.markets")}</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {event.markets?.length ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("detail.endDate")}</Typography>
                  <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600 }}>
                    {event.endDate
                      ? new Date(event.endDate).toLocaleDateString("pt-BR")
                      : "—"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Intelligence Score — com ErrorBoundary próprio */}
      {!closed && (
        <Box sx={{ mb: 4 }}>
          <ErrorBoundary fallback={<SectionFallback label={t("section.intelUnavailable")} />}>
            <IntelligenceScoreCard
              event={event}
              yesPrice={yesPrice}
              noPrice={noPrice}
            />
          </ErrorBoundary>
        </Box>
      )}

      {/* Price Chart — com ErrorBoundary próprio */}
      {conditionId && !closed && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
            {t("detail.priceHistory")}
          </Typography>
          <ErrorBoundary fallback={<SectionFallback label={t("section.chartUnavailable")} />}>
            <PriceChart conditionId={conditionId} />
          </ErrorBoundary>
        </Box>
      )}

      {/* Orderbook + Trades — CADA UM com ErrorBoundary próprio */}
      {yesTokenId && !closed && (
        <Grid2 container spacing={3} sx={{ mb: 4 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
              {t("detail.orderbook")}
            </Typography>
            <ErrorBoundary fallback={<SectionFallback label={t("section.orderbookUnavailable")} />}>
              <OrderBook tokenId={yesTokenId} />
            </ErrorBoundary>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
              {t("detail.trades")}
            </Typography>
            <ErrorBoundary fallback={<SectionFallback label={t("section.tradesUnavailable")} />}>
              <RecentTrades conditionId={conditionId} />
            </ErrorBoundary>
          </Grid2>
        </Grid2>
      )}

      {closed && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" sx={{ color: "#8b949e" }}>
            {t("detail.closed")}
          </Typography>
        </Box>
      )}
    </Container>

      {/* Trade Dialog */}
      <TradeDialog
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
        marketSlug={event.slug}
        marketTitle={event.title}
        tokenId={yesTokenId}
        yesPrice={Number(yesPrice)}
        category={event.category}
      />
    </>
  );
}
