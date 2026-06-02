"use client";

import { useState } from "react";
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid2,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useLang } from "@/lib/lang";
import { usePortfolio, type Position } from "@/lib/portfolio";
import { fmtVolume } from "@/lib/api";

export default function PortfolioDashboard() {
  const { t } = useLang();
  const { positions, metrics, add, close, remove } = usePortfolio();
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState<string | null>(null);
  const [exitPrice, setExitPrice] = useState("");

  // New position form
  const [form, setForm] = useState({
    marketSlug: "",
    marketTitle: "",
    side: "YES" as "YES" | "NO",
    entryPrice: "",
    quantity: "",
    category: "",
  });

  const openPositions = positions.filter((p) => p.status === "open");
  const closedPositions = positions.filter((p) => p.status === "closed");

  const handleAdd = () => {
    const price = Number(form.entryPrice);
    const qty = Number(form.quantity);
    if (!form.marketTitle || !price || !qty) return;

    add({
      marketSlug: form.marketSlug || form.marketTitle.toLowerCase().replace(/\s+/g, "-"),
      marketTitle: form.marketTitle,
      side: form.side,
      entryPrice: price,
      quantity: qty,
      category: form.category || undefined,
    });

    setForm({ marketSlug: "", marketTitle: "", side: "YES", entryPrice: "", quantity: "", category: "" });
    setOpenDialog(false);
  };

  const handleClose = () => {
    const price = Number(exitPrice);
    if (!closeDialog || !price) return;
    close(closeDialog, price);
    setCloseDialog(null);
    setExitPrice("");
  };

  const pnlColor = (val: number) => (val > 0 ? "#3fb950" : val < 0 ? "#f85149" : "#8b949e");
  const fmtPnl = (val: number) => `${val > 0 ? "+" : ""}$${val.toFixed(2)}`;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#e6edf3" }}>
          {t("portfolio.title")}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            color: "#e6edf3",
            borderColor: "#7c3aed",
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(124,58,237,0.1)" },
          }}
        >
          {t("portfolio.add")}
        </Button>
      </Box>

      {/* Metrics cards */}
      <Grid2 container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: t("portfolio.totalInvested"), value: fmtVolume(metrics.totalInvested), color: "#e6edf3" },
          { label: t("portfolio.pnl"), value: fmtPnl(metrics.pnl), color: pnlColor(metrics.pnl) },
          { label: t("portfolio.pnlPercent"), value: `${metrics.pnlPercent > 0 ? "+" : ""}${metrics.pnlPercent.toFixed(1)}%`, color: pnlColor(metrics.pnlPercent) },
          { label: t("portfolio.winRate"), value: `${metrics.winRate.toFixed(0)}%`, color: "#3fb950" },
          { label: t("portfolio.totalTrades"), value: String(metrics.totalTrades), color: "#7c3aed" },
          { label: t("portfolio.openPositions"), value: String(metrics.openPositions), color: "#f0883e" },
        ].map((stat) => (
          <Grid2 key={stat.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* Open Positions */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
        {t("portfolio.openPositions")} ({openPositions.length})
      </Typography>

      {openPositions.length === 0 ? (
        <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" sx={{ color: "#484f58" }}>
              {t("portfolio.noOpen")}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2, mb: 4 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }}>{t("portfolio.market")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }}>{t("portfolio.side")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.entryPrice")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.qty")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.invested")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.date")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="center">{t("portfolio.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openPositions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {pos.marketTitle}
                      </Typography>
                      {pos.category && (
                        <Typography variant="caption" sx={{ color: "#484f58" }}>
                          {pos.category}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderColor: "#30363d", py: 1 }}>
                      <Chip
                        label={pos.side}
                        size="small"
                        sx={{
                          height: 20,
                          fontWeight: 700,
                          bgcolor: pos.side === "YES" ? "rgba(63,185,80,0.15)" : "rgba(248,81,73,0.15)",
                          color: pos.side === "YES" ? "#3fb950" : "#f85149",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", fontFamily: "monospace", py: 1 }} align="right">
                      {(pos.entryPrice * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", fontFamily: "monospace", py: 1 }} align="right">
                      {pos.quantity.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", fontFamily: "monospace", py: 1 }} align="right">
                      ${(pos.entryPrice * pos.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1, fontSize: 12 }} align="right">
                      {new Date(pos.entryDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell sx={{ borderColor: "#30363d", py: 1 }} align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setCloseDialog(pos.id);
                          setExitPrice("");
                        }}
                        sx={{
                          color: "#f0883e",
                          borderColor: "#f0883e44",
                          fontSize: 11,
                          textTransform: "none",
                          "&:hover": { bgcolor: "rgba(240,136,62,0.1)" },
                        }}
                      >
                        {t("portfolio.close")}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => remove(pos.id)}
                        sx={{ color: "#484f58", ml: 0.5, "&:hover": { color: "#f85149" } }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Closed Positions */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#e6edf3", mb: 2 }}>
        {t("portfolio.closed")} ({closedPositions.length})
      </Typography>

      {closedPositions.length === 0 ? (
        <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" sx={{ color: "#484f58" }}>
              {t("portfolio.noClosed")}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }}>{t("portfolio.market")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }}>{t("portfolio.side")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.entry")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.exit")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.pnl")}</TableCell>
                  <TableCell sx={{ color: "#8b949e", borderColor: "#30363d" }} align="right">{t("portfolio.date")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {closedPositions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell sx={{ color: "#e6edf3", borderColor: "#30363d", py: 1 }}>
                      <Typography variant="body2">{pos.marketTitle}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: "#30363d", py: 1 }}>
                      <Chip
                        label={pos.side}
                        size="small"
                        sx={{
                          height: 20,
                          fontWeight: 700,
                          bgcolor: pos.side === "YES" ? "rgba(63,185,80,0.15)" : "rgba(248,81,73,0.15)",
                          color: pos.side === "YES" ? "#3fb950" : "#f85149",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", fontFamily: "monospace", py: 1 }} align="right">
                      {(pos.entryPrice * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", fontFamily: "monospace", py: 1 }} align="right">
                      {pos.exitPrice ? `${(pos.exitPrice * 100).toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: pnlColor(pos.pnl ?? 0),
                        borderColor: "#30363d",
                        fontFamily: "monospace",
                        py: 1,
                        fontWeight: 600,
                      }}
                      align="right"
                    >
                      {fmtPnl(pos.pnl ?? 0)}
                    </TableCell>
                    <TableCell sx={{ color: "#8b949e", borderColor: "#30363d", py: 1, fontSize: 12 }} align="right">
                      {pos.exitDate
                        ? new Date(pos.exitDate).toLocaleDateString("pt-BR")
                        : new Date(pos.entryDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Add Position Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: { bgcolor: "#161b22", border: "1px solid #30363d", color: "#e6edf3", minWidth: 400 },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #30363d", mb: 2 }}>
          {t("portfolio.addTitle")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("portfolio.marketTitle_field")}
              value={form.marketTitle}
              onChange={(e) => setForm({ ...form, marketTitle: e.target.value })}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { color: "#e6edf3", "& fieldset": { borderColor: "#30363d" } },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: "#8b949e" }}>{t("portfolio.side")}</InputLabel>
              <Select
                value={form.side}
                label={t("portfolio.side")}
                onChange={(e) => setForm({ ...form, side: e.target.value as "YES" | "NO" })}
                sx={{ color: "#e6edf3", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#30363d" } }}
              >
                <MenuItem value="YES">YES</MenuItem>
                <MenuItem value="NO">NO</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t("portfolio.entryPrice_field")}
              value={form.entryPrice}
              onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
              size="small"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
              placeholder="0.58"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { color: "#e6edf3", "& fieldset": { borderColor: "#30363d" } },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />
            <TextField
              label={t("portfolio.qty_field")}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              size="small"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              placeholder="100"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { color: "#e6edf3", "& fieldset": { borderColor: "#30363d" } },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />
            <TextField
              label={t("portfolio.category_field")}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              size="small"
              placeholder={t("portfolio.category_placeholder")}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { color: "#e6edf3", "& fieldset": { borderColor: "#30363d" } },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d" }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: "#8b949e", textTransform: "none" }}>
            {t("portfolio.cancel")}
          </Button>
          <Button
            onClick={handleAdd}
            variant="outlined"
            disabled={!form.marketTitle || !form.entryPrice || !form.quantity}
            sx={{
              color: "#e6edf3",
              borderColor: "#7c3aed",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(124,58,237,0.1)" },
            }}
          >
            {t("portfolio.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Position Dialog */}
      <Dialog
        open={!!closeDialog}
        onClose={() => setCloseDialog(null)}
        PaperProps={{
          sx: { bgcolor: "#161b22", border: "1px solid #30363d", color: "#e6edf3", minWidth: 360 },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid #30363d", mb: 2 }}>
          {t("portfolio.closeTitle")}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={t("portfolio.exitPrice_field")}
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            size="small"
            type="number"
            inputProps={{ min: 0, max: 1, step: 0.01 }}
            placeholder="0.65"
            fullWidth
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { color: "#e6edf3", "& fieldset": { borderColor: "#30363d" } },
                "& .MuiInputLabel-root": { color: "#8b949e" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d" }}>
          <Button onClick={() => setCloseDialog(null)} sx={{ color: "#8b949e", textTransform: "none" }}>
            {t("portfolio.cancel")}
          </Button>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={!exitPrice}
            sx={{
              color: "#e6edf3",
              borderColor: "#f0883e",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(240,136,62,0.1)" },
            }}
          >
            {t("portfolio.confirmClose")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
