import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mq_remember_login_v1');
      if (!raw) return;
      const parsed = JSON.parse(raw) as { username?: string; password?: string } | null;
      if (parsed?.username) setValue('username', parsed.username);
      if (parsed?.password) setValue('password', parsed.password);
      setValue('rememberMe', true);
    } catch {
      // ignore
    }
  }, [setValue]);

  const onSubmit = async (data: LoginRequest & { rememberMe: boolean }) => {
    setError('');
    setLoading(true);
    try {
      const { rememberMe, ...loginData } = data;
      const response = await login(loginData);
      try {
        if (rememberMe) {
          localStorage.setItem('mq_remember_login_v1', JSON.stringify({ username: loginData.username, password: loginData.password }));
        } else {
          localStorage.removeItem('mq_remember_login_v1');
        }
      } catch {
        // ignore
      }
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
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}
    >
      {/* Sol panel: gradient + böyük loqo */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          minHeight: { xs: '280px', md: '100vh' },
          background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 50%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: 320, md: 440 },
            bgcolor: 'rgba(255,255,255,0.98)',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
            px: 4,
            minHeight: { xs: 240, md: 380 },
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Vətəndaş müraciətlərinin elektron qeydiyyatı"
            sx={{
              width: '85%',
              maxWidth: 340,
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>

      {/* Sağ panel: giriş formu */}
      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 'auto', md: '100vh' },
          bgcolor: isDark ? '#1e293b' : '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: isDark ? 'rgba(30,41,59,0.98)' : '#ffffff',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* <Box
            component="img"
            src={logo}
            alt="Vətəndaş müraciətlərinin elektron qeydiyyatı"
            sx={{ width: 80, height: 'auto', objectFit: 'contain', mb: 2 }}
          /> */}
          <Typography
            variant="h5"
            sx={{
              color: primary,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontSize: '1.1rem',
              mb: 3,
            }}
          >
            Xoş gəlmisiniz
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <TextField
              fullWidth
              placeholder="İstifadəçi adı"
              {...register('username', { required: 'İstifadəçi adı tələb olunur' })}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={loading}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' },
                  '&:hover fieldset': { borderColor: primary },
                  '&.Mui-focused fieldset': { borderWidth: 2, borderColor: primary },
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              placeholder="Şifrə"
              {...register('password', { required: 'Şifrə tələb olunur' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' },
                  '&:hover fieldset': { borderColor: primary },
                  '&.Mui-focused fieldset': { borderWidth: 2, borderColor: primary },
                },
              }}
            />
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    {...register('rememberMe')}
                    size="small"
                    sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', '&.Mui-checked': { color: primary } }}
                  />
                }
                label={
                  <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)', fontSize: '0.875rem' }}>
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
                py: 1.75,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                bgcolor: primary,
                '&:hover': { bgcolor: muiTheme.palette.primary.dark },
              }}
            >
              {loading ? 'Daxil olunur...' : 'Daxil ol'}
            </Button>
          </form>

          <Typography
            sx={{
              mt: 4,
              fontSize: '0.75rem',
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
            }}
          >
            © Vətəndaş müraciətlərinin elektron qeydiyyatı
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
