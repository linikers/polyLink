"use client";

import { useState } from "react";
import { Box, Typography, Chip, Button, CircularProgress } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useWeb3, shortenAddress } from "./Web3Provider";
import { useLang } from "@/lib/lang";

export default function WalletButton() {
  const { t } = useLang();
  const { address, isConnected, isCorrectChain, balance, connect, disconnect } = useWeb3();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } finally {
      setConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {!isCorrectChain && (
          <Chip
            label="Rede errada"
            size="small"
            sx={{ height: 20, fontSize: 10, bgcolor: "rgba(248,81,73,0.15)", color: "#f85149" }}
          />
        )}
        <Chip
          icon={<AccountBalanceWalletIcon sx={{ fontSize: 14 }} />}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#3fb950", fontWeight: 600 }}>
                ${balance}
              </Typography>
              <Typography variant="caption" sx={{ color: "#8b949e" }}>
                {shortenAddress(address)}
              </Typography>
            </Box>
          }
          variant="outlined"
          onClick={disconnect}
          onDelete={disconnect}
          deleteIcon={<AccountBalanceWalletIcon sx={{ fontSize: 14, color: "#484f58" }} />}
          sx={{
            color: "#e6edf3",
            borderColor: "#30363d",
            height: 32,
            "&:hover": { borderColor: "#f85149" },
            "& .MuiChip-deleteIcon": { "&:hover": { color: "#f85149" } },
          }}
        />
      </Box>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      disabled={connecting}
      onClick={handleConnect}
      startIcon={
        connecting ? (
          <CircularProgress size={12} sx={{ color: "#8b949e" }} />
        ) : (
          <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
        )
      }
      sx={{
        color: "#8b949e",
        borderColor: "#30363d",
        textTransform: "none",
        fontSize: 13,
        "&:hover": { borderColor: "#7c3aed", color: "#e6edf3" },
      }}
    >
      {connecting ? "Conectando..." : t("wallet.connect")}
    </Button>
  );
}
