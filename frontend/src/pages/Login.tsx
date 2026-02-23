import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { login, LoginRequest } from '../api/auth';
import { setToken } from '../utils/auth';
import { getErrorMessage } from '../utils/errors';

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const primary = theme.palette.primary.main;
  const isDark = theme.palette.mode === 'dark';
  const bgGradient = isDark
    ? `linear-gradient(135deg, ${alpha(primary, 0.4)} 0%, ${alpha(primary, 0.2)} 50%, #0d1117 100%)`
    : `linear-gradient(135deg, ${primary} 0%, ${theme.palette.primary.dark} 50%, ${alpha(primary, 0.85)} 100%)`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setError('');
    setLoading(true);
    try {
      const response = await login(data);
      setToken(response.access_token);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgGradient,
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.08), transparent)'
            : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.25), transparent)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={isDark ? 0 : 8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: isDark ? '1px solid' : 'none',
            borderColor: 'divider',
            boxShadow: isDark ? 'none' : '0 24px 48px rgba(0,0,0,0.12)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom
                fontWeight="bold"
                color="primary"
                sx={{ letterSpacing: '-0.02em' }}
              >
                Müraciət Qeydiyyat Sistemi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sistemə daxil olmaq üçün məlumatlarınızı daxil edin
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="İstifadəçi adı"
                margin="normal"
                size="medium"
                {...register('username', {
                  required: 'İstifadəçi adı tələb olunur',
                })}
                error={!!errors.username}
                helperText={errors.username?.message}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: isDark ? 'action.hover' : 'grey.50',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2, borderColor: 'primary.main' },
                  },
                }}
              />

              <TextField
                fullWidth
                type="password"
                label="Şifrə"
                margin="normal"
                size="medium"
                {...register('password', {
                  required: 'Şifrə tələb olunur',
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: isDark ? 'action.hover' : 'grey.50',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2, borderColor: 'primary.main' },
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: 2,
                  '&:hover': { boxShadow: 4 },
                }}
              >
                {loading ? 'Daxil olunur...' : 'Daxil ol'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
