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
import { getOrderBook, fmtPercent } from "@/lib/api";
import { useLang } from "@/lib/lang";

interface Props {
  tokenId: string;
}

export default function OrderBook({ tokenId }: Props) {
  const { t } = useLang();
  const [data, setData] = useState<{ bids: any[]; asks: any[]; last?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBook() {
      try {
        const book = await getOrderBook(tokenId);
        if (!cancelled) setData(book);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      }
    }
    fetchBook();
    const interval = setInterval(fetchBook, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [tokenId]);

  if (error) {
    return (
      <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
        <CardContent>
          <Typography variant="body2" sx={{ color: "#f85149" }}>{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <CircularProgress size={20} sx={{ color: "#7c3aed" }} />
        </CardContent>
      </Card>
    );
  }

  const asks = (data.asks ?? []).slice(0, 8);
  const bids = (data.bids ?? []).slice(0, 8);

  return (
    <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1.5 }}>{t("orderbook.price")}</TableCell>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1.5 }} align="right">{t("orderbook.size")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Asks (sell orders) — reversed so highest price is at top */}
              {[...asks].reverse().map((a: any, i: number) => (
                <TableRow key={`ask-${i}`}>
                  <TableCell sx={{ color: "#f85149", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }}>
                    {fmtPercent(a.price)}
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }} align="right">
                    {Number(a.size).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Spread */}
              <TableRow>
                <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 0.75, fontSize: 11 }} colSpan={2} align="center">
                  {t("orderbook.last")} {data.last ? fmtPercent(data.last) : "—"}
                </TableCell>
              </TableRow>
              {/* Bids (buy orders) */}
              {bids.map((b: any, i: number) => (
                <TableRow key={`bid-${i}`}>
                  <TableCell sx={{ color: "#3fb950", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }}>
                    {fmtPercent(b.price)}
                  </TableCell>
                  <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 0.75, fontFamily: "monospace" }} align="right">
                    {Number(b.size).toFixed(2)}
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
