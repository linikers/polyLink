"use client";

import { useState, useEffect, useCallback } from "react";
import { Container, Typography, Box, Chip, Grid2, Button, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchMarkets from "@/components/SearchMarkets";
import EventCard from "@/components/EventCard";
import { getTrendingEvents, getEventsByCategory, CATEGORIES, type CategoryId } from "@/lib/api";
import { useLang } from "@/lib/lang";
import ErrorBoundary from "@/components/ErrorBoundary";

const PAGE_SIZE = 12;

export default function HomePage() {
  const { t } = useLang();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = useCallback(async (cat: CategoryId | null, off: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const data = cat
        ? await getEventsByCategory(cat, PAGE_SIZE, off)
        : await getTrendingEvents(PAGE_SIZE, off);
      const arr = Array.isArray(data) ? data : [];
      if (append) {
        setEvents((prev) => [...prev, ...arr]);
      } else {
        setEvents(arr);
      }
      setHasMore(arr.length === PAGE_SIZE);
    } catch {
      if (!append) setEvents([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset on category change
  useEffect(() => {
    setOffset(0);
    fetchEvents(category, 0, false);
  }, [category, fetchEvents]);

  const loadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchEvents(category, newOffset, true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: "#e6edf3" }}>
          polyLink
        </Typography>
        <Typography variant="body1" sx={{ color: "#8b949e", maxWidth: 600, mx: "auto", mb: 3 }}>
          {t("hero.subtitle")}
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ maxWidth: 640, mx: "auto", mb: 4 }}>
        <SearchMarkets />
      </Box>

      {/* Category filter */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Chip
          label={t("category.all")}
          onClick={() => setCategory(null)}
          variant={category === null ? "filled" : "outlined"}
          sx={{
            color: category === null ? "#e6edf3" : "#8b949e",
            bgcolor: category === null ? "#7c3aed" : "transparent",
            borderColor: "#30363d",
            cursor: "pointer",
            fontWeight: category === null ? 600 : 400,
          }}
        />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={t(cat.labelKey)}
            onClick={() => setCategory(cat.id === category ? null : cat.id)}
            variant={category === cat.id ? "filled" : "outlined"}
            sx={{
              color: category === cat.id ? "#e6edf3" : "#8b949e",
              bgcolor: category === cat.id ? "#7c3aed" : "transparent",
              borderColor: "#30363d",
              cursor: "pointer",
              fontWeight: category === cat.id ? 600 : 400,
            }}
          />
        ))}
      </Box>

      {/* Section title */}
      {!category && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUpIcon sx={{ color: "#7c3aed" }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#e6edf3" }}>
            {t("section.trending")}
          </Typography>
        </Box>
      )}

      {/* Events grid */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#484f58" }}>
          <Typography variant="body2">Carregando...</Typography>
        </Box>
      ) : !Array.isArray(events) ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body2" sx={{ color: "#8b949e" }}>
            {t("trending.empty")}
          </Typography>
        </Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body2" sx={{ color: "#8b949e" }}>
            Nenhum mercado encontrado.
          </Typography>
        </Box>
      ) : (
        <>
        <Grid2 container spacing={2}>
          {events.filter(Boolean).map((evt: any) => (
            <Grid2 key={evt?.id ?? Math.random()} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ErrorBoundary key={evt?.id}>
                <EventCard event={evt} />
              </ErrorBoundary>
            </Grid2>
          ))}
        </Grid2>
        {hasMore && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              onClick={loadMore}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={16} /> : null}
              sx={{
                color: "#8b949e",
                borderColor: "#30363d",
                textTransform: "none",
                px: 4,
                "&:hover": { borderColor: "#7c3aed", color: "#e6edf3" },
              }}
            >
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </Button>
          </Box>
        )}
        </>
      )}
    </Container>
  );
}
