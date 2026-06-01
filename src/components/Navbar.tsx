"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Link from "next/link";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useLang } from "@/lib/lang";

export default function Navbar() {
  const { lang, setLang, t } = useLang();

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
          <Chip label={t("brand.subtitle")} size="small" variant="outlined" sx={{ color: "#8b949e", borderColor: "#30363d" }} />
          <Box sx={{ flexGrow: 1 }} />
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(_, v) => v && setLang(v)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: "#8b949e",
                borderColor: "#30363d",
                px: 1,
                py: 0.3,
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "none",
                "&.Mui-selected": {
                  color: "#e6edf3",
                  bgcolor: "#21262d",
                },
              },
            }}
          >
            <ToggleButton value="pt-BR">{t("nav.lang.pt")}</ToggleButton>
            <ToggleButton value="en">{t("nav.lang.en")}</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
