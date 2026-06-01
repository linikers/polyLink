"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { GammaEvent } from "@/lib/types";
import { searchMarkets } from "@/lib/api";
import EventCard from "./EventCard";
import { useLang } from "@/lib/lang";

interface Props {
  onSearch?: (query: string) => void;
}

export default function SearchMarkets({ onSearch }: Props) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GammaEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchMarkets(q.trim());
      setResults(data.events ?? []);
      onSearch?.(q);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <Box>
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search.placeholder")}
        variant="outlined"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#8b949e" }} />
              </InputAdornment>
            ),
          }
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#161b22",
            color: "#e6edf3",
            borderRadius: 2,
            "& fieldset": { borderColor: "#30363d" },
            "&:hover fieldset": { borderColor: "#7c3aed" },
            "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
          },
        }}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
        </Box>
      )}

      {error && (
        <Typography variant="body2" sx={{ color: "#f85149", mt: 2 }}>{error}</Typography>
      )}

      {results && !loading && (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {results.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#8b949e", textAlign: "center", py: 2 }}>
              {t("search.noresults")} &ldquo;{query}&rdquo;
            </Typography>
          ) : (
            results.slice(0, 10).map((evt: GammaEvent) => (
              <Box key={evt.id}>
                <EventCard event={evt} />
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
