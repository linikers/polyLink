import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "polyLink — Polymarket Dashboard",
  description: "Monitor prediction markets, prices, orderbook, and trends from Polymarket in real time.",
  openGraph: {
    title: "polyLink — Polymarket Dashboard",
    description: "Monitor prediction markets in real time.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0d1117", minHeight: "100vh" }}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Navbar />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
