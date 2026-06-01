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
  Button,
} from "@mui/material";
import { getTrendingEvents, parseMarket, fmtPercent } from "@/lib/api";

interface Arbitrage {
  id: string;
  title: string;
  slug: string;
  yesPrice: number;
  noPrice: number;
  sum: number;
  expectedReturn: number;
  action: "buy both" | "buy yes" | "buy no";
}

export default function ArbitrageEngine() {
  const [arbitrages, setArbitrages] = useState<Arbitrage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function scan() {
      try {
        const events = await getTrendingEvents(100, 0);
        const results: Arbitrage[] = [];

        for (const evt of events) {
          for (const market of evt.markets ?? []) {
            const p = parseMarket(market);
            const yesPrice = Number(p.outcomePricesParsed[0] ?? 0);
            const noPrice = Number(p.outcomePricesParsed[1] ?? 0);
            const sum = yesPrice + noPrice;

            // Check if market has exactly 2 outcomes (YES/NO)
            if (p.outcomesParsed.length !== 2) continue;
            if (yesPrice === 0 && noPrice === 0) continue;

            const expectedReturn = sum < 1 ? ((1 - sum) / sum) * 100 : 0;
            const returnYes = yesPrice < 0.5 ? ((0.5 - yesPrice) / yesPrice) * 100 : 0;
            const returnNo = noPrice < 0.5 ? ((0.5 - noPrice) / noPrice) * 100 : 0;

            if (expectedReturn > 0.5 || returnYes > 5 || returnNo > 5) {
              results.push({
                id: market.id ?? evt.id,
                title: evt.title,
                slug: evt.slug,
                yesPrice,
                noPrice,
                sum,
                expectedReturn,
                action: expectedReturn > 1 ? "buy both" : returnYes > returnNo ? "buy yes" : "buy no",
              });
            }
          }
        }

        results.sort((a, b) => b.expectedReturn - a.expectedReturn);
        if (!cancelled) setArbitrages(results);
      } catch {
        if (!cancelled) setArbitrages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    scan();
    const interval = setInterval(scan, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const copyStrategy = (a: Arbitrage) => {
    const text = `Arbitragem detectada: ${a.title}
YES: ${(a.yesPrice * 100).toFixed(1)}% | NO: ${(a.noPrice * 100).toFixed(1)}%
Soma: ${(a.sum * 100).toFixed(1)}% | Retorno esperado: ${a.expectedReturn.toFixed(2)}%
Ação: ${a.action === "buy both" ? "Comprar YES + NO" : a.action === "buy yes" ? "Comprar YES" : "Comprar NO"}
https://polymarket.com/event/${a.slug}`;
    navigator.clipboard.writeText(text);
  };

  const severityColor = (ret: number) => {
    if (ret > 5) return "#3fb950";
    if (ret > 1) return "#f0883e";
    return "#8b949e";
  };

  const severityLabel = (ret: number) => {
    if (ret > 5) return "🔥 Alta";
    if (ret > 1) return "⚠️ Média";
    return "⚪ Baixa";
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
        Escaneando mercados em busca de distorções matemáticas — atualizado a cada 60s
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
        </Box>
      ) : arbitrages.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#484f58" }}>
          <Typography variant="body2">
            Nenhuma oportunidade de arbitragem encontrada no momento.
          </Typography>
        </Box>
      ) : (
        <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }}>Mercado</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">YES</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">NO</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">Soma</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">Retorno</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arbitrages.slice(0, 30).map((a) => (
                  <TableRow key={a.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                    <TableCell sx={{ borderColor: "#30363d", py: 1 }}>
                      <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 500, maxWidth: 300 }} noWrap>
                        {a.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#3fb950", borderColor: "#30363d", py: 1, fontFamily: "monospace" }} align="right">
                      {fmtPercent(String(a.yesPrice))}
                    </TableCell>
                    <TableCell sx={{ color: "#f85149", borderColor: "#30363d", py: 1, fontFamily: "monospace" }} align="right">
                      {fmtPercent(String(a.noPrice))}
                    </TableCell>
                    <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 1, fontFamily: "monospace" }} align="right">
                      {(a.sum * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ borderColor: "#30363d", py: 1 }} align="right">
                      <Chip
                        label={`${a.expectedReturn.toFixed(2)}%`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: `${severityColor(a.expectedReturn)}18`,
                          color: severityColor(a.expectedReturn),
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: "#30363d", py: 1 }} align="right">
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "flex-end" }}>
                        <Chip
                          label={severityLabel(a.expectedReturn)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 10,
                            bgcolor: `${severityColor(a.expectedReturn)}18`,
                            color: severityColor(a.expectedReturn),
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => copyStrategy(a)}
                          sx={{
                            minWidth: "auto",
                            fontSize: 10,
                            color: "#8b949e",
                            textTransform: "none",
                            "&:hover": { color: "#7c3aed" },
                          }}
                        >
                          Copiar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
