// Web3 constants — viem + MetaMask direto

import { polygon } from "viem/chains";

export const CHAIN = polygon;

export const POLYMARKET = {
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as const,
  EXCHANGE: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8Bd3Bd" as const,
} as const;
