"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid2,
  Card,
  CardContent,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WhaleIcon from "@mui/icons-material/WaterDrop";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import AlertCenter from "./AlertCenter";
import WhaleDashboard from "./WhaleDashboard";
import NewsDashboard from "./NewsDashboard";
import ArbitrageEngine from "./ArbitrageEngine";

const tabs = [
  { id: "dashboard", labelKey: "admin.dashboard", icon: <DashboardIcon /> },
  { id: "favorites", labelKey: "admin.favorites", icon: <StarBorderIcon /> },
  { id: "arbitrage", labelKey: "admin.arbitrage", icon: <AutoFixHighIcon /> },
  { id: "whales", labelKey: "admin.whales", icon: <WhaleIcon /> },
  { id: "news", labelKey: "admin.news", icon: <NewReleasesIcon /> },
  { id: "alerts", labelKey: "admin.alerts", icon: <NotificationsIcon /> },
  { id: "settings", labelKey: "admin.settings", icon: <SettingsIcon /> },
];

interface Props {
  activeTab?: string;
  children?: React.ReactNode;
}

export default function AdminLayout({ activeTab = "dashboard", children }: Props) {
  const { t } = useLang();
  const [tab, setTab] = useState(activeTab);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleUnreadChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const alertContent = (
    <AlertCenter onUnreadChange={handleUnreadChange} />
  );

  const whaleContent = (
    <WhaleDashboard />
  );

  const newsContent = (
    <NewsDashboard />
  );

  const arbitrageContent = (
    <ArbitrageEngine />
  );

  const content = children || (
    tab === "alerts" ? alertContent :
    tab === "whales" ? whaleContent :
    tab === "news" ? newsContent :
    tab === "arbitrage" ? arbitrageContent : (
      <Grid2 container spacing={3}>
        {/* Stats cards */}
        {[
          { label: t("admin.favoritesCount"), value: "0", color: "#7c3aed" },
          { label: t("admin.alertsCount"), value: String(unreadCount), color: "#3fb950" },
          { label: t("admin.watchingCount"), value: "0", color: "#f0883e" },
        ].map((stat) => (
          <Grid2 key={stat.label} size={{ xs: 12, sm: 4 }}>
            <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "#8b949e" }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}

        {/* Placeholder */}
        <Grid2 size={12}>
          <Card sx={{ bgcolor: "#161b22", border: "1px solid #30363d", borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <ShowChartIcon sx={{ fontSize: 48, color: "#30363d", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#8b949e", mb: 1 }}>
                {t("admin.placeholder")}
              </Typography>
              <Typography variant="body2" sx={{ color: "#484f58" }}>
                {t("admin.placeholderDesc")}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    )
  );

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 240,
          bgcolor: "#0d1117",
          borderRight: "1px solid #30363d",
          borderRadius: 0,
          display: { xs: "none", md: "block" },
        }}
      >
        <List sx={{ pt: 2 }}>
          {tabs.map((item) => (
            <ListItemButton
              key={item.id}
              selected={tab === item.id}
              onClick={() => setTab(item.id)}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(124, 58, 237, 0.12)",
                  "& .MuiListItemIcon-root": { color: "#7c3aed" },
                  "& .MuiListItemText-primary": { color: "#e6edf3", fontWeight: 600 },
                },
              }}
            >
              <ListItemIcon sx={{ color: "#8b949e", minWidth: 40 }}>
                {item.id === "alerts" ? (
                  <Badge badgeContent={unreadCount} color="error" slotProps={{ badge: { sx: { fontSize: 10, height: 16, minWidth: 16 } } }}>
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={t(item.labelKey)}
                primaryTypographyProps={{ fontSize: "0.9rem", color: "#8b949e" }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Container maxWidth="lg">
          {content}
        </Container>
      </Box>
    </Box>
  );
}
