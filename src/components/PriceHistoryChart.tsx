"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
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
import { getPriceHistory } from "@/lib/api";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface Props {
  conditionId: string;
}

export default function PriceHistoryChart({ conditionId }: Props) {
  const [history, setHistory] = useState<{ t: number; p: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      try {
        const data = await getPriceHistory(conditionId, "1m", 100);
        if (!cancelled) setHistory(data.history ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchHistory();
    const interval = setInterval(fetchHistory, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [conditionId]);

  if (loading) {
    return (
      <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
        <CardContent sx={{ textAlign: "center", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
        </CardContent>
      </Card>
    );
  }

  if (error || history.length === 0) {
    return (
      <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
        <CardContent sx={{ textAlign: "center", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: "#8b949e" }}>
            {error ?? "No price history available yet."}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const labels = history.map((pt: { t: number; p: string }) => {
    const d = new Date(pt.t * 1000);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  });
  const prices = history.map((pt: { t: number; p: string }) => Number(pt.p) * 100);
  const latestPrice = prices[prices.length - 1] ?? 0;

  const data = {
    labels,
    datasets: [
      {
        label: "Yes Price (%)",
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#8b949e" }}>Last 30 days</Typography>
          <Typography variant="h6" sx={{ color: "#e6edf3", fontWeight: 700 }}>
            {latestPrice.toFixed(1)}%
          </Typography>
        </Box>
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
      </CardContent>
    </Card>
  );
}
