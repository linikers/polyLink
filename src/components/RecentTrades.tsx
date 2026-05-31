"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from "@mui/material";
import { getRecentTrades, fmtPercent } from "@/lib/api";

interface Props {
  conditionId: string;
}

export default function RecentTrades({ conditionId }: Props) {
  const [trades, setTrades] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchTrades() {
      try {
        const data = await getRecentTrades(15, conditionId);
        if (!cancelled) setTrades(data ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      }
    }
    fetchTrades();
    const interval = setInterval(fetchTrades, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [conditionId]);

  if (error) {
    return (
      <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
        <CardContent>
          <Typography variant="body2" sx={{ color: "#f85149" }}>{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
        <CardContent sx={{ textAlign: "center", py: 3 }}>
          <CircularProgress size={20} sx={{ color: "#7c3aed" }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1 }}>Side</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1 }} align="right">Price</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1 }} align="right">Size</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.slice(0, 15).map((t: any, i: number) => (
                <TableRow key={`trade-${i}`}>
                  <TableCell sx={{ borderColor: "#30363d", py: 0.75 }}>
                    <Chip
                      label={t.side === "BUY" ? "BUY" : "SELL"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: t.side === "BUY" ? "rgba(63, 185, 80, 0.15)" : "rgba(248, 81, 73, 0.15)",
                        color: t.side === "BUY" ? "#3fb950" : "#f85149",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }} align="right">
                    {fmtPercent(t.price)}
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }} align="right">
                    {Number(t.size).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
