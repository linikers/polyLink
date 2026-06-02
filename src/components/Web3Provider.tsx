"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createWalletClient, custom, getAddress, formatUnits, type Address } from "viem";
import { polygon } from "viem/chains";

interface Web3State {
  address: Address | null;
  isConnected: boolean;
  isCorrectChain: boolean;
  balance: string; // formatted USDC
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Ctx = createContext<Web3State>({
  address: null,
  isConnected: false,
  isCorrectChain: false,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
});

export function useWeb3() {
  return useContext(Web3Ctx);
}

const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as const;

export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState("0");
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    (window as any).ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts?.[0]) {
          setAddress(getAddress(accounts[0]));
          checkChain();
        }
      })
      .catch(() => {});
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const handleAccounts = (accounts: string[]) => {
      if (accounts?.length > 0) setAddress(getAddress(accounts[0]));
      else setAddress(null);
    };
    const handleChain = () => checkChain();
    (window as any).ethereum.on("accountsChanged", handleAccounts);
    (window as any).ethereum.on("chainChanged", handleChain);
    return () => {
      (window as any).ethereum?.removeListener("accountsChanged", handleAccounts);
      (window as any).ethereum?.removeListener("chainChanged", handleChain);
    };
  }, []);

  const checkChain = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
      setIsCorrectChain(Number(chainId) === polygon.id);
    } catch {
      setIsCorrectChain(false);
    }
  }, []);

  const fetchBalance = useCallback(async (addr: Address) => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const client = createWalletClient({ chain: polygon, transport: custom((window as any).ethereum) });
      const bal = await client.request({
        method: "eth_call",
        params: [
          {
            to: USDC_POLYGON,
            data: `0x70a08231000000000000000000000000${addr.slice(2)}`, // balanceOf(addr)
          },
          "latest",
        ],
      } as any);
      const decoded = formatUnits(BigInt(bal as string), 6);
      setBalance(Number(decoded).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } catch {
      setBalance("0");
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const accounts: string[] = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) {
        const addr = getAddress(accounts[0]);
        setAddress(addr);
        await checkChain();
        await fetchBalance(addr);
      }
    } catch {
      // user rejected or error
    }
  }, [checkChain, fetchBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance("0");
    setIsCorrectChain(false);
  }, []);

  return (
    <Web3Ctx.Provider
      value={{
        address,
        isConnected: !!address,
        isCorrectChain,
        balance,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Ctx.Provider>
  );
}
