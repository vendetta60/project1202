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
    Grid,
    Divider,
    FormControlLabel,
    Switch,
} from '@mui/material';
import Select from 'react-select';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { getUser, createUser } from '../../api/users';
import { getUserSections } from '../../api/lookups';
import { selectStylesLight, toSelectOptions } from '../../utils/formStyles';
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

    const { data: user, isLoading: userLoading, isError: userError, error: userErrorObj } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(Number(id)),
        enabled: isEdit,
    });

    const { data: userSections, isError: sectionsError } = useQuery({
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

    if (userError) {
        return (
            <Layout>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                        Xəta baş verdi
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {userErrorObj instanceof Error ? userErrorObj.message : 'İstifadəçini yükləməkdə xəta baş verdi. Lütfən admin sələhiyyətlərə sahib olduğunuzdan əmin olun.'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/admin/users')}
                        sx={{ bgcolor: '#4a5d23' }}
                    >
                        Geri qayıt
                    </Button>
                </Box>
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
                    bgcolor: 'rgba(255,255,255,0.95)',
                    maxWidth: 700,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#2c3e50' }}>
                        {isEdit ? 'İstifadəçi Məlumatları' : 'Yeni İstifadəçi Yaradın'}
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {/* Row 1: Username & Password */}
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="username"
                                control={control}
                                rules={{ required: 'İstifadəçi adı tələb olunur' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="İstifadəçi Adı"
                                        fullWidth
                                        size="small"
                                        disabled={isEdit}
                                        error={Boolean(errors.username)}
                                        helperText={errors.username?.message}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'white',
                                                '&:hover fieldset': { borderColor: '#4a5d23' },
                                                '&.Mui-focused fieldset': { borderColor: '#4a5d23' }
                                            },
                                            '& .MuiFormLabel-root': { fontWeight: 600, color: '#555' },
                                            '& .MuiFormLabel-root.Mui-focused': { color: '#4a5d23' }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {!isEdit && (
                            <Grid item xs={12} sm={6}>
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
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: 'white',
                                                    '&:hover fieldset': { borderColor: '#4a5d23' },
                                                    '&.Mui-focused fieldset': { borderColor: '#4a5d23' }
                                                },
                                                '& .MuiFormLabel-root': { fontWeight: 600, color: '#555' },
                                                '& .MuiFormLabel-root.Mui-focused': { color: '#4a5d23' }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        {isEdit && (
                            <Grid item xs={12} sm={6} />
                        )}

                        {/* Row 2: Surname & Name */}
                        <Grid item xs={12} sm={6}>
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
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'white',
                                                '&:hover fieldset': { borderColor: '#4a5d23' },
                                                '&.Mui-focused fieldset': { borderColor: '#4a5d23' }
                                            },
                                            '& .MuiFormLabel-root': { fontWeight: 600, color: '#555' },
                                            '& .MuiFormLabel-root.Mui-focused': { color: '#4a5d23' }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
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
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'white',
                                                '&:hover fieldset': { borderColor: '#4a5d23' },
                                                '&.Mui-focused fieldset': { borderColor: '#4a5d23' }
                                            },
                                            '& .MuiFormLabel-root': { fontWeight: 600, color: '#555' },
                                            '& .MuiFormLabel-root.Mui-focused': { color: '#4a5d23' }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Row 3: Section */}
                        <Grid item xs={12}>
                            <Controller
                                name="section_id"
                                control={control}
                                render={({ field }) => (
                                    <Box>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#555', mb: 0.8 }}>Hissə</Typography>
                                        <Select
                                            {...field}
                                            value={toSelectOptions(userSections || [], 'section').find(o => o.value === field.value) || undefined}
                                            onChange={(e: any) => field.onChange(e?.value || '')}
                                            options={toSelectOptions(userSections || [], 'section')}
                                            styles={{
                                                control: (base: any) => ({
                                                    ...base,
                                                    borderColor: 'rgba(0,0,0,0.15)',
                                                    backgroundColor: 'white',
                                                    minHeight: '36px',
                                                    fontSize: '0.875rem',
                                                    borderRadius: '4px',
                                                    '&:hover': { borderColor: '#4a5d23' },
                                                    '&:focus': { borderColor: '#4a5d23' }
                                                }),
                                                option: (base: any, state: any) => ({
                                                    ...base,
                                                    backgroundColor: state.isSelected ? '#4a5d23' : state.isFocused ? 'rgba(74,93,35,0.1)' : 'white',
                                                    color: state.isSelected ? 'white' : '#333',
                                                    cursor: 'pointer'
                                                })
                                            }}
                                            isClearable
                                            placeholder="Seçin..."
                                        />
                                    </Box>
                                )}
                            />
                        </Grid>

                        {/* Row 4: Admin Checkbox */}
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
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ fontWeight: 600, color: '#555' }}>
                                                Admin hüquqları?
                                            </Typography>
                                        }
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                    {/* Divider */}
                    <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => navigate('/admin/users')}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                color: '#4a5d23',
                                borderColor: '#4a5d23',
                                '&:hover': {
                                    borderColor: '#3a4a1b',
                                    bgcolor: 'rgba(74,93,35,0.05)'
                                }
                            }}
                        >
                            Ləğv Et
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={createMutation.isPending}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                bgcolor: '#4a5d23',
                                '&:hover': { bgcolor: '#3a4a1b' },
                                minWidth: 150
                            }}
                        >
                            {createMutation.isPending ? 'Saxlanılır...' : 'Yadda Saxla'}
                        </Button>
                    </Box>
                </form>
            </Paper>
            <ToastComponent />
        </Layout>
    );
}
