"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import { getRecentTrades, fmtPercent } from "@/lib/api";
import { useLang } from "@/lib/lang";

interface Props {
  conditionId: string;
}

export default function RecentTrades({ conditionId }: Props) {
  const { t } = useLang();
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
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1 }}>{t("trades.side")}</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1 }} align="right">{t("trades.price")}</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1 }} align="right">{t("trades.size")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.slice(0, 15).map((trade: any, i: number) => (
                <TableRow key={`trade-${i}`}>
                  <TableCell sx={{ borderColor: "#30363d", py: 0.75 }}>
                    <Chip
                      label={trade.side === "BUY" ? t("trades.buy") : t("trades.sell")}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: trade.side === "BUY" ? "rgba(63, 185, 80, 0.15)" : "rgba(248, 81, 73, 0.15)",
                        color: trade.side === "BUY" ? "#3fb950" : "#f85149",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }} align="right">
                    {fmtPercent(trade.price)}
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }} align="right">
                    {Number(trade.size).toFixed(2)}
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
