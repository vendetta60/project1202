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
import { getUser, createUser, updateUser } from '../../api/users';
import { getOrgUnits } from '../../api/orgUnits';
import type { UserCreate, UserUpdate } from '../../api/users';

interface FormData {
    username: string;
    password?: string;
    full_name?: string;
    org_unit_id?: number | '';
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
            full_name: '',
            org_unit_id: '',
            is_admin: false,
        },
    });

    // Fetch user data if editing
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(Number(id)),
        enabled: isEdit,
    });

    // Fetch org units for dropdown
    const { data: orgUnits } = useQuery({
        queryKey: ['orgUnits'],
        queryFn: getOrgUnits,
    });

    // Create user mutation
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

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UserUpdate }) =>
            updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            showToast('İstifadəçi yeniləndi', 'success');
            navigate('/admin/users');
        },
        onError: (error: any) => {
            showToast(error.response?.data?.detail || 'Xəta baş verdi', 'error');
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                full_name: user.full_name || '',
                org_unit_id: user.org_unit_id || '',
                is_admin: user.is_admin,
            });
        }
    }, [user, reset]);

    const onSubmit = (data: FormData) => {
        if (isEdit) {
            const updateData: UserUpdate = {
                full_name: data.full_name || undefined,
                org_unit_id: data.org_unit_id ? Number(data.org_unit_id) : undefined,
                is_admin: data.is_admin,
            };
            updateMutation.mutate({ id: Number(id), data: updateData });
        } else {
            if (!data.password) {
                showToast('Şifrə tələb olunur', 'error');
                return;
            }
            const createData: UserCreate = {
                username: data.username,
                password: data.password,
                full_name: data.full_name || undefined,
                org_unit_id: data.org_unit_id ? Number(data.org_unit_id) : undefined,
                is_admin: data.is_admin,
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
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/users')}
                    sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Geri
                </Button>
                <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#1f2937' }}>
                    {isEdit ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi'}
                </Typography>
            </Box>

            <Paper elevation={1} sx={{ p: 4, bgcolor: '#f9fafb', maxWidth: 800 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                        {isEdit ? 'İstifadəçi Məlumatları' : 'Yeni İstifadəçi'}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

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
                                        sx={{ bgcolor: 'white' }}
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
                                            sx={{ bgcolor: 'white' }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="full_name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Tam ad"
                                        fullWidth
                                        size="small"
                                        sx={{ bgcolor: 'white' }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="org_unit_id"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small">
                                        <InputLabel>İdarə</InputLabel>
                                        <Select {...field} label="İdarə" sx={{ bgcolor: 'white' }}>
                                            <MenuItem value="">
                                                <em>Seçilməyib</em>
                                            </MenuItem>
                                            {orgUnits?.map((unit) => (
                                                <MenuItem key={unit.id} value={unit.id}>
                                                    {unit.name}
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
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Admin hüquqları"
                                        sx={{ color: '#374151' }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={createMutation.isPending || updateMutation.isPending}
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
                                    onClick={() => navigate('/admin/users')}
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
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <ToastComponent />
        </Layout>
    );
}
