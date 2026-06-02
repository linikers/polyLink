"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — captura erros em componentes filhos sem derrubar
 * a página inteira. Exibe fallback amigável com botão de retry.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            textAlign: "center",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 48, color: "#f85149", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#e6edf3", mb: 1 }}>
            Algo deu errado
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b949e", mb: 3, maxWidth: 400 }}>
            Um erro inesperado ocorreu ao renderizar esta seção.
            {this.state.error && (
              <>
                <br />
                <code style={{ fontSize: 11, color: "#f85149" }}>
                  {this.state.error.message}
                </code>
              </>
            )}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={this.handleRetry}
              sx={{
                color: "#8b949e",
                borderColor: "#30363d",
                textTransform: "none",
                "&:hover": { borderColor: "#7c3aed" },
              }}
            >
              Tentar novamente
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleReload}
              sx={{
                color: "#8b949e",
                borderColor: "#30363d",
                textTransform: "none",
                "&:hover": { borderColor: "#7c3aed" },
              }}
            >
              Recarregar página
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
