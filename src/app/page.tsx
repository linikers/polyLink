import { Container, Typography, Box, Grid2 } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchMarkets from "@/components/SearchMarkets";
import TrendingEvents from "./TrendingEvents";
import { REVALIDATE } from "@/lib/api";

export const revalidate = 30;

export default function HomePage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: "#e6edf3" }}>
          polyLink
        </Typography>
        <Typography variant="body1" sx={{ color: "#8b949e", maxWidth: 600, mx: "auto", mb: 3 }}>
          Real-time Polymarket prediction market dashboard — track probabilities,
          volume, and market movements.
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ maxWidth: 640, mx: "auto", mb: 5 }}>
        <SearchMarkets />
      </Box>

      {/* Trending */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <TrendingUpIcon sx={{ color: "#7c3aed" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#e6edf3" }}>
          Trending Markets
        </Typography>
      </Box>
      <TrendingEvents />
    </Container>
  );
}
