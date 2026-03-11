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
  Paper,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import LockResetIcon from '@mui/icons-material/LockReset';
import { changePassword, ChangePasswordRequest } from '../api/auth';
import { getErrorMessage } from '../utils/errors';
import logo from '../assets/logo.png';

export default function FirstTimeChangePassword() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const muiTheme = useMuiTheme();
  const primary = muiTheme.palette.primary.main;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordRequest & { confirm: string }>();

  const newPassword = watch('new_password', '');

  const onSubmit = async (data: ChangePasswordRequest & { confirm?: string }) => {
    setError('');
    setLoading(true);
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isDark = muiTheme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isDark ? '#0d1117' : '#f0f2f8',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 4,
          borderRadius: 3,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.4)' : '0 20px 50px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 56, width: 'auto', mb: 2 }}
          />
          <LockResetIcon sx={{ fontSize: 48, color: primary, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            İlk giriş – parolunuzu dəyişin
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Adminin təyin etdiyi parolu daxil edin və öz parolunuzu təyin edin.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            type="password"
            label="Cari şifrə (adminin verdiyi)"
            {...register('current_password', { required: 'Cari şifrə tələb olunur' })}
            error={!!errors.current_password}
            helperText={errors.current_password?.message}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Yeni şifrə"
            {...register('new_password', {
              required: 'Yeni şifrə tələb olunur',
              minLength: { value: 6, message: 'Ən azı 6 simvol' },
            })}
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Yeni şifrəni təsdiq edin"
            {...register('confirm', {
              required: 'Təsdiq tələb olunur',
              validate: (v) => v === newPassword || 'Şifrələr üst-üstə düşmür',
            })}
            error={!!errors.confirm}
            helperText={errors.confirm?.message}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 700 }}
          >
            {loading ? 'Yoxlanılır...' : 'Parolu təsdiq et'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
