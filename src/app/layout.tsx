import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import { LangProvider } from "@/lib/lang";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Web3Provider } from "@/components/Web3Provider";

export const metadata: Metadata = {
  title: "polyLink — Dashboard Polymarket",
  description: "Acompanhe mercados de previsão, preços, orderbook e tendências do Polymarket em tempo real.",
  openGraph: {
    title: "polyLink — Dashboard Polymarket",
    description: "Acompanhe mercados de previsão em tempo real.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ backgroundColor: "#0d1117", minHeight: "100vh" }}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LangProvider>
              <Web3Provider>
                <ErrorBoundary>
                  <Navbar />
                  {children}
                </ErrorBoundary>
              </Web3Provider>
            </LangProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
