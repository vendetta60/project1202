import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Divider,
  IconButton,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import { getAppeal, createAppeal, updateAppeal } from '../api/appeals';
import { getOrgUnits } from '../api/orgUnits';
import { getExecutors, createExecutor } from '../api/executors';
import { getMilitaryUnits, createMilitaryUnit } from '../api/militaryUnits';
import { getAppealTypes } from '../api/appealTypes';
import { getReportIndexes, getAppealIndexes } from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getErrorMessage } from '../utils/errors';

interface AppealFormData {
  subject: string;
  description: string;
  citizen_first_name: string;
  citizen_last_name: string;
  citizen_father_name?: string;
  org_unit_id: number;
  executor_org_unit_id?: number | null;
  executor_id?: number | null;
  status?: string;
  received_at?: string;
  execution_date?: string;
  summary: string;
  appeal_type: string;
  report_index: string;
  appeal_index: string;
  page_count: number;
  chairman_decision_number: string;
  chairman_decision_date: string;
  incoming_appeal_number: string;
  incoming_appeal_date: string;
  related_appeal_number: string;
  related_appeal_date: string;
  appeal_submitter_role: string;
  citizen_email: string;
  is_transferred: boolean;
  registration_number: string;
  registration_date: string;
  execution_deadline?: string;
  originating_military_unit?: string;
  leader_decision?: string;
  other_military_unit_number?: string;
  other_institution_date?: string;
  originating_institution?: string;
  appeal_submitter?: string;
  submitter_full_name?: string;
  submitter_saa?: string;
  address?: string;
  appeal_review_status?: string;
  email?: string;
  phone_number?: string;
  is_repeat_appeal?: boolean;
  reviewed_by?: string;
  is_under_supervision?: boolean;
  short_content?: string;
}

const defaultValues: Partial<AppealFormData> = {
  subject: '',
  description: '',
  summary: '',
  appeal_type: '',
  citizen_first_name: '',
  citizen_last_name: '',
  citizen_father_name: '',
  citizen_email: '',
  org_unit_id: 0,
  status: 'pending',
  executor_org_unit_id: null,
  executor_id: null,
  received_at: new Date().toISOString().slice(0, 10),
  execution_date: '',
  report_index: '',
  appeal_index: '',
  page_count: 0,
  chairman_decision_number: '',
  chairman_decision_date: '',
  incoming_appeal_number: '',
  incoming_appeal_date: '',
  related_appeal_number: '',
  related_appeal_date: '',
  appeal_submitter_role: '',
  is_transferred: false,
  registration_number: '',
  registration_date: new Date().toISOString().slice(0, 10),
  execution_deadline: '',
  originating_military_unit: '',
  leader_decision: '',
  other_military_unit_number: '',
  other_institution_date: '',
  originating_institution: '',
  appeal_submitter: '',
  submitter_full_name: '',
  submitter_saa: '',
  address: '',
  appeal_review_status: '',
  email: '',
  phone_number: '',
  is_repeat_appeal: false,
  reviewed_by: '',
  is_under_supervision: false,
  short_content: '',
};

