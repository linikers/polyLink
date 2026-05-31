import { Grid2, Box, Typography } from "@mui/material";
import EventCard from "@/components/EventCard";
import { getTrendingEvents } from "@/lib/api";

export const revalidate = 30;

export default async function TrendingEvents() {
  let events;
  try {
    events = await getTrendingEvents(12);
  } catch {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" sx={{ color: "#f85149" }}>
          Failed to load trending markets. The Polymarket API may be temporarily unavailable.
        </Typography>
      </Box>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" sx={{ color: "#8b949e" }}>
          No trending markets at the moment.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid2 container spacing={2}>
      {events.map((evt: any) => (
        <Grid2 key={evt.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <EventCard event={evt} />
        </Grid2>
      ))}
    </Grid2>
  );
}
