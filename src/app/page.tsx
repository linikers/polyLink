"use client";

import { useState, useEffect, useCallback } from "react";
import { Container, Typography, Box, Chip, Grid2, Button, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchMarkets from "@/components/SearchMarkets";
import EventCard from "@/components/EventCard";
import SkeletonCard from "@/components/SkeletonCard";
import { getTrendingEvents, getEventsByCategory, getEventsEndingSoon, getEventsSortedBy, CATEGORIES, type CategoryId } from "@/lib/api";
import { useLang } from "@/lib/lang";
import ErrorBoundary from "@/components/ErrorBoundary";

const PAGE_SIZE = 12;

type TabMode = "trending" | "endingSoon";
type SortMode = "volume" | "endDate";
type EndingRange = 1 | 7 | 30;

export default function HomePage() {
  const { t } = useLang();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [tab, setTab] = useState<TabMode>("trending");
  const [sort, setSort] = useState<SortMode>("volume");
  const [endingDays, setEndingDays] = useState<EndingRange>(7);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = useCallback(async (
    mode: TabMode,
    cat: CategoryId | null,
    s: SortMode,
    days: EndingRange,
    off: number,
    append: boolean
  ) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      let data: any[];
      if (mode === "endingSoon") {
        data = await getEventsEndingSoon(PAGE_SIZE, off, days);
      } else if (cat) {
        if (s === "endDate") {
          data = await getEventsSortedBy(s, PAGE_SIZE, off, cat);
        } else {
          data = await getEventsByCategory(cat, PAGE_SIZE, off);
        }
      } else {
        if (s === "endDate") {
          data = await getEventsSortedBy(s, PAGE_SIZE, off);
        } else {
          data = await getTrendingEvents(PAGE_SIZE, off);
        }
      }
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

  // Reset on any filter change
  useEffect(() => {
    setOffset(0);
    fetchEvents(tab, category, sort, endingDays, 0, false);
  }, [tab, category, sort, endingDays, fetchEvents]);

  const loadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchEvents(tab, category, sort, endingDays, newOffset, true);
  };

  const handleCategoryClick = (catId: CategoryId) => {
    setCategory(catId === category ? null : catId);
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

      {/* Tab: Trending / Ending Soon */}
      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
        <Chip
          label={t("section.trending")}
          onClick={() => { setTab("trending"); setCategory(null); }}
          variant={tab === "trending" ? "filled" : "outlined"}
          icon={tab === "trending" ? <TrendingUpIcon /> : undefined}
          sx={{
            color: tab === "trending" ? "#e6edf3" : "#8b949e",
            bgcolor: tab === "trending" ? "#7c3aed" : "transparent",
            borderColor: "#30363d",
            cursor: "pointer",
            fontWeight: tab === "trending" ? 600 : 400,
            "& .MuiChip-icon": { color: tab === "trending" ? "#e6edf3" : "#8b949e" },
          }}
        />
        <Chip
          label={t("sort.endingSoon")}
          onClick={() => { setTab("endingSoon"); setCategory(null); }}
          variant={tab === "endingSoon" ? "filled" : "outlined"}
          sx={{
            color: tab === "endingSoon" ? "#e6edf3" : "#8b949e",
            bgcolor: tab === "endingSoon" ? "#7c3aed" : "transparent",
            borderColor: "#30363d",
            cursor: "pointer",
            fontWeight: tab === "endingSoon" ? 600 : 400,
          }}
        />
      </Box>

      {/* Ending Soon range chips */}
      {tab === "endingSoon" && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {([1, 7, 30] as EndingRange[]).map((d) => (
            <Chip
              key={d}
              label={
                d === 1 ? t("sort.ending24h") :
                d === 7 ? t("sort.ending7d") :
                t("sort.ending30d")
              }
              onClick={() => setEndingDays(d)}
              size="small"
              variant={endingDays === d ? "filled" : "outlined"}
              sx={{
                color: endingDays === d ? "#e6edf3" : "#8b949e",
                bgcolor: endingDays === d ? "#7c3aed" : "transparent",
                borderColor: "#30363d",
                cursor: "pointer",
                fontWeight: endingDays === d ? 600 : 400,
              }}
            />
          ))}
        </Box>
      )}

      {/* Sort + category row */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        {/* Sort chips */}
        {tab === "trending" && (
          <Box sx={{ display: "flex", gap: 0.5, mr: 1, alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "#484f58", mr: 0.5 }}>
              {t("sort.sortBy")}:
            </Typography>
            {(["volume", "endDate"] as SortMode[]).map((s) => (
              <Chip
                key={s}
                label={s === "volume" ? t("sort.volume") : t("sort.endDate")}
                onClick={() => setSort(s)}
                size="small"
                variant={sort === s ? "filled" : "outlined"}
                sx={{
                  color: sort === s ? "#e6edf3" : "#8b949e",
                  bgcolor: sort === s ? "#7c3aed" : "transparent",
                  borderColor: "#30363d",
                  cursor: "pointer",
                  fontWeight: sort === s ? 600 : 400,
                }}
              />
            ))}
          </Box>
        )}

        {/* Category filters */}
        <Chip
          label={t("category.all")}
          onClick={() => setCategory(null)}
          variant={category === null ? "filled" : "outlined"}
          size="small"
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
            onClick={() => handleCategoryClick(cat.id)}
            variant={category === cat.id ? "filled" : "outlined"}
            size="small"
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
      {tab === "trending" && !category && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUpIcon sx={{ color: "#7c3aed" }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#e6edf3" }}>
            {t("section.trending")}
          </Typography>
        </Box>
      )}

      {tab === "endingSoon" && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#e6edf3" }}>
            {t("sort.endingSoon")}
          </Typography>
        </Box>
      )}

      {/* Events grid */}
      {loading ? (
        <Grid2 container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid2 key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <SkeletonCard />
            </Grid2>
          ))}
        </Grid2>
      ) : !Array.isArray(events) ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body2" sx={{ color: "#8b949e" }}>
            {t("trending.empty")}
          </Typography>
        </Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h4" sx={{ color: "#30363d", fontWeight: 300, mb: 1, fontSize: 48 }}>
            {tab === "endingSoon" ? "⏰" : "🔍"}
          </Typography>
          <Typography variant="body1" sx={{ color: "#8b949e", mb: 0.5 }}>
            {t("common.noMarkets")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#484f58" }}>
            {tab === "endingSoon"
              ? "Nenhum mercado encerrando nesse período. Tente aumentar o intervalo ou mudar a aba."
              : "Tente mudar o filtro ou buscar por outro termo."}
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
              {loadingMore ? t("common.loading") : t("common.loadMore")}
            </Button>
          </Box>
        )}
        </>
      )}
    </Container>
  );
}
