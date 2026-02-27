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
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login, LoginRequest } from '../api/auth';
import { setToken } from '../utils/auth';
import { getErrorMessage } from '../utils/errors';

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
      setToken(response.access_token);
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
        background: 'radial-gradient(circle at center, #64d4d4 0%, #299e9e 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '150%',
          height: '150%',
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            bgcolor: '#34495e',
            p: { xs: 4, sm: 6 },
            borderRadius: '4px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            border: '8px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Circular Logo Container */}
          <Box 
            sx={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              p: 1.5,
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
              bgcolor: 'rgba(255,255,255,0.05)'
            }}
          >
            <Box 
              component="img"
              src="/logo.png" 
              alt="Logo" 
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
              color: '#fff',
              fontWeight: 300,
              letterSpacing: '0.2rem',
              mb: 5,
              textTransform: 'uppercase',
              fontSize: '1.25rem',
              textAlign: 'center'
            }}
          >
            İSTİFADƏÇİ GİRİŞİ
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
                      <PersonOutlineIcon sx={{ color: '#fff', opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInput-root': {
                    color: '#fff',
                    paddingY: 0.5,
                    '&:before': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover:not(.Mui-disabled):before': { borderColor: 'rgba(255,255,255,0.6)' },
                    '&:after': { borderColor: '#fff' },
                  },
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255,255,255,0.5)',
                    ml: 4
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#fff', ml: 0 },
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
                      <LockOutlinedIcon sx={{ color: '#fff', opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInput-root': {
                    color: '#fff',
                    paddingY: 0.5,
                    '&:before': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover:not(.Mui-disabled):before': { borderColor: 'rgba(255,255,255,0.6)' },
                    '&:after': { borderColor: '#fff' },
                  },
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255,255,255,0.5)',
                    ml: 4
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#fff', ml: 0 },
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
                    sx={{ color: 'rgba(255,255,255,0.4)', '&.Mui-checked': { color: '#fff' } }} 
                  />
                }
                label={
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
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
                bgcolor: '#0d161d',
                color: '#fff',
                borderRadius: '2px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.15rem',
                '&:hover': {
                  bgcolor: '#000',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
                },
                transition: 'all 0.3s'
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
