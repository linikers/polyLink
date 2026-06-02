"use client";

import { Box, Typography, Button } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, backgroundColor: "#0d1117" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            p: 4,
          }}
        >
          <Typography variant="h3" sx={{ color: "#f85149", fontWeight: 800, mb: 2 }}>
            polyLink
          </Typography>
          <Typography variant="h6" sx={{ color: "#e6edf3", mb: 1 }}>
            Erro crítico na aplicação
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", mb: 4, maxWidth: 400 }}>
            Não foi possível carregar o polyLink. Isso pode ser causado por um
            cache desatualizado. Tente limpar o cache do navegador ou usar uma
            janela anônima.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => reset()}
            sx={{
              color: "#e6edf3",
              borderColor: "#7c3aed",
              textTransform: "none",
              px: 4,
              "&:hover": { bgcolor: "rgba(124,58,237,0.1)" },
            }}
          >
            Tentar novamente
          </Button>
          <Typography variant="caption" sx={{ color: "#484f58", mt: 4 }}>
            {error?.message && `Error: ${error.message}`}
          </Typography>
        </Box>
      </body>
    </html>
  );
}
