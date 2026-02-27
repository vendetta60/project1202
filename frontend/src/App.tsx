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
import AdminRoute from './components/AdminRoute';
import PermissionRoute from './components/PermissionRoute';
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
            light: primaryColor + 'aa',
            dark: primaryColor + 'ee',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#e9a84c',
            light: '#f0bd74',
            dark: '#c48926',
            contrastText: '#1a1a2e',
          },
          background: {
            default: mode === 'dark' ? '#0d1117' : '#f0f2f8',
            paper: mode === 'dark' ? '#161b27' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#e8ecf4' : '#1a1f36',
            secondary: mode === 'dark' ? '#8892a4' : '#5a6175',
          },
          divider: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(26,31,54,0.08)',
          error: { main: '#ef4444' },
          success: { main: '#10b981' },
          warning: { main: '#f59e0b' },
          info: { main: '#3b82f6' },
        },
        typography: {
          fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          h4: { fontWeight: 800, letterSpacing: '-0.025em' },
          h5: { fontWeight: 800, letterSpacing: '-0.02em' },
          h6: { fontWeight: 700, letterSpacing: '-0.01em' },
          body1: { letterSpacing: '0.01em' },
          body2: { letterSpacing: '0.01em' },
          button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
        },
        shape: { borderRadius: 14 },
        shadows: [
          'none',
          '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
          '0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.04)',
          '0 20px 25px rgba(0,0,0,0.06), 0 8px 10px rgba(0,0,0,0.04)',
          '0 25px 50px rgba(0,0,0,0.08)',
          ...Array(19).fill('none'),
        ] as any,
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              * { box-sizing: border-box; }
              ::-webkit-scrollbar { width: 6px; height: 6px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 99px; }
              ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.5); }
            `,
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                fontWeight: 700,
                padding: '9px 20px',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                },
              },
              contained: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                transition: 'background 0.15s ease',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { fontWeight: 600, borderRadius: 8 },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: { borderRadius: 18 },
            },
          },
        },
      }),
    [mode, primaryColor]
  );

  // Sync theme to CSS variables
  useEffect(() => {
    const r = document.documentElement;
    const isDark = mode === 'dark';
    r.style.setProperty('--app-primary', primaryColor);
    r.style.setProperty('--app-bg', isDark ? '#0d1117' : '#f0f2f8');
    r.style.setProperty('--app-paper', isDark ? '#161b27' : '#ffffff');
    r.style.setProperty('--app-text', isDark ? '#e8ecf4' : '#1a1f36');
    r.style.setProperty('--app-text-secondary', isDark ? '#8892a4' : '#5a6175');
    r.style.setProperty('--app-border', isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,31,54,0.08)');
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
              <PermissionRoute permission="view_appeals">
                <AppealsList />
              </PermissionRoute>
            }
          />
          <Route
            path="/appeals/new"
            element={
              <PermissionRoute permission="create_appeal">
                <AppealForm />
              </PermissionRoute>
            }
          />
          <Route
            path="/appeals/:id"
            element={
              <PermissionRoute permission="view_appeal_details">
                <AppealForm />
              </PermissionRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PermissionRoute permission="export_appeals">
                <Reports />
              </PermissionRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <SystemAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PermissionRoute permission="view_users">
                <UsersList />
              </PermissionRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <PermissionRoute permission="create_user">
                <UserForm />
              </PermissionRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <PermissionRoute permission="edit_user">
                <UserForm />
              </PermissionRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <AdminRoute>
                <Logs />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/parameters"
            element={
              <AdminRoute>
                <Parameters />
              </AdminRoute>
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
