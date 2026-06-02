"use client";

import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 10,
        textAlign: "center",
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 56, color: "#f85149", mb: 2 }} />
      <Typography variant="h5" sx={{ color: "#e6edf3", mb: 1, fontWeight: 700 }}>
        Erro ao carregar
      </Typography>
      <Typography variant="body2" sx={{ color: "#8b949e", mb: 3, maxWidth: 480 }}>
        Ocorreu um erro ao carregar a página inicial. Pode ser um problema de
        rede com a API do Polymarket ou um cache desatualizado.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={() => reset()}
          sx={{
            color: "#e6edf3",
            borderColor: "#7c3aed",
            textTransform: "none",
            px: 3,
            "&:hover": { bgcolor: "rgba(124,58,237,0.1)" },
          }}
        >
          Tentar novamente
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{
            color: "#8b949e",
            borderColor: "#30363d",
            textTransform: "none",
            px: 3,
            "&:hover": { borderColor: "#8b949e" },
          }}
        >
          Recarregar página
        </Button>
      </Box>
    </Box>
  );
}
