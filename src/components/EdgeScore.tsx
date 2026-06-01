"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Chip,
} from "@mui/material";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { useLang } from "@/lib/lang";
import { fmtPercent } from "@/lib/api";

interface Props {
  marketPrice: string; // "0.58" — current YES price
}

export default function EdgeScore({ marketPrice }: Props) {
  const { t } = useLang();

  const marketPct = Number(marketPrice) * 100;
  const [estimate, setEstimate] = useState(Math.round(marketPct));

  const diff = estimate - marketPct;
  const edge = Math.abs(diff);
  const hasEdge = edge >= 3;
  const rec = diff > 0 ? "YES" : "NO";
  const isHighEdge = edge >= 10;

  // Color based on edge
  const edgeColor = isHighEdge ? "#3fb950" : hasEdge ? "#f0883e" : "#8b949e";

  return (
    <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AutoGraphIcon sx={{ color: edgeColor }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#e6edf3" }}>
            {t("edge.title")}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {hasEdge && (
            <Chip
              label={isHighEdge ? `🔥 ${edge.toFixed(0)}% ${t("edge.highEdge")}` : `${edge.toFixed(0)}% Edge`}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: isHighEdge ? "rgba(63, 185, 80, 0.15)" : "rgba(240, 136, 62, 0.15)",
                color: isHighEdge ? "#3fb950" : "#f0883e",
              }}
            />
          )}
        </Box>

        <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
          {t("edge.subtitle")}
        </Typography>

        {/* Market price vs Estimate */}
        <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "#0d1117", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("edge.marketPrice")}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#e6edf3" }}>
              {marketPct.toFixed(0)}%
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "#0d1117", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("edge.yourEstimate")}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#7c3aed" }}>
              {estimate}%
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", p: 1.5, bgcolor: "#0d1117", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#8b949e" }}>{t("edge.diff")}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: edgeColor }}>
              {diff > 0 ? "+" : ""}{diff.toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        {/* Slider */}
        <Box sx={{ px: 1, mb: 2 }}>
          <Typography variant="caption" sx={{ color: "#8b949e", mb: 1, display: "block" }}>
            {t("edge.estimateLabel")}
          </Typography>
          <Slider
            value={estimate}
            onChange={(_, v) => setEstimate(v as number)}
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

        {/* Recommendation */}
        {hasEdge && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: isHighEdge ? "rgba(63, 185, 80, 0.1)" : "rgba(240, 136, 62, 0.1)",
              border: `1px solid ${isHighEdge ? "rgba(63, 185, 80, 0.3)" : "rgba(240, 136, 62, 0.3)"}`,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: isHighEdge ? "#3fb950" : "#f0883e", mb: 0.5 }}
            >
              {rec === "YES" ? t("edge.buyYes") : t("edge.buyNo")}
            </Typography>
            <Typography variant="body2" sx={{ color: "#8b949e" }}>
              Mercado: {marketPct.toFixed(0)}% → Sua estimativa: {estimate}%
              <br />
              Edge: +{edge.toFixed(0)}%
            </Typography>
          </Box>
        )}

        {!hasEdge && (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography variant="body2" sx={{ color: "#8b949e" }}>
              {t("edge.noEdge")}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
