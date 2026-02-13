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
import { getCitizen, updateCitizen, CreateCitizenRequest } from '../api/citizens';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getErrorMessage } from '../utils/errors';

export default function CitizenForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');

  // Yalnız mövcud vətəndaşı redaktə etməyə icazə veririk
  const isEditMode = !!id;

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
      // Yeni vətəndaş yaratmağa icazə verilmir
      navigate('/citizens');
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" sx={{ color: '#1f2937' }}>
          Vətəndaşı Redaktə Et
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 4, bgcolor: '#f9fafb' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
            Şəxsi Məlumatlar
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad"
                size="small"
                {...register('first_name', {
                  required: 'Ad tələb olunur',
                })}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soyad"
                size="small"
                {...register('last_name', {
                  required: 'Soyad tələb olunur',
                })}
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="FIN"
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
                inputProps={{ maxLength: 7, style: { textTransform: 'uppercase' } }}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                size="small"
                {...register('phone')}
                placeholder="+994501234567"
                sx={{ bgcolor: 'white' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ünvan"
                multiline
                rows={3}
                size="small"
                {...register('address')}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={updateMutation.isPending}
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.2,
                px: 3,
                '&:hover': {
                  bgcolor: '#1565c0',
                },
              }}
            >
              Yadda saxla
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/citizens')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                py: 1.2,
                px: 3,
              }}
            >
              Ləğv et
            </Button>
          </Box>
        </form>
      </Paper>
    </Layout>
  );
}
