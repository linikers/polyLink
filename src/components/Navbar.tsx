"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import ShowChartIcon from "@mui/icons-material/ShowChart";

export default function Navbar() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#0d1117", borderBottom: "1px solid #30363d" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <ShowChartIcon sx={{ color: "#7c3aed" }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{ fontWeight: 700, color: "#e6edf3", textDecoration: "none" }}
          >
            polyLink
          </Typography>
          <Chip label="Polymarket Dashboard" size="small" variant="outlined" sx={{ color: "#8b949e", borderColor: "#30363d" }} />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            component={Link}
            href="https://github.com/linikers/polyLink"
            target="_blank"
            sx={{ color: "#8b949e" }}
            size="small"
          >
            <Typography variant="caption" sx={{ mr: 0.5 }}>GitHub</Typography>
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
