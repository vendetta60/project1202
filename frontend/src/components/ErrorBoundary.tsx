import React, { type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 2,
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 700 }}>
              Xəta baş verdi
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Səhifənin yüklənməsində xəta odanaraq qalındı. Əngəl olduğuna görə yazıq.
            </Typography>
            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  textAlign: 'left',
                  overflowX: 'auto',
                }}
              >
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', color: '#d32f2f' }}>
                  {this.state.error.message}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              onClick={() => window.location.href = '/'}
              sx={{ bgcolor: '#4a5d23' }}
            >
              Əsas səhifəyə qayıt
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
