// Polymarket CLOB Trading — EIP-712 order creation + submission

import { type Address, type Hash, encodeAbiParameters, keccak256, toHex } from "viem";
import { polygon } from "viem/chains";

// ─── Constants ──────────────────────────────────────

export const EXCHANGE_ADDRESS = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8Bd3Bd" as Address;
export const NEG_RISK_ADDRESS = "0xC5d563A36AE78145C45a50134d48A1215220dc80" as Address;
export const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as Address;

const CLOB = "https://clob.polymarket.com";

// ─── EIP-712 Types ──────────────────────────────────

const EIP712_DOMAIN = {
  name: "Exchange",
  version: "1.0",
  chainId: BigInt(polygon.id),
  verifyingContract: EXCHANGE_ADDRESS,
} as const;

const ORDER_TYPE = {
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
} as const;

export type OrderSide = "BUY" | "SELL";

export interface OrderData {
  salt: bigint;
  maker: Address;
  signer: Address;
  taker: Address;
  tokenId: bigint;
  makerAmount: bigint; // USDC amount (6 decimals)
  takerAmount: bigint; // token amount (18 decimals for NegRisk, raw for regular)
  expiration: bigint;
  nonce: bigint;
  feeRateBps: number;
  side: number; // 0=BUY, 1=SELL
  signatureType: number;
}

// ─── API calls ───────────────────────────────────────

export async function getNonce(maker: Address): Promise<bigint> {
  try {
    const res = await fetch(`${CLOB}/order/nonce?maker=${maker}`);
    if (!res.ok) return BigInt(0);
    const data = await res.json();
    return BigInt(data?.nonce ?? 0);
  } catch {
    return BigInt(0);
  }
}

export async function getTickSize(tokenId: string): Promise<string> {
  try {
    const res = await fetch(`${CLOB}/tick-size?token_id=${tokenId}`);
    if (!res.ok) return "0.01";
    const data = await res.json();
    return data?.tick_size ?? "0.01";
  } catch {
    return "0.01";
  }
}

// ─── Order Building ─────────────────────────────────

function randomSalt(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return BigInt("0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(""));
}

export function buildOrder(params: {
  maker: Address;
  tokenId: string;
  side: OrderSide;
  price: number;       // 0-1 like 0.164
  amount: number;      // in USDC
  nonce: bigint;
  expirationMinutes?: number;
}): OrderData {
  const { maker, tokenId, side, price, amount, nonce, expirationMinutes = 30 } = params;

  // USDC has 6 decimals
  const makerAmount = BigInt(Math.round(amount * 1_000_000));
  
  // Token amount in atomic units (18 decimals for NegRisk)
  const takerAmount = BigInt(Math.round((amount / price) * 1_000_000_000_000_000_000));

  return {
    salt: randomSalt(),
    maker,
    signer: maker,
    taker: "0x0000000000000000000000000000000000000000" as Address,
    tokenId: BigInt(tokenId),
    makerAmount,
    takerAmount,
    expiration: BigInt(Math.floor(Date.now() / 1000) + expirationMinutes * 60),
    nonce,
    feeRateBps: 0,
    side: side === "BUY" ? 0 : 1,
    signatureType: 0,
  };
}

// ─── Signing ─────────────────────────────────────────

// Note: The user calls this on the client via viem's walletClient.signTypedData
export function getOrderToSign(order: OrderData) {
  return {
    domain: { ...EIP712_DOMAIN },
    types: { ...ORDER_TYPE },
    primaryType: "Order" as const,
    message: { ...order },
  };
}

// ─── Submission ──────────────────────────────────────

export async function submitOrder(
  order: OrderData,
  signature: Hash,
  owner: Address,
  negRisk: boolean = true
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const payload = {
    order: {
      salt: order.salt.toString(),
      maker: order.maker,
      signer: order.signer,
      taker: order.taker,
      tokenId: order.tokenId.toString(),
      makerAmount: order.makerAmount.toString(),
      takerAmount: order.takerAmount.toString(),
      expiration: order.expiration.toString(),
      nonce: order.nonce.toString(),
      feeRateBps: order.feeRateBps,
      side: order.side,
      signatureType: order.signatureType,
      signature,
    },
    owner,
    signature,
    negRisk,
  };

  const endpoint = negRisk
    ? `${CLOB}/neg-risk/create-atomic-order`
    : `${CLOB}/order`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "Unknown error");
      return { success: false, error: `CLOB API ${res.status}: ${err.slice(0, 200)}` };
    }

    const data = await res.json();
    return { success: true, orderId: data?.order?.id ?? data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// ─── USDC Approval ──────────────────────────────────

export function getUSDCApproveData(spender: Address, amount: bigint): { to: Address; data: Hash } {
  // approve(spender, amount) selector: 0x095ea7b3
  const data = encodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }],
    [spender, amount]
  );
  return {
    to: USDC_POLYGON,
    data: `0x095ea7b3${data.slice(2)}` as Hash,
  };
}
