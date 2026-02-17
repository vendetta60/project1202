import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    Button,
    Paper,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Grid,
    Divider,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { getUser, createUser } from '../../api/users';
import { getUserSections } from '../../api/lookups';
import type { UserCreate } from '../../api/users';

interface FormData {
    username: string;
    password?: string;
    surname?: string;
    name?: string;
    section_id?: number | '';
    is_admin: boolean;
}

export default function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast, ToastComponent } = useToast();
    const isEdit = Boolean(id);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            username: '',
            password: '',
            surname: '',
            name: '',
            section_id: '',
            is_admin: false,
        },
    });

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(Number(id)),
        enabled: isEdit,
    });

    const { data: userSections } = useQuery({
        queryKey: ['userSections'],
        queryFn: getUserSections,
    });

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showToast('İstifadəçi yaradıldı', 'success');
            navigate('/admin/users');
        },
        onError: (error: any) => {
            showToast(error.response?.data?.detail || 'Xəta baş verdi', 'error');
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                surname: user.surname || '',
                name: user.name || '',
                section_id: user.section_id || '',
                is_admin: user.is_admin,
            });
        }
    }, [user, reset]);

    const onSubmit = (data: FormData) => {
        if (isEdit) {
            showToast('Redaktə hələ aktiv deyil', 'info');
        } else {
            if (!data.password) {
                showToast('Şifrə tələb olunur', 'error');
                return;
            }
            const createData: UserCreate = {
                username: data.username,
                password: data.password,
                surname: data.surname || undefined,
                name: data.name || undefined,
                section_id: data.section_id ? Number(data.section_id) : undefined,
            };
            createMutation.mutate(createData);
        }
    };

    if (userLoading) {
        return (
            <Layout>
                <LoadingSpinner />
            </Layout>
        );
    }

    return (
        <Layout>
            <Box sx={{ mb: 4 }} className="animate-fade-in">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/users')}
                    sx={{
                        mb: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#4a5d23',
                        '&:hover': { bgcolor: 'rgba(74, 93, 35, 0.1)' }
                    }}
                >
                    Geri
                </Button>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="900" color="primary">
                    {isEdit ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi'}
                </Typography>
            </Box>

            <Paper
                elevation={0}
                className="animate-slide-up glass-card"
                sx={{
                    p: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    maxWidth: 800,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#2c3e50' }}>
                        {isEdit ? 'İstifadəçi Məlumatları' : 'Yeni İstifadəçi'}
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Controller
                                name="username"
                                control={control}
                                rules={{ required: 'İstifadəçi adı tələb olunur' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="İstifadəçi adı"
                                        fullWidth
                                        size="small"
                                        disabled={isEdit}
                                        error={Boolean(errors.username)}
                                        helperText={errors.username?.message}
                                        sx={{
                                            bgcolor: 'white',
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {!isEdit && (
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: 'Şifrə tələb olunur',
                                        minLength: { value: 6, message: 'Şifrə ən azı 6 simvol olmalıdır' },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Şifrə"
                                            type="password"
                                            fullWidth
                                            size="small"
                                            error={Boolean(errors.password)}
                                            helperText={errors.password?.message}
                                            sx={{
                                                bgcolor: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="surname"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Soyad"
                                        fullWidth
                                        size="small"
                                        sx={{
                                            bgcolor: 'white',
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Ad"
                                        fullWidth
                                        size="small"
                                        sx={{
                                            bgcolor: 'white',
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="section_id"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small">
                                        <InputLabel sx={{ color: '#666', '&.Mui-focused': { color: '#4a5d23' } }}>User Section</InputLabel>
                                        <Select
                                            {...field}
                                            label="User Section"
                                            sx={{
                                                bgcolor: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>Seçilməyib</em>
                                            </MenuItem>
                                            {userSections?.map((us) => (
                                                <MenuItem key={us.id} value={us.id}>
                                                    {us.user_section}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="is_admin"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                {...field}
                                                checked={field.value}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: '#4a5d23',
                                                        '& + .MuiSwitch-track': {
                                                            backgroundColor: '#4a5d23',
                                                        },
                                                    },
                                                }}
                                            />
                                        }
                                        label="Admin hüquqları?"
                                        sx={{ color: '#374151', fontWeight: 500 }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={createMutation.isPending}
                                    sx={{
                                        bgcolor: '#4a5d23',
                                        color: 'white',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        py: 1.2,
                                        px: 4,
                                        borderRadius: 1.5,
                                        '&:hover': {
                                            bgcolor: '#3a4a1b',
                                        },
                                    }}
                                >
                                    Yadda saxla
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/admin/users')}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.2,
                                        px: 3,
                                        color: '#666',
                                        borderColor: '#ccc',
                                        borderRadius: 1.5,
                                        '&:hover': {
                                            borderColor: '#999',
                                            bgcolor: 'rgba(0,0,0,0.02)'
                                        }
                                    }}
                                >
                                    Ləğv et
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <ToastComponent />
        </Layout>
    );
}
