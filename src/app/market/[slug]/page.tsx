import { Container, Typography, Box } from "@mui/material";
import Link from "next/link";
import MarketDetail from "./MarketDetail";
import { getEventBySlug, REVALIDATE } from "@/lib/api";

export const revalidate = 30;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MarketPage({ params }: Props) {
  const { slug } = await params;
  
  let event;
  try {
    event = await getEventBySlug(slug);
  } catch {
    // silent
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: "#e6edf3", mb: 2 }}>
          Market not found
        </Typography>
        <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
          Could not load &ldquo;{slug}&rdquo;. The market may not exist or the API is unavailable.
        </Typography>
        <Link href="/" style={{ color: "#7c3aed" }}>← Back to home</Link>
      </Container>
    );
  }

  return <MarketDetail event={event} />;
}
