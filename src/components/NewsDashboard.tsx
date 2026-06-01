"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Link,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { fetchNews, type NewsItem } from "@/lib/news";

const impactColor = (impact?: string) => {
  switch (impact) {
    case "positive": return "#3fb950";
    case "negative": return "#f85149";
    default: return "#8b949e";
  }
};

const impactLabel = (impact?: string) => {
  switch (impact) {
    case "positive": return "🔥 Alta";
    case "negative": return "🔻 Baixa";
    default: return "⚪ Neutro";
  }
};

export default function NewsDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const items = await fetchNews(filter ?? undefined);
        if (!cancelled) setNews(items);
      } catch {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 120000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [filter]);

  const categories = [
    { id: null, label: "Todas" },
    { id: "politics", label: "Política" },
    { id: "crypto", label: "Crypto" },
    { id: "economics", label: "Economia" },
    { id: "sports", label: "Esportes" },
    { id: "technology", label: "Tecnologia" },
  ];

  const [showMockBadge, setShowMockBadge] = useState(false);
  useEffect(() => {
    // Check if using mock data (no API key)
    if (!process.env.NEXT_PUBLIC_NEWSAPI_KEY) {
      setShowMockBadge(true);
    }
  }, []);

  return (
    <Box>
      {/* Category filter */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <Chip
            key={cat.id ?? "all"}
            label={cat.label}
            onClick={() => setFilter(cat.id)}
            variant={filter === cat.id ? "filled" : "outlined"}
            sx={{
              color: filter === cat.id ? "#e6edf3" : "#8b949e",
              bgcolor: filter === cat.id ? "#7c3aed" : "transparent",
              borderColor: "#30363d",
              cursor: "pointer",
            }}
          />
        ))}
      </Box>

      {showMockBadge && (
        <Typography variant="caption" sx={{ color: "#f0883e", display: "block", mb: 2 }}>
          ⚡ Modo simulado — configure <code>NEXT_PUBLIC_NEWSAPI_KEY</code> no .env para notícias reais
        </Typography>
      )}
      <Typography variant="body2" sx={{ color: "#8b949e", mb: 3 }}>
        Notícias relacionadas a mercados de previsão — atualizado a cada 2 min
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
        </Box>
      ) : news.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6, color: "#484f58" }}>
          <Typography variant="body2">Nenhuma notícia encontrada para esta categoria.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {news.map((item, i) => (
            <Card
              key={i}
              sx={{
                bgcolor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: 2,
                "&:hover": { borderColor: "#7c3aed" },
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: "#e6edf3", fontWeight: 600, mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#8b949e", display: "block", mb: 1 }}>
                      {item.source} • {new Date(item.publishedAt).toLocaleString("pt-BR")}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#484f58" }}>
                      {item.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, minWidth: 90 }}>
                    <Chip
                      label={impactLabel(item.impact)}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        bgcolor: `${impactColor(item.impact)}18`,
                        color: impactColor(item.impact),
                        fontWeight: 600,
                      }}
                    />
                    {item.relevance && (
                      <Typography variant="caption" sx={{ color: "#8b949e" }}>
                        Rel.: {item.relevance}%
                      </Typography>
                    )}
                    {item.url && item.url !== "#" && (
                      <IconButton
                        href={item.url}
                        target="_blank"
                        size="small"
                        sx={{ color: "#484f58", "&:hover": { color: "#7c3aed" } }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
