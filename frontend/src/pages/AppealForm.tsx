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
  Select,
  MenuItem,
  Alert,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GavelIcon from '@mui/icons-material/Gavel';

import { getAppeal, createAppeal, updateAppeal } from '../api/appeals';
import {
  getDepartments,
  getRegions,
  getApStatuses,
  getApIndexes,
  getContentTypes,
  getChiefInstructions,
  getInSections,
  getWhoControls,
  getDepOfficialsByDep,
  getAccountIndexes,
  createDepartment,
  createRegion,
  createChiefInstruction,
  createInSection,
  createWhoControl,
} from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { CustomLookupDialog } from '../components/CustomLookupDialog';
import { getErrorMessage } from '../utils/errors';
import { formatDateToDDMMYYYY, convertDateForAPI, formatDateToISO } from '../utils/dateUtils';

interface AppealFormData {
  num: number | undefined; // Hansı hərbi hissədən daxil olub
  reg_num: string; // Qeydealınma nömrəsi
  reg_date: string | undefined; // Qeydealınma tarixi
  exp_date: string | undefined; // İcra müddəti
  sec_in_ap_num: string; // Digər hərbi hissə üzrə nömrə
  sec_in_ap_date: string | undefined; // Digər qurum üzrə tarix
  in_ap_num: string; // Daxil olan müraciətin nömrəsi
  in_ap_date: string | undefined; // Daxil olan müraciətin tarixi
  dep_id: number | undefined; // Hansı qurumdan gəlib
  official_id: number | undefined; // Müraciət kimdən gəlib / İcraçılar
  person: string; // Müraciət edənin SAA
  region_id: number | undefined; // Ünvan (Region olaraq işlənir)
  who_control_id: number | undefined; // Kim baxımdır (Nəzarətçi)
  instructions_id: number | undefined; // Rəhbərin dərkənarı
  email: string; // Elektron poçt ünvanı
  paper_count: string; // Vərəq sayı
  content: string; // Müraciətin qısa məzmunu
  content_type_id: number | undefined; // Müraciətin növü
  account_index_id: number | undefined; // Hesabat indeksi
  ap_index_id: number | undefined; // Müraciətin indeksi
  status: number | undefined; // Müraciətin baxılması
  repetition: boolean; // Təkrar müraciət
  control: boolean; // Nəzarətdədir
  InSection: number | undefined;
  user_section_id: number | undefined;
  IsExecuted: boolean;
  PC: string | undefined;
  PC_Tarixi: string | undefined; // datetime
}

const defaultValues: Partial<AppealFormData> = {
  num: undefined,
  reg_num: '',
  reg_date: '',
  exp_date: '',
  sec_in_ap_num: '',
  sec_in_ap_date: '',
  in_ap_num: '',
  in_ap_date: '',
  person: '',
  email: '',
  content: '',
  paper_count: '',
  repetition: false,
  control: false,
  IsExecuted: false,
  dep_id: undefined,
  official_id: undefined,
  region_id: undefined,
  who_control_id: undefined,
  instructions_id: undefined,
  content_type_id: undefined,
  account_index_id: undefined,
  ap_index_id: undefined,
  status: undefined,
  InSection: undefined,
  PC: '',
  PC_Tarixi: '',
};

const labelSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#475569',
  mb: 0.5
};

const inputSx = {
  '& .MuiInputBase-root': {
    backgroundColor: '#fff',
    fontSize: '0.9rem',
    borderRadius: '4px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#cbd5e1',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#94a3b8',
  },
};

