"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  CircularProgress,
  Slider,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useWeb3, shortenAddress } from "./Web3Provider";
import { useLang } from "@/lib/lang";
import { addPosition } from "@/lib/portfolio";
import { buildOrder, submitOrder, getNonce, type OrderSide } from "@/lib/trading";
import { createWalletClient, custom } from "viem";
import { polygon } from "viem/chains";

interface Props {
  open: boolean;
  onClose: () => void;
  marketSlug: string;
  marketTitle: string;
  tokenId: string;       // CLOB token ID for the outcome
  yesPrice: number;      // 0-1
  category?: string;
}

export default function TradeDialog({ open, onClose, marketSlug, marketTitle, tokenId, yesPrice, category }: Props) {
  const { t } = useLang();
  const { address, balance, isCorrectChain, connect, switchChain } = useWeb3();

  const [side, setSide] = useState<OrderSide>("BUY");
  const [amount, setAmount] = useState("10"); // USDC
  const [step, setStep] = useState<"form" | "approve" | "sign" | "done" | "error">("form");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  const price = side === "BUY" ? yesPrice : 1 - yesPrice;
  const shares = Number(amount) / price;
  const edgePct = Math.abs(yesPrice - 0.5) * 100;

  const handleTrade = useCallback(async () => {
    if (!address) return;

    setStep("sign");
    setStatusMsg("Assinando ordem na MetaMask...");

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("MetaMask não encontrada");

      // 1. Get nonce
      const nonce = await getNonce(address);

      // 2. Build order
      const order = buildOrder({
        maker: address,
        tokenId,
        side,
        price: side === "BUY" ? yesPrice : 1 - yesPrice,
        amount: Number(amount),
        nonce,
      });

      // 3. Sign with MetaMask via viem
      const walletClient = createWalletClient({
        chain: polygon,
        transport: custom(ethereum),
      });

      const signature = await walletClient.signTypedData({
        account: address,
        domain: {
          name: "Exchange",
          version: "1.0",
          chainId: BigInt(137),
          verifyingContract: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8Bd3Bd",
        },
        types: {
          Order: [
            { name: "salt", type: "uint256" },
            { name: "maker", type: "address" },
            { name: "signer", type: "address" },
            { name: "taker", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "makerAmount", type: "uint256" },
            { name: "takerAmount", type: "uint256" },
            { name: "expiration", type: "uint64" },
            { name: "nonce", type: "uint256" },
            { name: "feeRateBps", type: "uint256" },
            { name: "side", type: "uint8" },
            { name: "signatureType", type: "uint8" },
          ],
        },
        primaryType: "Order",
        message: {
          salt: order.salt,
          maker: order.maker,
          signer: order.signer,
          taker: order.taker,
          tokenId: order.tokenId,
          makerAmount: order.makerAmount,
          takerAmount: order.takerAmount,
          expiration: order.expiration,
          nonce: order.nonce,
          feeRateBps: BigInt(order.feeRateBps),
          side: order.side,
          signatureType: order.signatureType,
        },
      });

      setStatusMsg("Enviando ordem para o mercado...");

      // 4. Submit to CLOB
      const result = await submitOrder(order, signature, address, true);

      if (!result.success) {
        throw new Error(result.error || "Falha ao enviar ordem");
      }

      // 5. Save to portfolio
      addPosition({
        marketSlug,
        marketTitle,
        side: side === "BUY" ? "YES" : "NO",
        entryPrice: side === "BUY" ? yesPrice : 1 - yesPrice,
        quantity: Math.round(shares * 100) / 100,
        category,
      });

      setStep("done");
      setStatusMsg(`Ordem enviada! ID: ${result.orderId?.slice(0, 18) || "confirmado"}...`);
    } catch (e: any) {
      setStep("error");
      setErrorMsg(e?.message || "Erro desconhecido");
    }
  }, [address, tokenId, side, amount, yesPrice, shares, marketSlug, marketTitle, category]);

  const reset = () => {
    setStep("form");
    setStatusMsg("");
    setErrorMsg("");
    setTxHash("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const usdcAmount = Number(amount);
  const invested = usdcAmount;

  if (!address) {
    return (
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { bgcolor: "#161b22", border: "1px solid #30363d", color: "#e6edf3", minWidth: 420 } }}>
        <DialogTitle sx={{ borderBottom: "1px solid #30363d" }}>Conectar Carteira</DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 48, color: "#484f58", mb: 2 }} />
          <Typography variant="body2" sx={{ color: "#8b949e", mb: 2 }}>
            Conecte sua MetaMask para fazer trades
          </Typography>
          <Button variant="outlined" onClick={connect} sx={{ color: "#e6edf3", borderColor: "#7c3aed", textTransform: "none" }}>
            Conectar MetaMask
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d" }}>
          <Button onClick={handleClose} sx={{ color: "#8b949e", textTransform: "none" }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!isCorrectChain) {
    return (
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { bgcolor: "#161b22", border: "1px solid #30363d", color: "#e6edf3", minWidth: 420 } }}>
        <DialogTitle sx={{ borderBottom: "1px solid #30363d" }}>Rede Errada</DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" sx={{ color: "#f85149", mb: 2 }}>
            Conectado na rede errada. O Polymarket usa Polygon.
          </Typography>
          <Button variant="outlined" onClick={switchChain} sx={{ color: "#e6edf3", borderColor: "#f0883e", textTransform: "none" }}>
            Mudar pra Polygon
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d" }}>
          <Button onClick={handleClose} sx={{ color: "#8b949e", textTransform: "none" }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { bgcolor: "#161b22", border: "1px solid #30363d", color: "#e6edf3", minWidth: 440 } }}>
      <DialogTitle sx={{ borderBottom: "1px solid #30363d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{side === "BUY" ? "Comprar" : "Vender"} — {marketTitle}</span>
        <Chip label={shortenAddress(address)} size="small" sx={{ color: "#8b949e", borderColor: "#30363d" }} />
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {step === "form" && (
          <>
            {/* Side selector */}
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <Chip
                label="COMPRAR YES"
                onClick={() => setSide("BUY")}
                variant={side === "BUY" ? "filled" : "outlined"}
                sx={{ height: 32, fontWeight: 700, bgcolor: side === "BUY" ? "rgba(63,185,80,0.2)" : "transparent", color: side === "BUY" ? "#3fb950" : "#8b949e", borderColor: "#30363d", cursor: "pointer" }}
              />
              <Chip
                label="COMPRAR NO"
                onClick={() => setSide("SELL")}
                variant={side === "SELL" ? "filled" : "outlined"}
                sx={{ height: 32, fontWeight: 700, bgcolor: side === "SELL" ? "rgba(248,81,73,0.2)" : "transparent", color: side === "SELL" ? "#f85149" : "#8b949e", borderColor: "#30363d", cursor: "pointer" }}
              />
            </Box>

            {/* Price info */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, p: 1.5, bgcolor: "#0d1117", borderRadius: 2 }}>
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>Preço</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#e6edf3" }}>
                  ${price.toFixed(3)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>por share</Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>{side === "BUY" ? "Shares" : "Receber"}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7c3aed" }}>
                  {shares.toFixed(0)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>shares</Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>Investido</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#3fb950" }}>
                  ${invested.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#8b949e" }}>USDC</Typography>
              </Box>
            </Box>

            {/* Amount input */}
            <Typography variant="body2" sx={{ color: "#8b949e", mb: 1 }}>
              Valor em USDC: <strong style={{ color: "#e6edf3" }}>${usdcAmount.toFixed(2)}</strong>
            </Typography>
            <Slider
              value={usdcAmount}
              onChange={(_, v) => setAmount(String(v))}
              min={1}
              max={100}
              step={1}
              sx={{ color: "#7c3aed", mb: 1, "& .MuiSlider-thumb": { bgcolor: "#e6edf3" }, "& .MuiSlider-track": { bgcolor: "#7c3aed" }, "& .MuiSlider-rail": { bgcolor: "#30363d" } }}
            />
            <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
              {[5, 10, 25, 50, 100].map(v => (
                <Chip key={v} label={`$${v}`} size="small" onClick={() => setAmount(String(v))}
                  variant={usdcAmount === v ? "filled" : "outlined"}
                  sx={{ height: 24, fontSize: 11, color: usdcAmount === v ? "#e6edf3" : "#8b949e", bgcolor: usdcAmount === v ? "#7c3aed" : "transparent", borderColor: "#30363d", cursor: "pointer" }} />
              ))}
            </Box>

            <Typography variant="caption" sx={{ color: "#484f58", display: "block", textAlign: "center" }}>
              Saldo: <strong style={{ color: "#3fb950" }}>${balance}</strong> USDC
            </Typography>
          </>
        )}

        {step === "sign" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress size={32} sx={{ color: "#7c3aed", mb: 2 }} />
            <Typography variant="body2" sx={{ color: "#8b949e" }}>{statusMsg}</Typography>
          </Box>
        )}

        {step === "done" && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="h5" sx={{ color: "#3fb950", fontWeight: 700, mb: 1 }}>✅ Ordem Enviada!</Typography>
            <Typography variant="body2" sx={{ color: "#8b949e", mb: 2 }}>{statusMsg}</Typography>
            <Typography variant="caption" sx={{ color: "#484f58" }}>
              A ordem pode levar alguns segundos para ser preenchida.
            </Typography>
          </Box>
        )}

        {step === "error" && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="h6" sx={{ color: "#f85149", fontWeight: 600, mb: 1 }}>❌ Erro</Typography>
            <Typography variant="body2" sx={{ color: "#8b949e" }}>{errorMsg}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #30363d", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" sx={{ color: "#484f58" }}>Edge:</Typography>
          <Typography variant="caption" sx={{ color: edgePct > 5 ? "#3fb950" : "#8b949e", fontWeight: 600 }}>
            {edgePct.toFixed(1)}%
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleClose} sx={{ color: "#8b949e", textTransform: "none" }}>
            {step === "done" || step === "error" ? "Fechar" : "Cancelar"}
          </Button>
          {step === "form" && (
            <Button
              variant="outlined"
              onClick={handleTrade}
              sx={{
                color: side === "BUY" ? "#3fb950" : "#f85149",
                borderColor: side === "BUY" ? "#3fb95044" : "#f8514944",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: side === "BUY" ? "rgba(63,185,80,0.1)" : "rgba(248,81,73,0.1)" },
              }}
            >
              {side === "BUY" ? "📈 Comprar YES" : "📉 Comprar NO"}
            </Button>
          )}
          {step === "error" && (
            <Button onClick={reset} variant="outlined" sx={{ color: "#e6edf3", borderColor: "#7c3aed", textTransform: "none" }}>
              Tentar novamente
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
