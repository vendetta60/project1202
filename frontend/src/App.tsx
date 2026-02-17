import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#3e4a21', // Military Olive
      light: '#5a6b32',
      dark: '#2c3e50', // Slate contrast
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a68b44', // Brass accent
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f0',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 800,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
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
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
