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
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { login, LoginRequest } from '../api/auth';
import { setToken } from '../utils/auth';
import { getErrorMessage } from '../utils/errors';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ borderRadius: 2, bgcolor: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom
                fontWeight="bold"
                sx={{ color: '#1f2937' }}
              >
                Müraciət Qeydiyyat Sistemi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sistemə daxil olmaq üçün məlumatlarınızı daxil edin
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="İstifadəçi adı"
                margin="normal"
                size="small"
                {...register('username', {
                  required: 'İstifadəçi adı tələb olunur',
                })}
                error={!!errors.username}
                helperText={errors.username?.message}
                autoFocus
                sx={{ bgcolor: '#f9fafb' }}
              />

              <TextField
                fullWidth
                type="password"
                label="Şifrə"
                margin="normal"
                size="small"
                {...register('password', {
                  required: 'Şifrə tələb olunur',
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ bgcolor: '#f9fafb' }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="medium"
                startIcon={<LoginIcon />}
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  bgcolor: '#1976d2',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#1565c0',
                  },
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