export default function AppealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const [error, setError] = useState<string>('');

  // Dialog states for adding custom lookups
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [openRegionDialog, setOpenRegionDialog] = useState(false);
  const [openInstructionDialog, setOpenInstructionDialog] = useState(false);
  const [openInSectionDialog, setOpenInSectionDialog] = useState(false);
  const [openWhoControlDialog, setOpenWhoControlDialog] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
  } = useForm<AppealFormData>({
    defaultValues,
  });

  const selectedDepId = watch('dep_id');
  const selectedInSection = watch('InSection');

  // Lookups
  const { data: inSections } = useQuery({ queryKey: ['inSections'], queryFn: getInSections });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });
  const { data: regions } = useQuery({ queryKey: ['regions'], queryFn: getRegions });
  const { data: statuses } = useQuery({ queryKey: ['apStatuses'], queryFn: getApStatuses });
  const { data: apIndexes } = useQuery({ queryKey: ['apIndexes'], queryFn: getApIndexes });
  const { data: contentTypes } = useQuery({ queryKey: ['contentTypes'], queryFn: getContentTypes });
  const { data: instructions } = useQuery({ queryKey: ['chiefInstructions'], queryFn: getChiefInstructions });
  const { data: whoControls } = useQuery({ queryKey: ['whoControls'], queryFn: getWhoControls });
  const { data: accountIndexes } = useQuery({ queryKey: ['accountIndexes'], queryFn: getAccountIndexes });
  const { data: depOfficials, isLoading: officialsLoading } = useQuery({
    queryKey: ['dep-officials', selectedDepId],
    queryFn: () => getDepOfficialsByDep(selectedDepId as number),
    enabled: !!selectedDepId,
  });

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });

  const { data: appeal, isLoading: appealLoading } = useQuery({
    queryKey: ['appeal', id],
    queryFn: () => getAppeal(Number(id)),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (user?.section_id && !isEditMode) {
      setValue('user_section_id', user.section_id);
    }
  }, [user, setValue, isEditMode]);

  useEffect(() => {
    if (appeal) {
      reset({
        num: appeal.num,
        reg_num: appeal.reg_num || '',
        reg_date: appeal.reg_date ? formatDateToDDMMYYYY(appeal.reg_date) : undefined,
        exp_date: appeal.exp_date ? formatDateToDDMMYYYY(appeal.exp_date) : undefined,
        sec_in_ap_num: appeal.sec_in_ap_num || '',
        sec_in_ap_date: appeal.sec_in_ap_date ? formatDateToDDMMYYYY(appeal.sec_in_ap_date) : undefined,
        in_ap_num: appeal.in_ap_num || '',
        in_ap_date: appeal.in_ap_date ? formatDateToDDMMYYYY(appeal.in_ap_date) : undefined,
        dep_id: appeal.dep_id,
        official_id: appeal.official_id,
        region_id: appeal.region_id,
        person: appeal.person || '',
        email: appeal.email || '',
        content: appeal.content || '',
        content_type_id: appeal.content_type_id,
        account_index_id: appeal.account_index_id,
        ap_index_id: appeal.ap_index_id,
        paper_count: appeal.paper_count || '',
        who_control_id: appeal.who_control_id,
        instructions_id: appeal.instructions_id,
        status: appeal.status || undefined,
        repetition: appeal.repetition || false,
        control: appeal.control || false,
        PC: appeal.PC || '',
        PC_Tarixi: appeal.PC_Tarixi ? formatDateToDDMMYYYY(appeal.PC_Tarixi) : '',
      });
    }
  }, [appeal, reset]);

  const createMutation = useMutation({
    mutationFn: createAppeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      navigate('/appeals');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (data: AppealFormData) => updateAppeal(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      navigate('/appeals');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  // Mutations for creating custom lookups
  const addDepartmentMutation = useMutation({
    mutationFn: (name: string) => createDepartment({ department: name }),
    onSuccess: (newDept) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setValue('dep_id', newDept.id);
      setOpenDeptDialog(false);
    },
  });

  const addRegionMutation = useMutation({
    mutationFn: (name: string) => createRegion({ region: name }),
    onSuccess: (newRegion) => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      setValue('region_id', newRegion.id);
      setOpenRegionDialog(false);
    },
  });

  const addInstructionMutation = useMutation({
    mutationFn: (name: string) => createChiefInstruction({ instructions: name }),
    onSuccess: (newInstr) => {
      queryClient.invalidateQueries({ queryKey: ['chiefInstructions'] });
      setValue('instructions_id', newInstr.id);
      setOpenInstructionDialog(false);
    },
  });

  const addInSectionMutation = useMutation({
    mutationFn: (name: string) => createInSection({ section: name }),
    onSuccess: (newSection) => {
      queryClient.invalidateQueries({ queryKey: ['inSections'] });
      setValue('InSection', newSection.id);
      setOpenInSectionDialog(false);
    },
  });

  const addWhoControlMutation = useMutation({
    mutationFn: (name: string) => createWhoControl({ chief: name }),
    onSuccess: (newControl) => {
      queryClient.invalidateQueries({ queryKey: ['whoControls'] });
      setValue('who_control_id', newControl.id);
      setOpenWhoControlDialog(false);
    },
  });

  const onSubmit = (data: AppealFormData) => {
    // Sanitize data: convert empty strings to null for optional fields
    const sanitizedData = { ...data };

    // Numeric fields: if value is "" or 0 (if 0 is 'not selected'), set to null
    // But be careful: some IDs might legitimately be 0? Usually not for DB primary keys.
    const numericFields: (keyof AppealFormData)[] = [
      'dep_id', 'official_id', 'region_id', 'who_control_id', 'instructions_id',
      'content_type_id', 'account_index_id', 'ap_index_id', 'status', 'InSection',
      'user_section_id', 'num'
    ];

    numericFields.forEach(field => {
      if (sanitizedData[field] === '' || sanitizedData[field] === 0) {
        (sanitizedData as any)[field] = undefined;
      }
    });

    const dateFields: (keyof AppealFormData)[] = [
      'reg_date', 'exp_date', 'sec_in_ap_date', 'in_ap_date', 'PC_Tarixi'
    ];
    dateFields.forEach(field => {
      if (sanitizedData[field] === '') {
        (sanitizedData as any)[field] = undefined;
      } else if (sanitizedData[field]) {
        // Convert dd/mm/yyyy to YYYY-MM-DD for API
        (sanitizedData as any)[field] = convertDateForAPI(sanitizedData[field] as string) || undefined;
      }
    });

    if (isEditMode) updateMutation.mutate(sanitizedData);
    else createMutation.mutate(sanitizedData);
  };

  const handleClear = () => reset(defaultValues);

  if (appealLoading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <Box sx={{ mb: 4 }} className="animate-fade-in">
        <Typography variant="h4" component="h1" fontWeight="900" color="primary" sx={{ mb: 1 }}>
          {isEditMode ? 'Müraciətin Redaktəsi' : 'Yeni Müraciət Qeydiyyatı'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
          Vətəndaş müraciətlərinin sistemə daxil edilməsi və rəsmiləşdirilməsi
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Paper
        className="animate-slide-up glass-card"
        sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Section 1: Basic Info */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ color: '#3e4a21', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormatListNumberedIcon fontSize="small" /> QEYDİYYAT MƏLUMATLARI
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.1, bgcolor: '#3e4a21' }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={labelSx}>Qeydealınma nömrəsi:</Typography>
                  <Controller name="reg_num" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Məs: 12/A" />} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={labelSx}>Qeydealınma tarixi:</Typography>
                  <Controller name="reg_date" control={control} render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      sx={inputSx}
                      placeholder="dd/mm/yyyy"
                      inputProps={{ maxLength: 10 }}
                    />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={labelSx}>İcra müddəti:</Typography>
                  <Controller name="exp_date" control={control} render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      sx={inputSx}
                      placeholder="dd/mm/yyyy"
                      inputProps={{ maxLength: 10 }}
                    />
                  )} />
                </Grid>
              </Grid>
            </Grid>

            {/* Section 2: External Registration */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ color: '#3e4a21', fontWeight: 800, mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon fontSize="small" /> XARİCİ QEYDİYYAT MƏLUMATLARI
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.1, bgcolor: '#3e4a21' }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Digər HH üzrə nömrə:</Typography>
                  <Controller name="sec_in_ap_num" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth size="small" sx={inputSx} disabled={!selectedInSection} placeholder={!selectedInSection ? "Öncə HH seçin" : "Nömrə"} />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Digər HH üzrə tarix:</Typography>
                  <Controller name="sec_in_ap_date" control={control} render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      sx={inputSx}
                      disabled={!selectedInSection}
                      placeholder="dd/mm/yyyy"
                      inputProps={{ maxLength: 10 }}
                    />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Daxil olan mür. nömrəsi:</Typography>
                  <Controller name="in_ap_num" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Nömrə" />} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Daxil olan mür. tarixi:</Typography>
                  <Controller name="in_ap_date" control={control} render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      sx={inputSx}
                      placeholder="dd/mm/yyyy"
                      inputProps={{ maxLength: 10 }}
                    />
                  )} />
                </Grid>
              </Grid>
            </Grid>

            {/* Section 3: Origin Info */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ color: '#3e4a21', fontWeight: 800, mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon fontSize="small" /> MƏNBƏ VƏ ÜNVAN
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.1, bgcolor: '#3e4a21' }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={labelSx}>Hansı qurumdan gəlib:</Typography>
                      <Controller name="dep_id" control={control} render={({ field }) => (
                        <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty onChange={(e) => { field.onChange(e); setValue('official_id', 0); }}>
                          <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                          {departments?.map(d => <MenuItem key={d.id} value={d.id} sx={{ fontSize: '0.85rem' }}>{d.department}</MenuItem>)}
                        </Select>
                      )} />
                    </Box>
                    <IconButton size="small" sx={{ p: '6px', color: '#3e4a21' }} onClick={() => setOpenDeptDialog(true)}><AddCircleOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={labelSx}>Müraciət kimdən gəlib:</Typography>
                      <Controller name="official_id" control={control} render={({ field }) => (
                        <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty disabled={!selectedDepId || officialsLoading}>
                          <MenuItem value=""><em>{selectedDepId ? 'Seçin...' : 'Öncə qurum seçin'}</em></MenuItem>
                          {depOfficials?.map((o: any) => <MenuItem key={o.id} value={o.id} sx={{ fontSize: '0.85rem' }}>{o.official}</MenuItem>)}
                        </Select>
                      )} />
                    </Box>
                    <IconButton size="small" sx={{ p: '6px', color: '#3e4a21' }}><AddCircleOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={labelSx}>Hansı HH-dən daxil olub:</Typography>
                      <Controller name="InSection" control={control} render={({ field }) => (
                        <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                          <MenuItem value={0}><em>Seçilməyib</em></MenuItem>
                          {inSections?.map((s: any) => <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.85rem' }}>{s.section}</MenuItem>)}
                        </Select>
                      )} />
                    </Box>
                    <IconButton size="small" sx={{ p: '6px', color: '#3e4a21' }} onClick={() => setOpenInSectionDialog(true)}><AddCircleOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={labelSx}>Müraciət edənin SAA:</Typography>
                  <Controller name="person" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Ad, Soyad, Ata adı" />} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={labelSx}>Vətəndaşın Ünvanı (Region):</Typography>
                      <Controller name="region_id" control={control} render={({ field }) => (
                        <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                          <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                          {regions?.map((r: any) => <MenuItem key={r.id} value={r.id} sx={{ fontSize: '0.85rem' }}>{r.region}</MenuItem>)}
                        </Select>
                      )} />
                    </Box>
                    <IconButton size="small" sx={{ p: '6px', color: '#3e4a21' }} onClick={() => setOpenRegionDialog(true)}><AddCircleOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={labelSx}>Elektron poçt:</Typography>
                  <Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="example@mail.com" />} />
                </Grid>
              </Grid>
            </Grid>

            {/* Section 4: Content and Classification */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ color: '#3e4a21', fontWeight: 800, mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GavelIcon fontSize="small" /> MƏZMUN VƏ TƏSNİFAT
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.1, bgcolor: '#3e4a21' }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography sx={labelSx}>Müraciətin qısa məzmunu:</Typography>
                  <Controller name="content" control={control} render={({ field }) => <TextField {...field} fullWidth multiline rows={3} size="small" sx={{ ...inputSx, '& .MuiInputBase-root': { borderRadius: 3 } }} placeholder="Müraciətin əsas mahiyyəti..." />} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Müraciətin növü:</Typography>
                  <Controller name="content_type_id" control={control} render={({ field }) => (
                    <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                      <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                      {contentTypes?.map((c: any) => <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.85rem' }}>{c.content_type}</MenuItem>)}
                    </Select>
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Müraciətin indeksi:</Typography>
                  <Controller name="ap_index_id" control={control} render={({ field }) => (
                    <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                      <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                      {apIndexes?.map((i: any) => <MenuItem key={i.id} value={i.id} sx={{ fontSize: '0.85rem' }}>{i.ap_index}</MenuItem>)}
                    </Select>
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Hesabat indeksi:</Typography>
                  <Controller name="account_index_id" control={control} render={({ field }) => (
                    <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                      <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                      {accountIndexes?.map((i: any) => <MenuItem key={i.id} value={i.id} sx={{ fontSize: '0.85rem' }}>{i.account_index}</MenuItem>)}
                    </Select>
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>Vərəq sayı:</Typography>
                  <Controller name="paper_count" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} />} />
                </Grid>
              </Grid>
            </Grid>

            {/* Section 5: Execution & Control */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ color: '#3e4a21', fontWeight: 800, mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormatListNumberedIcon fontSize="small" /> İCRA VƏ NƏZARƏT
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.1, bgcolor: '#3e4a21' }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={labelSx}>Rəhbərin dərkənarı:</Typography>
                      <Controller name="instructions_id" control={control} render={({ field }) => (
                        <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                          <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                          {instructions?.map((i: any) => <MenuItem key={i.id} value={i.id} sx={{ fontSize: '0.85rem' }}>{i.instructions}</MenuItem>)}
                        </Select>
                      )} />
                    </Box>
                    <IconButton size="small" sx={{ p: '6px', color: '#3e4a21' }} onClick={() => setOpenInstructionDialog(true)}><AddCircleOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={labelSx}>Kim baxımdır:</Typography>
                      <Controller name="who_control_id" control={control} render={({ field }) => (
                        <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                          <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                          {whoControls?.map((w: any) => <MenuItem key={w.id} value={w.id} sx={{ fontSize: '0.85rem' }}>{w.chief}</MenuItem>)}
                        </Select>
                      )} />
                    </Box>
                    <IconButton size="small" sx={{ p: '6px', color: '#3e4a21' }} onClick={() => setOpenWhoControlDialog(true)}><AddCircleOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography sx={labelSx}>Status:</Typography>
                  <Controller name="status" control={control} render={({ field }) => (
                    <Select {...field} fullWidth size="small" sx={inputSx} displayEmpty>
                      <MenuItem value=""><em>Seçilməyib</em></MenuItem>
                      {statuses?.map((s: any) => <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.85rem' }}>{s.status}</MenuItem>)}
                    </Select>
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>PC:</Typography>
                  <Controller name="PC" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="PC nömrəsi" />} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography sx={labelSx}>PC Tarixi:</Typography>
                  <Controller name="PC_Tarixi" control={control} render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      sx={inputSx}
                      placeholder="dd/mm/yyyy"
                      inputProps={{ maxLength: 10 }}
                    />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(62, 74, 33, 0.05)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62, 74, 33, 0.1)' }}>
                    <Typography sx={{ fontWeight: 700, color: '#3e4a21', fontSize: '0.85rem' }}>Təkrar müraciət:</Typography>
                    <Controller name="repetition" control={control} render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#3e4a21' }}
                      />
                    )} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(62, 74, 33, 0.05)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62, 74, 33, 0.1)' }}>
                    <Typography sx={{ fontWeight: 700, color: '#3e4a21', fontSize: '0.85rem' }}>Nəzarətdədir:</Typography>
                    <Controller name="control" control={control} render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#3e4a21' }}
                      />
                    )} />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Action Bar */}
          <Divider sx={{ my: 5, opacity: 0.2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DeleteSweepIcon />}
              onClick={handleClear}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              FORMU TƏMİZLƏ
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/appeals')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                İMTİNA ET
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createMutation.isPending || updateMutation.isPending}
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  bgcolor: '#3e4a21',
                  boxShadow: '0 4px 12px rgba(62, 74, 33, 0.3)',
                  '&:hover': { bgcolor: '#2c3518', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s'
                }}
              >
                {isEditMode ? 'DƏYİŞİKLİKLƏRİ YADDA SAXLA' : 'MÜRACİƏTİ QEYDƏ AL'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* Custom Lookup Dialogs */}
      <CustomLookupDialog
        open={openDeptDialog}
        title="Yeni İdarə Əlavə Et"
        fieldLabel="İdarə Adı"
        onAdd={(value) => addDepartmentMutation.mutateAsync(value)}
        onClose={() => setOpenDeptDialog(false)}
      />
      <CustomLookupDialog
        open={openRegionDialog}
        title="Yeni Region Əlavə Et"
        fieldLabel="Region Adı"
        onAdd={(value) => addRegionMutation.mutateAsync(value)}
        onClose={() => setOpenRegionDialog(false)}
      />
      <CustomLookupDialog
        open={openInSectionDialog}
        title="Yeni Hərbi Hissə Əlavə Et"
        fieldLabel="Hərbi Hissə Adı"
        onAdd={(value) => addInSectionMutation.mutateAsync(value)}
        onClose={() => setOpenInSectionDialog(false)}
      />
      <CustomLookupDialog
        open={openInstructionDialog}
        title="Yeni Rəhbər Göstərişi Əlavə Et"
        fieldLabel="Göstəriş Metni"
        onAdd={(value) => addInstructionMutation.mutateAsync(value)}
        onClose={() => setOpenInstructionDialog(false)}
      />
      <CustomLookupDialog
        open={openWhoControlDialog}
        title="Yeni Nəzarətçi Əlavə Et"
        fieldLabel="Nəzarətçi Adı"
        onAdd={(value) => addWhoControlMutation.mutateAsync(value)}
        onClose={() => setOpenWhoControlDialog(false)}
      />
    </Layout>
  );
}
