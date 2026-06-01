"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Divider,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import CircleIcon from "@mui/icons-material/Circle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  type AlertRule,
  type AlertEvent,
  loadRules,
  saveRules,
  loadEvents,
  saveEvents,
  markAsRead,
  markAllAsRead,
  unreadCount,
  startAlertEngine,
  stopAlertEngine,
} from "@/lib/alerts";
import { useLang } from "@/lib/lang";

interface Props {
  onUnreadChange?: (count: number) => void;
}

export default function AlertCenter({ onUnreadChange }: Props) {
  const { t } = useLang();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"rules" | "history">("rules");
  const [engineActive, setEngineActive] = useState(false);

  // Load data
  useEffect(() => {
    setRules(loadRules());
    setEvents(loadEvents());
  }, []);

  // Notify parent of unread count
  useEffect(() => {
    onUnreadChange?.(unreadCount());
  }, [events, onUnreadChange]);

  // Toggle rule
  const toggleRule = (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    setRules(updated);
    saveRules(updated);
  };

  // Update threshold
  const updateThreshold = (ruleId: string, value: number) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, threshold: value } : r
    );
    setRules(updated);
    saveRules(updated);
  };

  // Start/stop engine
  const toggleEngine = useCallback(() => {
    if (engineActive) {
      stopAlertEngine();
      setEngineActive(false);
    } else {
      const cleanup = startAlertEngine(rules, (ev: AlertEvent) => {
        setEvents((prev) => [ev, ...prev]);
      });
      setEngineActive(true);
    }
  }, [engineActive, rules]);

  // Clear events
  const clearEvents = () => {
    saveEvents([]);
    setEvents([]);
  };

  // Delete single event
  const deleteEvent = (eventId: string) => {
    const updated = events.filter((e) => e.id !== eventId);
    saveEvents(updated);
    setEvents(updated);
  };

  // Read event
  const readEvent = (eventId: string) => {
    markAsRead(eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, read: true } : e))
    );
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case "high": return "#f85149";
      case "warning": return "#f0883e";
      default: return "#8b949e";
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "whale": return "🐋";
      case "volume": return "📈";
      case "odds": return "🎲";
      case "opportunity": return "🤖";
      default: return "🔔";
    }
  };

  return (
    <Box>
      {/* Engine toggle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          variant={engineActive ? "outlined" : "contained"}
          startIcon={engineActive ? <NotificationsIcon /> : <NotificationsOffIcon />}
          onClick={toggleEngine}
          sx={{
            bgcolor: engineActive ? "transparent" : "#7c3aed",
            borderColor: engineActive ? "#f85149" : "#7c3aed",
            color: engineActive ? "#f85149" : "#fff",
            "&:hover": {
              bgcolor: engineActive ? "rgba(248,81,73,0.1)" : "#6d28d9",
            },
          }}
        >
          {engineActive ? "Desativar Engine" : "Ativar Engine"}
        </Button>
        <Typography variant="caption" sx={{ color: "#8b949e" }}>
          {engineActive
            ? "Monitorando a cada 30s (modo demo)"
            : "Ative para começar a receber alertas"}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Chip
          label={t("admin.alerts")}
          onClick={() => setActiveTab("rules")}
          variant={activeTab === "rules" ? "filled" : "outlined"}
          sx={{
            color: activeTab === "rules" ? "#e6edf3" : "#8b949e",
            bgcolor: activeTab === "rules" ? "#7c3aed" : "transparent",
            borderColor: "#30363d",
            cursor: "pointer",
          }}
        />
        <Chip
          label={`Histórico (${events.filter((e) => !e.read).length})`}
          onClick={() => setActiveTab("history")}
          variant={activeTab === "history" ? "filled" : "outlined"}
          sx={{
            color: activeTab === "history" ? "#e6edf3" : "#8b949e",
            bgcolor: activeTab === "history" ? "#7c3aed" : "transparent",
            borderColor: "#30363d",
            cursor: "pointer",
          }}
        />
      </Box>

      {activeTab === "rules" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rules.map((rule) => (
            <Card
              key={rule.id}
              sx={{
                bgcolor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: 2,
                opacity: rule.enabled ? 1 : 0.5,
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "1.2rem" }}>
                    {typeIcon(rule.type)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#e6edf3", flex: 1 }}>
                    {rule.label}
                  </Typography>
                  <Switch
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-thumb": { bgcolor: rule.enabled ? "#7c3aed" : "#484f58" },
                      "& .MuiSwitch-track": { bgcolor: rule.enabled ? "rgba(124,58,237,0.3)" : "#21262d" },
                    }}
                  />
                </Box>

                {rule.enabled && (
                  <Box sx={{ mt: 2, px: 1 }}>
                    <Typography variant="caption" sx={{ color: "#8b949e" }}>
                      Threshold: {rule.type === "whale" ? `US$ ${rule.threshold.toLocaleString()}` : `${rule.threshold}%`}
                    </Typography>
                    <Slider
                      value={rule.threshold}
                      onChange={(_, v) => updateThreshold(rule.id, v as number)}
                      min={rule.type === "whale" ? 1000 : 5}
                      max={rule.type === "whale" ? 100000 : 100}
                      step={rule.type === "whale" ? 1000 : 5}
                      size="small"
                      sx={{ color: "#7c3aed", "& .MuiSlider-rail": { bgcolor: "#30363d" } }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {activeTab === "history" && (
        <Box>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              size="small"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => {
                markAllAsRead();
                setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
              }}
              sx={{ color: "#8b949e", textTransform: "none", fontSize: "0.8rem" }}
            >
              Marcar todas lidas
            </Button>
            <Button
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={clearEvents}
              sx={{ color: "#8b949e", textTransform: "none", fontSize: "0.8rem" }}
            >
              Limpar tudo
            </Button>
          </Box>

          {events.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "#484f58" }}>
              <NotificationsOffIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="body2">Nenhum alerta ainda</Typography>
            </Box>
          ) : (
            <List sx={{ bgcolor: "#161b22", borderRadius: 2, border: "1px solid #30363d" }}>
              {events.slice(0, 50).map((ev) => (
                <Box key={ev.id}>
                  <ListItem
                    sx={{
                      opacity: ev.read ? 0.6 : 1,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                    }}
                    secondaryAction={
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {!ev.read && (
                          <IconButton size="small" onClick={() => readEvent(ev.id)}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#8b949e" }} />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => deleteEvent(ev.id)}>
                          <DeleteOutlineIcon sx={{ fontSize: 16, color: "#8b949e" }} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Typography variant="body2">{typeIcon(ev.type)}</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#e6edf3" }}>
                            {ev.title}
                          </Typography>
                          <CircleIcon
                            sx={{ fontSize: 8, color: severityColor(ev.severity) }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ color: "#8b949e" }}>
                            {ev.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#484f58", display: "block", mt: 0.5 }}>
                            {new Date(ev.timestamp).toLocaleString("pt-BR")}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ borderColor: "#30363d" }} />
                </Box>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
}