export default function AppealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const [error, setError] = useState<string>('');
  const [newExecutorName, setNewExecutorName] = useState('');

  // Load data from backend
  const { data: militaryUnits } = useQuery({ queryKey: ['militaryUnits'], queryFn: getMilitaryUnits });
  const { data: appealTypes } = useQuery({ queryKey: ['appealTypes'], queryFn: getAppealTypes });
  const { data: reportIndexes } = useQuery({ queryKey: ['reportIndexes'], queryFn: getReportIndexes });
  const { data: appealIndexes } = useQuery({ queryKey: ['appealIndexes'], queryFn: getAppealIndexes });

  const addMilitaryUnitMutation = useMutation({
    mutationFn: (name: string) => createMilitaryUnit({ name }),
    onSuccess: (unit) => {
      queryClient.invalidateQueries({ queryKey: ['militaryUnits'] });
      setValue('originating_military_unit', unit.name);
    },
    onError: (err: any) => setError(getErrorMessage(err)),
  });

  const handleAddMilitaryUnit = async () => {
    const name = window.prompt('Yeni hərbi hissə adı:');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    addMilitaryUnitMutation.mutate(trimmed);
  };

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: appeal, isLoading: appealLoading } = useQuery({
    queryKey: ['appeal', id],
    queryFn: () => getAppeal(Number(id)),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
  } = useForm<AppealFormData>({
    defaultValues: {
      ...defaultValues,
      org_unit_id: user?.org_unit_id || 0,
      received_at: new Date().toISOString().slice(0, 10),
      registration_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (appeal) {
      setValue('subject', appeal.subject ?? '');
      setValue('description', appeal.description ?? '');
      setValue('org_unit_id', appeal.org_unit_id);
      setValue('status', appeal.status);
      setValue('executor_org_unit_id', appeal.executor_org_unit_id ?? null);
      setValue('executor_id', appeal.executor_id ?? null);
      if (appeal.received_at) {
        setValue('received_at', appeal.received_at.slice(0, 10));
      }
      if (appeal.execution_date) {
        setValue('execution_date', appeal.execution_date.slice(0, 10));
      }
      setValue('summary', appeal.summary ?? '');
      setValue('appeal_type', appeal.appeal_type ?? '');
      setValue('report_index', appeal.report_index ?? '');
      setValue('appeal_index', appeal.appeal_index ?? '');
      setValue('page_count', appeal.page_count ?? 0);
      setValue('chairman_decision_number', appeal.chairman_decision_number ?? '');
      setValue('chairman_decision_date', appeal.chairman_decision_date ? appeal.chairman_decision_date.slice(0, 10) : '');
      setValue('incoming_appeal_number', appeal.incoming_appeal_number ?? '');
      setValue('incoming_appeal_date', appeal.incoming_appeal_date ? appeal.incoming_appeal_date.slice(0, 10) : '');
      setValue('related_appeal_number', appeal.related_appeal_number ?? '');
      setValue('related_appeal_date', appeal.related_appeal_date ? appeal.related_appeal_date.slice(0, 10) : '');
      setValue('appeal_submitter_role', appeal.appeal_submitter_role ?? '');
      setValue('citizen_email', appeal.citizen_email ?? '');
      setValue('is_transferred', appeal.is_transferred ?? false);
      setValue('registration_number', appeal.registration_number ?? '');
      setValue('registration_date', appeal.registration_date ? appeal.registration_date.slice(0, 10) : '');
      setValue('execution_deadline', appeal.execution_deadline ? appeal.execution_deadline.slice(0, 10) : '');
      setValue('originating_military_unit', appeal.originating_military_unit ?? '');
      setValue('leader_decision', appeal.leader_decision ?? '');
      setValue('other_military_unit_number', appeal.other_military_unit_number ?? '');
      setValue('other_institution_date', appeal.other_institution_date ? appeal.other_institution_date.slice(0, 10) : '');
      setValue('originating_institution', appeal.originating_institution ?? '');
      setValue('appeal_submitter', appeal.appeal_submitter ?? '');
      setValue('submitter_full_name', appeal.submitter_full_name ?? '');
      setValue('submitter_saa', appeal.submitter_saa ?? '');
      setValue('address', appeal.address ?? '');
      setValue('appeal_review_status', appeal.appeal_review_status ?? '');
      setValue('email', appeal.email ?? '');
      setValue('phone_number', appeal.phone_number ?? '');
      setValue('is_repeat_appeal', appeal.is_repeat_appeal ?? false);
      setValue('reviewed_by', appeal.reviewed_by ?? '');
      setValue('is_under_supervision', appeal.is_under_supervision ?? false);
      setValue('short_content', appeal.short_content ?? '');
    }
  }, [appeal, setValue]);

  useEffect(() => {
    if (user?.org_unit_id && !isEditMode) {
      setValue('org_unit_id', user.org_unit_id);
    }
  }, [user, setValue, isEditMode]);

  const createMutation = useMutation({
    mutationFn: createAppeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      navigate('/appeals');
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AppealFormData) => updateAppeal(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      queryClient.invalidateQueries({ queryKey: ['appeal', id] });
      navigate('/appeals');
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const selectedExecutorOrgUnitId = watch('executor_org_unit_id');

  const { data: executors } = useQuery({
    queryKey: ['executors', selectedExecutorOrgUnitId],
    queryFn: () =>
      getExecutors({ org_unit_id: selectedExecutorOrgUnitId as number }),
    enabled: !!selectedExecutorOrgUnitId,
  });

  const createExecutorMutation = useMutation({
    mutationFn: createExecutor,
    onSuccess: (executor) => {
      queryClient.invalidateQueries({
        queryKey: ['executors', selectedExecutorOrgUnitId],
      });
      setValue('executor_id', executor.id);
      setNewExecutorName('');
    },
    onError: (err: any) => {
      setError(getErrorMessage(err));
    },
  });

  const handleCreateExecutor = () => {
    setError('');
    if (!selectedExecutorOrgUnitId) {
      setError('Əvvəlcə icra şöbəsini seçin');
      return;
    }
    if (!newExecutorName.trim()) {
      setError('İcraçı adı boş ola bilməz');
      return;
    }
    createExecutorMutation.mutate({
      full_name: newExecutorName.trim(),
      org_unit_id: selectedExecutorOrgUnitId as number,
    });
  };

  const onSubmit = (data: AppealFormData) => {
    setError('');
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (appealLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const cardSx = {
    mb: 4,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    borderRadius: 2,
    border: '1px solid #e5e7eb',
  };

  const sectionHeaderSx = {
    bgcolor: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    '& .MuiCardHeader-title': {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#334155',
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.025em' }}>
          {isEditMode ? 'Müraciəti Redaktə Et' : 'Yeni Müraciət'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Qeydiyyat Məlumatları */}
        <Card sx={cardSx}>
          <CardHeader title="Qeydiyyat Məlumatları" sx={sectionHeaderSx} />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Qeydiyyat №" size="small" {...register('registration_number')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField type="date" fullWidth label="Qeydiyyat tarixi" size="small" {...register('registration_date')} InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField type="date" fullWidth label="İcra müddəti" size="small" {...register('execution_deadline')} InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Müraciət Detalları */}
        <Card sx={cardSx}>
          <CardHeader title="Müraciət Detalları" sx={sectionHeaderSx} />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Controller
                    name="originating_military_unit"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        fullWidth
                        size="small"
                        options={militaryUnits?.map(u => u.name) || []}
                        onChange={(_, value) => field.onChange(value || '')}
                        renderInput={(params) => <TextField {...params} label="Hərbi hissə" sx={{ bgcolor: 'white' }} />}
                      />
                    )}
                  />
                  <IconButton size="small" onClick={handleAddMilitaryUnit} color="primary" title="Yeni hərbi hissə">
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Rəhbərin qərarı" size="small" {...register('leader_decision')} sx={{ bgcolor: 'white' }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Digər hərbi hissə üzrə №" size="small" {...register('other_military_unit_number')} sx={{ bgcolor: 'white' }} disabled={!watch('originating_military_unit')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" fullWidth label="Digər qurum üzrə tarix" size="small" {...register('other_institution_date')} InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} disabled={!watch('originating_military_unit')} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Daxil olan müraciətin №" size="small" {...register('incoming_appeal_number')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" fullWidth label="Daxil olan müraciətin tarixi" size="small" {...register('incoming_appeal_date')} InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Hansı qurumdan" size="small" {...register('originating_institution')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="appeal_type"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      size="small"
                      options={appealTypes?.map(t => t.name) || []}
                      onChange={(_, value) => field.onChange(value || '')}
                      renderInput={(params) => <TextField {...params} label="Müraciətin növü" sx={{ bgcolor: 'white' }} />}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="report_index"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      size="small"
                      options={reportIndexes?.map(r => r.name) || []}
                      onChange={(_, value) => field.onChange(value || '')}
                      renderInput={(params) => <TextField {...params} label="Hesabat indeksi" sx={{ bgcolor: 'white' }} />}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="appeal_index"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      size="small"
                      options={appealIndexes?.map(a => a.name) || []}
                      onChange={(_, value) => field.onChange(value || '')}
                      renderInput={(params) => <TextField {...params} label="Müraciətin indeksi" sx={{ bgcolor: 'white' }} />}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Müraciətçi Məlumatları */}
        <Card sx={cardSx}>
          <CardHeader title="Müraciətçi Kontakt" sx={sectionHeaderSx} />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Müraciət kimdən" size="small" {...register('appeal_submitter')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="SAA" size="small" {...register('submitter_saa')} sx={{ bgcolor: 'white' }} />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField fullWidth label="Ünvan" size="small" {...register('address')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="E-poçt" size="small" {...register('email')} sx={{ bgcolor: 'white' }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Telefon" size="small" {...register('phone_number')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Təkrar müraciət</InputLabel>
                  <Select
                    value={watch('is_repeat_appeal') ? 'yes' : 'no'}
                    label="Təkrar müraciət"
                    onChange={(e) => setValue('is_repeat_appeal', e.target.value === 'yes')}
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="no">Xeyr</MenuItem>
                    <MenuItem value="yes">Bəli</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Baxış Və İcra */}
        <Card sx={cardSx}>
          <CardHeader title="Baxış Və İcra" sx={sectionHeaderSx} />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Kim baxmışdır" size="small" {...register('reviewed_by')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Müraciətin baxılması" size="small" {...register('appeal_review_status')} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField type="number" fullWidth label="Varaq sayı" size="small" {...register('page_count', { valueAsNumber: true })} sx={{ bgcolor: 'white' }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Nəzarətdədir</InputLabel>
                  <Select
                    value={watch('is_under_supervision') ? 'yes' : 'no'}
                    label="Nəzarətdədir"
                    onChange={(e) => setValue('is_under_supervision', e.target.value === 'yes')}
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="no">Xeyr</MenuItem>
                    <MenuItem value="yes">Bəli</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Qısa məzmun" multiline rows={3} size="small" {...register('short_content')} sx={{ bgcolor: 'white' }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* İcraçı Seçimi (Şərtdən asılıdır) */}
        {selectedExecutorOrgUnitId && (
          <Card sx={cardSx}>
            <CardHeader title="İcraçı Seçimi" sx={sectionHeaderSx} />
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>İcraçı</InputLabel>
                    <Select
                      {...register('executor_id', { valueAsNumber: true })}
                      value={watch('executor_id') ?? ''}
                      label="İcraçı"
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Seçilməyib</MenuItem>
                      {executors?.map((exec) => (
                        <MenuItem key={exec.id} value={exec.id}>
                          {exec.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Yeni icraçı əlavə et"
                      value={newExecutorName}
                      onChange={(e) => setNewExecutorName(e.target.value)}
                      size="small"
                      sx={{ bgcolor: 'white' }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleCreateExecutor}
                      disabled={createExecutorMutation.isPending}
                      sx={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
                    >
                      Əlavə et
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Status (Yalnız Redaktə Rejimində) */}
        {isEditMode && (
          <Card sx={cardSx}>
            <CardHeader title="Status" sx={sectionHeaderSx} />
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...register('status')}
                      value={watch('status') || 'pending'}
                      label="Status"
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="pending">Gözləyir</MenuItem>
                      <MenuItem value="in_progress">İcradadır</MenuItem>
                      <MenuItem value="completed">İcra olundu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Düymələr */}
        <Box sx={{ mt: 6, display: 'flex', gap: 2, pb: 4 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{
              bgcolor: '#2563eb',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              boxShadow: '0 10px 15px -3px rgb(37 99 235 / 0.3)',
              '&:hover': {
                bgcolor: '#1d4ed8',
                boxShadow: '0 20px 25px -5px rgb(37 99 235 / 0.4)',
              },
            }}
          >
            Yadda saxla
          </Button>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/appeals')}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              color: '#64748b',
              borderColor: '#cbd5e1',
              '&:hover': {
                bgcolor: '#f1f5f9',
                borderColor: '#94a3b8',
              },
            }}
          >
            Ləğv et
          </Button>
        </Box>
      </form>
    </Layout>
  );
}
