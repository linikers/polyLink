"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Slider,
  CircularProgress,
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { useLang } from "@/lib/lang";
import { fmtVolume, getRecentTrades } from "@/lib/api";
import {
  calcIntelligenceScores,
  intelligenceGradeLabel,
  intelligenceGradeColor,
  intelligenceGradeIcon,
  type IntelligenceScores,
} from "@/lib/intelligence";
import type { GammaEvent } from "@/lib/types";

interface Props {
  event: GammaEvent;
  yesPrice: string; // "0.58"
  noPrice: string;
  edgeEstimate?: number;
  onEdgeChange?: (val: number) => void;
}

export default function IntelligenceScoreCard({
  event,
  yesPrice,
  noPrice,
  edgeEstimate,
  onEdgeChange,
}: Props) {
  const { t, lang } = useLang();
  const [whaleActivity, setWhaleActivity] = useState<number | undefined>();
  const [loadingWhale, setLoadingWhale] = useState(true);
  const [estimate, setEstimate] = useState(
    edgeEstimate ?? Math.round(Number(yesPrice) * 100)
  );

  // Fetch recent trades to estimate whale interest in this market
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const market = event.markets?.[0];
        if (!market?.conditionId) {
          setWhaleActivity(30);
          return;
        }
        const trades = await getRecentTrades(100, market.conditionId);
        if (cancelled) return;

        // Aggregate by maker to see concentration
        const makerMap = new Map<string, number>();
        for (const t of trades) {
          if (t.maker) {
            const addr = t.maker.toLowerCase();
            makerMap.set(addr, (makerMap.get(addr) ?? 0) + 1);
          }
        }

        if (makerMap.size === 0) {
          setWhaleActivity(30);
          return;
        }

        // Calculate concentration: what % of trades come from top 3 wallets
        const sorted = Array.from(makerMap.values()).sort((a, b) => b - a);
        const top3Total = sorted.slice(0, 3).reduce((s, v) => s + v, 0);
        const total = sorted.reduce((s, v) => s + v, 0);
        const concentration = total > 0 ? (top3Total / total) * 100 : 0;

        // Score: moderate concentration is good (whales interested but not dominating)
        // Too high (>80%) = manipulation risk, too low (<20%) = no whale interest
        let score: number;
        if (concentration >= 80) score = 70; // whales dominate — could be manipulation
        else if (concentration >= 50) score = 90; // strong whale interest
        else if (concentration >= 30) score = 75; // moderate whale interest
        else if (concentration >= 15) score = 50; // some interest
        else score = 25; // low whale interest

        setWhaleActivity(score);
      } catch {
        setWhaleActivity(30);
      } finally {
        if (!cancelled) setLoadingWhale(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [event.id, event.markets]);

  // Get category-based news relevance
  const category = event.category ?? "";
  const newsRelevance = category
    ? category === "politics" ? 85
    : category === "crypto" ? 90
    : category === "economics" ? 80
    : category === "sports" ? 70
    : category === "technology" ? 75
    : 50
    : 50;

  const scores: IntelligenceScores = calcIntelligenceScores({
    liquidity: event.liquidity ?? 0,
    volume: event.volume ?? 0,
    openInterest: event.openInterest ?? 0,
    yesPrice: Number(yesPrice),
    noPrice: Number(noPrice),
    change24h: (event as any).priceChange24h ?? 0,
    category,
    edgeEstimate: estimate,
    whaleActivity,
    newsRelevance,
  });

  const gradeColor = intelligenceGradeColor(scores.grade);
  const gradeIcon = intelligenceGradeIcon(scores.grade);
  const gradeLabel = intelligenceGradeLabel(scores.grade, lang as "pt-BR" | "en");

  const handleEdgeChange = (val: number) => {
    setEstimate(val);
    onEdgeChange?.(val);
  };

  const subScores = [
    { key: t("intel.liquidity"), value: scores.liquidityScore, weight: "10%" },
    { key: t("intel.volume"), value: scores.volumeScore, weight: "10%" },
    { key: t("intel.volatility"), value: scores.volatilityScore, weight: "15%" },
    { key: t("intel.whale"), value: scores.whaleScore, weight: "20%", loading: loadingWhale },
    { key: t("intel.edge"), value: scores.edgeScore, weight: "30%" },
    { key: t("intel.news"), value: scores.newsScore, weight: "15%" },
  ];

  return (
    <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PsychologyIcon sx={{ color: gradeColor }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#e6edf3" }}>
            {t("intel.title")}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={`${gradeIcon} ${scores.composite} — ${gradeLabel}`}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: `${gradeColor}18`,
              color: gradeColor,
              border: `1px solid ${gradeColor}44`,
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
          {t("intel.subtitle")}
        </Typography>

        {/* Composite score ring */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              position: "relative",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `conic-gradient(${gradeColor} ${scores.composite * 3.6}deg, #21262d ${scores.composite * 3.6}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                bgcolor: "#0d1117",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, color: gradeColor, lineHeight: 1 }}>
                {scores.composite}
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e", fontSize: 10 }}>
                {t("intel.score")}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Sub-score bars */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {subScores.map((s) => (
            <Box key={s.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                <Typography variant="caption" sx={{ color: "#8b949e", fontSize: 11 }}>
                  {s.key}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ color: "#484f58", fontSize: 10, ml: 0.5 }}
                  >
                    ({s.weight})
                  </Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: "#e6edf3", fontFamily: "monospace", fontSize: 11 }}>
                  {(s as any).loading ? (
                    <CircularProgress size={10} sx={{ color: "#484f58" }} />
                  ) : (
                    `${s.value}`
                  )}
                </Typography>
              </Box>
              <Box sx={{ width: "100%", height: 6, borderRadius: 3, bgcolor: "#21262d", overflow: "hidden" }}>
                <Box
                  sx={{
                    width: `${s.value}%`,
                    height: "100%",
                    borderRadius: 3,
                    bgcolor: s.value >= 70 ? "#3fb950" : s.value >= 40 ? "#f0883e" : "#f85149",
                    transition: "width 0.5s ease",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* Edge Score slider */}
        <Box sx={{ borderTop: "1px solid #30363d", pt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: "#e6edf3", fontWeight: 600, mb: 1 }}>
            {t("intel.edgeLabel")}
          </Typography>
          <Typography variant="caption" sx={{ color: "#8b949e", mb: 1.5, display: "block" }}>
            {t("intel.edgeDesc")}
          </Typography>
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#8b949e" }}>
                {t("intel.marketPrice")}: {Math.round(Number(yesPrice) * 100)}%
              </Typography>
              <Typography variant="caption" sx={{ color: "#7c3aed" }}>
                {t("intel.yourGuess")}: {estimate}%
              </Typography>
            </Box>
            <Slider
              value={estimate}
              onChange={(_, v) => handleEdgeChange(v as number)}
              min={0}
              max={100}
              step={1}
              sx={{
                color: "#7c3aed",
                "& .MuiSlider-thumb": { bgcolor: "#e6edf3" },
                "& .MuiSlider-track": { bgcolor: "#7c3aed" },
                "& .MuiSlider-rail": { bgcolor: "#30363d" },
              }}
            />
          </Box>
          {Math.abs(estimate - Number(yesPrice) * 100) >= 5 && (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "rgba(124, 58, 237, 0.08)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "#7c3aed", fontWeight: 600 }}>
                {estimate > Number(yesPrice) * 100
                  ? t("intel.recYes")
                  : t("intel.recNo")}
                {" "}
                ({Math.abs(estimate - Number(yesPrice) * 100).toFixed(0)}% {t("intel.edge")})
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
