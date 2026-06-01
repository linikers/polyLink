"use client";

import { useEffect, useState } from "react";
import { Grid2, Box, Typography } from "@mui/material";
import EventCard from "@/components/EventCard";
import { getTrendingEvents } from "@/lib/api";
import { useLang } from "@/lib/lang";

export default function TrendingEvents() {
  const { t } = useLang();
  const [events, setEvents] = useState<any[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTrendingEvents(12)
      .then(setEvents)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" sx={{ color: "#f85149" }}>
          {t("trending.error")}
        </Typography>
      </Box>
    );
  }

  if (!events || !Array.isArray(events)) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" sx={{ color: "#8b949e" }}>
          {t("trending.empty")}
        </Typography>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" sx={{ color: "#8b949e" }}>
          {t("trending.empty")}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid2 container spacing={2}>
      {events.filter(Boolean).map((evt: any) => (
        <Grid2 key={evt?.id ?? Math.random()} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <EventCard event={evt} />
        </Grid2>
      ))}
    </Grid2>
  );
}
