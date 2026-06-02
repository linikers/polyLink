"use client";

import { Box, Card, CardContent } from "@mui/material";

export default function SkeletonCard() {
  return (
    <Card sx={{ bgcolor: "#161b22", borderRadius: 2, border: "1px solid #30363d", overflow: "hidden" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Category skeleton */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Box sx={{ width: 80, height: 12, borderRadius: 1, bgcolor: "#21262d", animation: "pulse 1.5s ease-in-out infinite" }} />
          <Box sx={{ width: 40, height: 12, borderRadius: 1, bgcolor: "#21262d", animation: "pulse 1.5s ease-in-out infinite" }} />
        </Box>
        {/* Title skeleton */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ width: "90%", height: 16, borderRadius: 1, bgcolor: "#21262d", mb: 0.5, animation: "pulse 1.5s ease-in-out infinite" }} />
          <Box sx={{ width: "60%", height: 16, borderRadius: 1, bgcolor: "#21262d", animation: "pulse 1.5s ease-in-out infinite" }} />
        </Box>
        {/* Bar skeleton */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Box sx={{ width: 60, height: 10, borderRadius: 1, bgcolor: "#21262d", animation: "pulse 1.5s ease-in-out infinite" }} />
            <Box sx={{ width: 60, height: 10, borderRadius: 1, bgcolor: "#21262d", animation: "pulse 1.5s ease-in-out infinite" }} />
          </Box>
          <Box sx={{ height: 8, borderRadius: 1, bgcolor: "#21262d", animation: "pulse 1.5s ease-in-out infinite" }} />
        </Box>
        {/* Footer skeleton */}
        <Box sx={{ width: 100, height: 10, borderRadius: 1, bgcolor: "#21262d", animation: "pulse 1.5s ease-in-out infinite" }} />
      </CardContent>
    </Card>
  );
}
