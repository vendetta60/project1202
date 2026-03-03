import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login, LoginRequest } from '../api/auth';
import { setToken } from '../utils/auth';
import { getErrorMessage } from '../utils/errors';
import logo from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const primary = muiTheme.palette.primary.main;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginRequest & { rememberMe: boolean }>();

  const rememberMe = watch('rememberMe', false);

  const onSubmit = async (data: LoginRequest & { rememberMe: boolean }) => {
    setError('');
    setLoading(true);
    try {
      const { rememberMe, ...loginData } = data;
      const response = await login(loginData);
      setToken(response.access_token, response.refresh_token);
      queryClient.clear();
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
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#020617' : '#eff3fb',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '150%',
          height: '150%',
          opacity: 0,
          pointerEvents: 'none',
        }
      }}
    >
      <Box className="login-blob login-blob-1" />
      <Box className="login-blob login-blob-2" />
      <Box className="login-blob login-blob-3" />
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            bgcolor: isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)',
            p: { xs: 4, sm: 6 },
            borderRadius: '24px',
            boxShadow: isDark
              ? '0 24px 80px rgba(0,0,0,0.75)'
              : '0 22px 60px rgba(15,23,42,0.18)',
            border: isDark
              ? '1px solid rgba(148,163,184,0.25)'
              : '1px solid rgba(148,163,184,0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: isDark
                ? 'radial-gradient(circle at top left, rgba(129,140,248,0.24) 0, transparent 55%)'
                : 'radial-gradient(circle at top left, rgba(129,140,248,0.16) 0, transparent 55%)',
              opacity: 0.9,
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 1,
              borderRadius: '22px',
              border: `1px solid ${primary}33`,
              pointerEvents: 'none',
            }}
          />
          {/* Circular Logo Container */}
          <Box 
            sx={{ 
              width: 140, 
              height: 140, 
              borderRadius: '50%', 
              border: `2px solid ${isDark ? 'rgba(148,163,184,0.7)' : 'rgba(148,163,184,0.6)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              p: 1.5,
              filter: 'drop-shadow(0 10px 24px rgba(15,23,42,0.4))',
              bgcolor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(15,23,42,0.02)'
            }}
          >
            <Box 
              component="img"
              src={logo} 
              alt="Müraciət Qeydiyyat Sistemi" 
              sx={{ 
                maxWidth: '90%', 
                maxHeight: '90%',
                objectFit: 'contain'
              }} 
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              color: isDark ? '#e5e7eb' : '#0f172a',
              fontWeight: 800,
              letterSpacing: '0.24rem',
              mb: 2.5,
              textTransform: 'uppercase',
              fontSize: '1.25rem',
              textAlign: 'center'
            }}
          >
            İSTİFADƏÇİ GİRİŞİ
          </Typography>
          <Typography
            sx={{
              color: isDark ? 'rgba(148,163,184,0.9)' : 'rgba(71,85,105,0.9)',
              fontSize: '0.85rem',
              mb: 4,
              textAlign: 'center',
              maxWidth: 260,
            }}
          >
            Sistemə təhlükəsiz giriş üçün məlumatlarınızı daxil edin.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 3,
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '4px',
                '& .MuiAlert-icon': { color: '#f87171' }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                variant="standard"
                label="İstifadəçi adı"
                {...register('username', { required: 'Tələb olunur' })}
                error={!!errors.username}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: isDark ? 'rgba(226,232,240,0.8)' : 'rgba(15,23,42,0.8)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInput-root': {
                    color: isDark ? '#e5e7eb' : '#0f172a',
                    paddingY: 0.5,
                    '&:before': { borderColor: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(148,163,184,0.8)' },
                    '&:hover:not(.Mui-disabled):before': { borderColor: primary },
                    '&:after': { borderColor: primary },
                  },
                  '& .MuiInputLabel-root': { 
                    color: isDark ? 'rgba(148,163,184,0.85)' : 'rgba(100,116,139,0.9)',
                    ml: 4
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: primary, ml: 0 },
                  '& .MuiInputLabel-shrink': { ml: 0 }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                type="password"
                variant="standard"
                label="Şifrə"
                {...register('password', { required: 'Tələb olunur' })}
                error={!!errors.password}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: isDark ? 'rgba(226,232,240,0.8)' : 'rgba(15,23,42,0.8)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInput-root': {
                    color: isDark ? '#e5e7eb' : '#0f172a',
                    paddingY: 0.5,
                    '&:before': { borderColor: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(148,163,184,0.8)' },
                    '&:hover:not(.Mui-disabled):before': { borderColor: primary },
                    '&:after': { borderColor: primary },
                  },
                  '& .MuiInputLabel-root': { 
                    color: isDark ? 'rgba(148,163,184,0.85)' : 'rgba(100,116,139,0.9)',
                    ml: 4
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: primary, ml: 0 },
                  '& .MuiInputLabel-shrink': { ml: 0 }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe}
                    {...register('rememberMe')}
                    size="small" 
                    sx={{
                      color: isDark ? 'rgba(148,163,184,0.7)' : 'rgba(148,163,184,0.9)',
                      '&.Mui-checked': { color: primary }
                    }} 
                  />
                }
                label={
                  <Typography sx={{ color: isDark ? 'rgba(226,232,240,0.9)' : 'rgba(71,85,105,0.9)', fontSize: '0.85rem' }}>
                    Məni xatırla
                  </Typography>
                }
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 2,
                bgcolor: primary,
                color: '#fff',
                borderRadius: '999px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.15rem',
                '&:hover': {
                  bgcolor: muiTheme.palette.primary.dark,
                  boxShadow: `0 12px 35px ${primary}60`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
                boxShadow: `0 10px 30px ${primary}55`,
              }}
            >
              {loading ? 'DAXİL OLUNUR...' : 'DAXİL OL'}
            </Button>
          </form>
        </Box>
      </Container>
    </Box>
  );
}
