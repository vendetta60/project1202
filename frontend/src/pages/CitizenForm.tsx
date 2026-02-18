import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { getCitizen, updateCitizen, createCitizen, CreateCitizenRequest } from '../api/citizens';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getErrorMessage } from '../utils/errors';

export default function CitizenForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');

  // Vətəndaşı redaktə və ya yeni yaratmaq
  const isEditMode = !!id && id !== 'new';

  const { data: citizen, isLoading: citizenLoading } = useQuery({
    queryKey: ['citizen', id],
    queryFn: () => getCitizen(Number(id)),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateCitizenRequest>({
    defaultValues: {
      first_name: '',
      last_name: '',
      fin: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (!isEditMode) {
      // Yeni vətəndaş rejimi
      return;
    }

    if (citizen) {
      setValue('first_name', citizen.first_name);
      setValue('last_name', citizen.last_name);
      setValue('fin', citizen.fin);
      setValue('phone', citizen.phone || '');
      setValue('address', citizen.address || '');
    }
  }, [citizen, setValue, isEditMode, navigate]);

  const createMutation = useMutation({
    mutationFn: (data: CreateCitizenRequest) => createCitizen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizens'] });
      navigate('/citizens');
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateCitizenRequest) => updateCitizen(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizens'] });
      queryClient.invalidateQueries({ queryKey: ['citizen', id] });
      navigate('/citizens');
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const onSubmit = (data: CreateCitizenRequest) => {
    setError('');
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (citizenLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }} className="animate-fade-in">
        <Typography variant="h4" component="h1" fontWeight="900" color="primary" sx={{ mb: 1 }}>
          {isEditMode ? 'Vətəndaşı Redaktə Et' : 'Yeni Vətəndaş'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
          {isEditMode ? 'Vətəndaş məlumatlarının sistemdə yenilənməsi' : 'Sistemə yeni vətəndaşın əlavə edilməsi'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        className="animate-slide-up glass-card"
        sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="subtitle2" sx={{ color: '#3e4a21', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            ŞƏXSİ MƏLUMATLAR
          </Typography>
          <Divider sx={{ mb: 4, opacity: 0.1, bgcolor: '#3e4a21' }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Ad:</Typography>
              <TextField
                fullWidth
                size="small"
                {...register('first_name', {
                  required: 'Ad tələb olunur',
                })}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Soyad:</Typography>
              <TextField
                fullWidth
                size="small"
                {...register('last_name', {
                  required: 'Soyad tələb olunur',
                })}
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>FIN:</Typography>
              <TextField
                fullWidth
                size="small"
                {...register('fin', {
                  required: 'FIN tələb olunur',
                  minLength: {
                    value: 7,
                    message: 'FIN 7 simvoldan ibarət olmalıdır',
                  },
                  maxLength: {
                    value: 7,
                    message: 'FIN 7 simvoldan ibarət olmalıdır',
                  },
                  pattern: {
                    value: /^[A-Za-z0-9]+$/,
                    message: 'FIN yalnız hərf və rəqəmlərdən ibarət ola bilər',
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
                error={!!errors.fin}
                helperText={errors.fin?.message}
                inputProps={{ maxLength: 7, style: { textTransform: 'uppercase', fontWeight: 700, color: '#3e4a21' } }}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Telefon:</Typography>
              <TextField
                fullWidth
                size="small"
                {...register('phone')}
                placeholder="+994"
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Ünvan:</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                {...register('address')}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 3 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' }
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/citizens')}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              Ləğv et
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateMutation.isPending || createMutation.isPending}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 800,
                bgcolor: '#4a5d23',
                boxShadow: '0 4px 12px rgba(74, 93, 35, 0.3)',
                '&:hover': {
                  bgcolor: '#3a4a1b',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              {isEditMode ? 'Yadda saxla' : 'Əlavə et'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Layout>
  );
}
