"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Typography, Chip } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { getPriceHistory, PRICE_INTERVALS, type PriceInterval } from "@/lib/api";
import { useLang } from "@/lib/lang";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface Props {
  conditionId: string;
}

export default function PriceHistoryChart({ conditionId }: Props) {
  const { t } = useLang();
  const [interval, setInterval] = useState<PriceInterval>("1m");
  const [history, setHistory] = useState<{ t: number; p: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      setLoading(true);
      try {
        const fidelity = PRICE_INTERVALS.find((i) => i.id === interval)?.fidelity ?? 100;
        const data = await getPriceHistory(conditionId, interval, fidelity);
        if (!cancelled) setHistory(data.history ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchHistory();
  }, [conditionId, interval]);

  // Compute change
  const prices = history.map((pt) => Number(pt.p) * 100);
  const latestPrice = prices[prices.length - 1] ?? 0;
  const firstPrice = prices[0] ?? 0;
  const change = firstPrice > 0 ? (((latestPrice - firstPrice) / firstPrice) * 100).toFixed(1) : null;
  const isPositive = Number(change) >= 0;

  const labels = history.map((pt) => {
    const d = new Date(pt.t * 1000);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Preço",
        data: prices,
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  return (
    <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" sx={{ color: "#e6edf3", fontWeight: 700 }}>
              {latestPrice.toFixed(1)}%
            </Typography>
            {change !== null && (
              <Typography
                variant="body2"
                sx={{ color: isPositive ? "#3fb950" : "#f85149", fontWeight: 600 }}
              >
                {isPositive ? "+" : ""}{change}%
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {PRICE_INTERVALS.map((int) => (
              <Chip
                key={int.id}
                label={int.label}
                size="small"
                onClick={() => setInterval(int.id)}
                variant={interval === int.id ? "filled" : "outlined"}
                sx={{
                  color: interval === int.id ? "#e6edf3" : "#8b949e",
                  bgcolor: interval === int.id ? "#7c3aed" : "transparent",
                  borderColor: "#30363d",
                  height: 24,
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Chart */}
        {loading ? (
          <Box sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
          </Box>
        ) : error || history.length === 0 ? (
          <Box sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" sx={{ color: "#8b949e" }}>
              {error ?? t("chart.noHistory")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 250 }}>
            <Line
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                scales: {
                  x: {
                    display: true,
                    ticks: { color: "#8b949e", maxTicksLimit: 8, font: { size: 10 } },
                    grid: { color: "rgba(48, 54, 61, 0.5)" },
                  },
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      color: "#8b949e",
                      callback: (v: string | number) => `${v}%`,
                      font: { size: 10 },
                    },
                    grid: { color: "rgba(48, 54, 61, 0.5)" },
                  },
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
