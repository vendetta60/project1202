import { useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppealsList from './pages/AppealsList';
import AppealForm from './pages/AppealForm';
import UsersList from './pages/admin/UsersList';
import UserForm from './pages/admin/UserForm';
import Parameters from './pages/admin/Parameters';
import Reports from './pages/Reports';
import Logs from './pages/Logs';
import SystemAdmin from './pages/admin/SystemAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { isAuthenticated } from './utils/auth';
import { useTheme } from './context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { mode, primaryColor } = useTheme();
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: primaryColor,
            light: primaryColor + '99',
            dark: primaryColor + 'dd',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#a68b44',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f4f6f0',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#e0e0e0' : '#1f2937',
            secondary: mode === 'dark' ? '#b0b0b0' : '#4b5563',
          },
        },
        typography: {
          fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          h5: { fontWeight: 800, letterSpacing: '-0.02em' },
          h4: { fontWeight: 800 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
        },
      }),
    [mode, primaryColor]
  );

  // Sync theme to CSS variables so global CSS and class-based styles (e.g. .military-table-header, .glass-card) follow theme/dark mode
  useEffect(() => {
    const r = document.documentElement;
    const isDark = mode === 'dark';
    r.style.setProperty('--app-primary', primaryColor);
    r.style.setProperty('--app-bg', isDark ? '#121212' : '#f4f6f0');
    r.style.setProperty('--app-paper', isDark ? '#1e1e1e' : '#ffffff');
    r.style.setProperty('--app-text', isDark ? '#e0e0e0' : '#1f2937');
    r.style.setProperty('--app-text-secondary', isDark ? '#9e9e9e' : '#4b5563');
    r.style.setProperty('--app-border', isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)');
    document.body.setAttribute('data-theme', mode);
  }, [mode, primaryColor]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appeals"
                element={
                  <ProtectedRoute>
                    <AppealsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appeals/new"
                element={
                  <ProtectedRoute>
                    <AppealForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appeals/:id"
                element={
                  <ProtectedRoute>
                    <AppealForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <SystemAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <UsersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/new"
                element={
                  <ProtectedRoute>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute>
                    <Logs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/parameters"
                element={
                  <ProtectedRoute>
                    <Parameters />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
