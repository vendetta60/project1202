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
    useTheme,
    alpha,
} from '@mui/material';
import Select from 'react-select';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { getUser, createUser } from '../../api/users';
import { getUserSections } from '../../api/lookups';
import { roleApi, permissionGroupApi } from '../../api/permissions';
import { getSelectStyles, toSelectOptions } from '../../utils/formStyles';
import { usePermissions } from '../../hooks/usePermissions';
import {
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import type { UserCreate } from '../../api/users';

interface FormData {
    username: string;
    password?: string;
    surname?: string;
    name?: string;
    section_id?: number | '';
    role_ids: number[];
    group_ids: number[];
    is_admin: boolean;
    is_super_admin: boolean;
}

export default function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const { showToast, ToastComponent } = useToast();
    const { rank: currentRank } = usePermissions();
    const isEdit = Boolean(id);
    const primary = theme.palette.primary.main;

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
            role_ids: [],
            group_ids: [],
            is_admin: false,
            is_super_admin: false,
        },
    });

    const { data: user, isLoading: userLoading, isError: userError, error: userErrorObj } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(Number(id)),
        enabled: isEdit,
    });

    const { data: userSections } = useQuery({
        queryKey: ['userSections'],
        queryFn: getUserSections,
    });

    const { data: rolesList } = useQuery({
        queryKey: ['rolesList'],
        queryFn: () => roleApi.listAll().then((r) => r.data),
    });

    const { data: groupsList } = useQuery({
        queryKey: ['permissionGroupsList'],
        queryFn: () => permissionGroupApi.listAll(false).then((r) => r.data),
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
                role_ids: (user as any).role_ids ?? [],
                group_ids: (user as any).group_ids ?? [],
                is_admin: user.is_admin || false,
                is_super_admin: user.is_super_admin || false,
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
                role_ids: data.role_ids?.length ? data.role_ids : undefined,
                group_ids: data.group_ids?.length ? data.group_ids : undefined,
                is_admin: data.is_admin,
                is_super_admin: data.is_super_admin,
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
                        sx={{ bgcolor: primary }}
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
                        color: primary,
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
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                        {isEdit ? 'İstifadəçi Məlumatları' : 'Yeni İstifadəçi Yaradın'}
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.06)' }} />

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {/* Row 1: Username & Password */}
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                                                '&:hover fieldset': { borderColor: primary },
                                                '&.Mui-focused fieldset': { borderColor: primary }
                                            },
                                            '& .MuiFormLabel-root': { fontWeight: 600, color: 'text.secondary' },
                                            '& .MuiFormLabel-root.Mui-focused': { color: primary }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {!isEdit && (
                            <Grid size={{ xs: 12, sm: 6 }}>
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
                                                    '&:hover fieldset': { borderColor: primary },
                                                    '&.Mui-focused fieldset': { borderColor: primary }
                                                },
                                                '& .MuiFormLabel-root': { fontWeight: 600, color: 'text.secondary' },
                                                '& .MuiFormLabel-root.Mui-focused': { color: primary }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        {isEdit && (
                            <Grid size={{ xs: 12, sm: 6 }} />
                        )}

                        {/* Row 2: Surname & Name */}
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                                                '&:hover fieldset': { borderColor: primary },
                                                '&.Mui-focused fieldset': { borderColor: primary }
                                            },
                                            '& .MuiFormLabel-root': { fontWeight: 600, color: 'text.secondary' },
                                            '& .MuiFormLabel-root.Mui-focused': { color: primary }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
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
                                                '&:hover fieldset': { borderColor: primary },
                                                '&.Mui-focused fieldset': { borderColor: primary }
                                            },
                                            '& .MuiFormLabel-root': { fontWeight: 600, color: 'text.secondary' },
                                            '& .MuiFormLabel-root.Mui-focused': { color: primary }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Row 3: Section */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="section_id"
                                control={control}
                                render={({ field }) => (
                                    <Box>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary', mb: 0.8 }}>İdarə</Typography>
                                        <Select
                                            {...field}
                                            value={toSelectOptions(userSections || [], 'user_section').find(o => o.value === field.value) || undefined}
                                            onChange={(e: any) => field.onChange(e?.value || '')}
                                            options={toSelectOptions(userSections || [], 'user_section')}
                                            menuPortalTarget={document.body}
                                            styles={{
                                                control: (base: any) => ({
                                                    ...base,
                                                    borderColor: 'rgba(0,0,0,0.15)',
                                                    backgroundColor: 'white',
                                                    minHeight: '36px',
                                                    fontSize: '0.875rem',
                                                    borderRadius: '4px',
                                                    '&:hover': { borderColor: primary },
                                                    '&:focus': { borderColor: primary }
                                                }),
                                                option: (base: any, state: any) => ({
                                                    ...base,
                                                    backgroundColor: state.isSelected ? primary : state.isFocused ? alpha(primary, 0.12) : 'var(--app-paper, white)',
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

                        {/* Row 4: Rollar */}
                        <Grid size={{ xs: 12 }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary', mb: 0.8 }}>Rollar</Typography>
                            <Controller
                                name="role_ids"
                                control={control}
                                render={({ field }) => {
                                    const blockedCategories = ['admin', 'users', 'audit'];
                                    const filteredRoles = (rolesList || []).filter((r: any) => {
                                        if (currentRank >= 3) return true;
                                        // Admin (rank 2) can see roles that DON'T have blocked categories
                                        return r.permissions.every((p: any) => !p.category || !blockedCategories.includes(p.category));
                                    });

                                    return (
                                        <Select
                                            isMulti
                                            value={filteredRoles
                                                .filter((r: any) => (field.value || []).includes(r.id))
                                                .map((r: any) => ({ value: r.id, label: r.name }))}
                                            onChange={(opts: any) => field.onChange((opts || []).map((o: any) => o.value))}
                                            options={filteredRoles.map((r: any) => ({ value: r.id, label: r.name }))}
                                            placeholder="Rol seçin..."
                                            menuPortalTarget={document.body}
                                            styles={getSelectStyles(primary)}
                                        />
                                    );
                                }}
                            />
                        </Grid>

                        {/* Row 5: Roll qrupları */}
                        <Grid size={{ xs: 12 }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary', mb: 0.8 }}>Roll qrupları</Typography>
                            <Controller
                                name="group_ids"
                                control={control}
                                render={({ field }) => {
                                    const blockedCategories = ['admin', 'users', 'audit'];
                                    const filteredGroups = (groupsList || []).filter((g: any) => {
                                        if (currentRank >= 3) return true;
                                        // Admin (rank 2) can see groups that DON'T have blocked categories
                                        return g.permissions.every((p: any) => !p.category || !blockedCategories.includes(p.category));
                                    });

                                    return (
                                        <Select
                                            isMulti
                                            value={filteredGroups
                                                .filter((g: any) => (field.value || []).includes(g.id))
                                                .map((g: any) => ({ value: g.id, label: g.name }))}
                                            onChange={(opts: any) => field.onChange((opts || []).map((o: any) => o.value))}
                                            options={filteredGroups.map((g: any) => ({ value: g.id, label: g.name }))}
                                            placeholder="Qrup seçin..."
                                            menuPortalTarget={document.body}
                                            styles={getSelectStyles(primary)}
                                        />
                                    );
                                }}
                            />
                        </Grid>
                        {/* Row 6: Hierarchy Level */}
                        {currentRank >= 3 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>Səlahiyyət Səviyyəsi</Typography>
                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Controller
                                        name="is_admin"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                                label={<Typography sx={{ fontWeight: 600 }}>Administrator</Typography>}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="is_super_admin"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="secondary" />}
                                                label={<Typography sx={{ fontWeight: 600 }}>Super Admin</Typography>}
                                            />
                                        )}
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Super Admin bütün istifadəçiləri, Admin isə yalnız User-ləri idarə edə bilər.
                                </Typography>
                            </Grid>
                        )}
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
                                color: primary,
                                borderColor: primary,
                                '&:hover': {
                                    borderColor: primary,
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
                                bgcolor: primary,
                                '&:hover': { bgcolor: theme.palette.primary.dark },
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
