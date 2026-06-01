"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Link,
} from "@mui/material";
import { getTrendingEvents, getPriceHistory, parseMarket, fmtVolume } from "@/lib/api";

interface Opportunity {
  id: string;
  title: string;
  slug: string;
  category?: string;
  volume: number;
  liquidity: number;
  yesPrice: number;
  noPrice: number;

  // Scores
  liquidityScore: number;  // 0-100
  volumeScore: number;     // 0-100
  volatilityScore: number; // 0-100
  momentumScore: number;   // 0-100

  opportunityScore: number; // 0-100 (média dos 4)
  grade: "high" | "medium" | "low";
}

const PAGE_SIZE = 20;

export default function OpportunityScanner() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  useEffect(() => {
    let cancelled = false;

    async function scan() {
      try {
        const events = await getTrendingEvents(100, 0);

        // Find max volume/liquidity for normalization
        const maxVol = Math.max(...events.map((e) => Number(e.volume ?? 0)), 1);
        const maxLiq = Math.max(...events.map((e) => Number(e.liquidity ?? 0)), 1);
        const maxMomentum = Math.max(
          ...events.map((e) => Math.abs(Number(e.priceChange24h ?? 0))),
          0.01
        );

        const results: Opportunity[] = [];

        for (const evt of events) {
          for (const market of evt.markets ?? []) {
            const p = parseMarket(market);
            const yesPrice = Number(p.outcomePricesParsed[0] ?? 0);
            const noPrice = Number(p.outcomePricesParsed[1] ?? 0);
            if (p.outcomesParsed.length !== 2) continue;
            if (yesPrice === 0 && noPrice === 0) continue;

            const volume = Number(evt.volume ?? 0);
            const liquidity = Number(evt.liquidity ?? 0);
            const change24h = Math.abs(Number(evt.priceChange24h ?? 0));

            // Scores
            const liquidityScore = Math.min(100, Math.round((liquidity / maxLiq) * 100));
            const volumeScore = Math.min(100, Math.round((volume / maxVol) * 100));
            const volatilityScore = Math.min(100, Math.round((change24h / maxMomentum) * 100));
            const momentumScore = Math.min(100, Math.round(change24h * 1000)); // quanto mais mudou, mais momentum

            const opportunityScore = Math.round(
              (liquidityScore + volumeScore + volatilityScore + momentumScore) / 4
            );

            let grade: "high" | "medium" | "low";
            if (opportunityScore >= 70) grade = "high";
            else if (opportunityScore >= 40) grade = "medium";
            else grade = "low";

            results.push({
              id: market.id ?? evt.id,
              title: evt.title,
              slug: evt.slug,
              category: evt.category,
              volume,
              liquidity,
              yesPrice,
              noPrice,
              liquidityScore,
              volumeScore,
              volatilityScore,
              momentumScore,
              opportunityScore,
              grade,
            });
          }
        }

        results.sort((a, b) => b.opportunityScore - a.opportunityScore);
        if (!cancelled) setOpportunities(results);
      } catch {
        if (!cancelled) setOpportunities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    scan();
    const interval = setInterval(scan, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const filtered = filter === "all"
    ? opportunities
    : opportunities.filter((o) => o.grade === filter);

  const gradeColor = (g: string) => {
    switch (g) {
      case "high": return "#3fb950";
      case "medium": return "#f0883e";
      default: return "#f85149";
    }
  };

  const gradeIcon = (g: string) => {
    switch (g) {
      case "high": return "🔥";
      case "medium": return "⚠️";
      default: return "❌";
    }
  };

  const gradeLabel = (g: string) => {
    switch (g) {
      case "high": return "High Opportunity";
      case "medium": return "Medium Opportunity";
      default: return "Low Opportunity";
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
        Mercados rankeados por pontuação de oportunidade — atualizado a cada 60s
      </Typography>

      {/* Filter chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {(["all", "high", "medium", "low"] as const).map((f) => (
          <Chip
            key={f}
            label={f === "all" ? "Todos" : gradeLabel(f)}
            onClick={() => setFilter(f)}
            variant={filter === f ? "filled" : "outlined"}
            sx={{
              color: filter === f ? "#e6edf3" : "#8b949e",
              bgcolor: filter === f ? "#7c3aed" : "transparent",
              borderColor: "#30363d",
              cursor: "pointer",
            }}
          />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#484f58" }}>
          <Typography variant="body2">Nenhuma oportunidade encontrada.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.slice(0, PAGE_SIZE).map((opp) => (
            <Link
              key={opp.id}
              href={`/market/${opp.slug}`}
              underline="none"
              target="_blank"
            >
              <Card
                sx={{
                  bgcolor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 2,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: gradeColor(opp.grade) },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {/* Left: title + meta */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Chip
                          label={`${gradeIcon(opp.grade)} ${opp.opportunityScore}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontWeight: 700,
                            bgcolor: `${gradeColor(opp.grade)}18`,
                            color: gradeColor(opp.grade),
                          }}
                        />
                        {opp.category && (
                          <Chip
                            label={opp.category}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: 10, color: "#8b949e", borderColor: "#30363d" }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600, mb: 1 }}>
                        {opp.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#8b949e" }}>
                        Vol: {fmtVolume(opp.volume)} • Liq: {fmtVolume(opp.liquidity)} • YES: {(opp.yesPrice * 100).toFixed(0)}%
                      </Typography>
                    </Box>

                    {/* Right: score bars */}
                    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                      {[
                        { label: "Liquidez", value: opp.liquidityScore },
                        { label: "Volume", value: opp.volumeScore },
                        { label: "Volatilidade", value: opp.volatilityScore },
                        { label: "Momentum", value: opp.momentumScore },
                      ].map((s) => (
                        <Box key={s.label} sx={{ textAlign: "center", minWidth: 50 }}>
                          <Typography variant="caption" sx={{ color: "#484f58", fontSize: 9 }}>
                            {s.label}
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.5,
                              width: 40,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: "#21262d",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${s.value}%`,
                                height: "100%",
                                bgcolor: gradeColor(opp.grade),
                                borderRadius: 2,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: "#8b949e", fontSize: 10 }}>
                            {s.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}
