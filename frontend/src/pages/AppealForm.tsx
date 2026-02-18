import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayersIcon from '@mui/icons-material/Layers';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupIcon from '@mui/icons-material/Group';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import NumbersIcon from '@mui/icons-material/Numbers';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import HistoryIcon from '@mui/icons-material/History';

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
  getDirections,
  getDirectionsBySection,
  getExecutorListByDirection,
  getAppealExecutors,
  addAppealExecutor,
  updateAppealExecutor,
  removeAppealExecutor,
  type ExecutorAssignment,
} from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { CustomLookupDialog } from '../components/CustomLookupDialog';
import { ExecutorDialog } from '../components/ExecutorDialog';
import { ExecutorDetailsDialog } from '../components/ExecutorDetailsDialog';
import { getErrorMessage } from '../utils/errors';
import { formatDateToDDMMYYYY, formatDateToISO } from '../utils/dateUtils';

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
  phone: string; // Telefon nömrəsi
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
  gap: 0.4,
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#334155',
  mb: 0.1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '& svg': {
    fontSize: '0.85rem',
    color: '#3e4a21',
  }
};

const inputSx = {
  '& .MuiInputBase-root': {
    backgroundColor: '#fff',
    fontSize: '0.82rem',
    borderRadius: '4px',
    height: '30px',
  },
  '& .MuiOutlinedInput-input': {
    padding: '4px 6px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#cbd5e1',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#94a3b8',
  },
};

const selectStylesLight = {
  control: (base: any, state: any) => ({
    ...base,
    fontSize: '0.82rem',
    minHeight: '30px',
    height: '30px',
    backgroundColor: '#fff',
    borderColor: state.isFocused ? '#3e4a21' : '#cbd5e1',
    borderRadius: '4px',
    boxShadow: state.isFocused ? '0 0 0 1px #3e4a21' : 'none',
    '&:hover': {
      borderColor: '#94a3b8',
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: '0.82rem',
    backgroundColor: state.isSelected ? '#3e4a21' : state.isFocused ? '#f0f0f0' : '#fff',
    color: state.isSelected ? '#fff' : '#333',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3e4a21' : '#e8e8e8',
    },
  }),
  input: (base: any) => ({
    ...base,
    padding: '2px 4px',
    fontSize: '0.82rem',
  }),
  singleValue: (base: any) => ({
    ...base,
    fontSize: '0.82rem',
  }),
  menuList: (base: any) => ({
    ...base,
    fontSize: '0.82rem',
  }),
};

export default function AppealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const [error, setError] = useState<string>('');

  // Helper to convert array data to react-select format
  const toSelectOptions = (data: any[] | undefined, labelKey: string, valueKey: string = 'id') => {
    if (!data) return [];
    return data.map(item => ({
      value: item[valueKey],
      label: item[labelKey]
    }));
  };

  // Dialog states for adding custom lookups
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [openRegionDialog, setOpenRegionDialog] = useState(false);
  const [openInstructionDialog, setOpenInstructionDialog] = useState(false);
  const [openInSectionDialog, setOpenInSectionDialog] = useState(false);
  const [openWhoControlDialog, setOpenWhoControlDialog] = useState(false);
  const [openExecutorDialog, setOpenExecutorDialog] = useState(false);
  const [selectedDirectionForExecutor, setSelectedDirectionForExecutor] = useState<number | undefined>(undefined);
  const [selectedExecutors, setSelectedExecutors] = useState<any[]>([]); // Store appeal's executors
  const [executorDetailsDialogOpen, setExecutorDetailsDialogOpen] = useState(false);
  const [selectedExecutorForEdit, setSelectedExecutorForEdit] = useState<ExecutorAssignment | null>(null);

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

  // Appeal data and existing executors

  const { data: appealExecutors } = useQuery({
    queryKey: ['appeal-executors', id],
    queryFn: () => id ? getAppealExecutors(Number(id)) : Promise.resolve([]),
    enabled: isEditMode && !!id,
  });

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
    if (appealExecutors) {
      setSelectedExecutors(appealExecutors);
    }
  }, [appealExecutors]);

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
    mutationFn: async (data: AppealFormData) => {
      const appeal = await createAppeal(data);
      // Save selected executors after appeal is created
      if (selectedExecutors && selectedExecutors.length > 0) {
        for (const ex of selectedExecutors) {
          try {
            await addAppealExecutor(appeal.id, {
              executor_id: ex.executor_id,
              direction_id: ex.direction_id,
              is_primary: ex.is_primary || false,
              out_num: ex.out_num,
              out_date: ex.out_date,
              attach_num: ex.attach_num,
              attach_paper_num: ex.attach_paper_num,
              r_num: ex.r_num,
              r_date: ex.r_date,
              posted_sec: ex.posted_sec,
            });
          } catch (err) {
            console.error('Error adding executor:', err);
          }
        }
      }
      return appeal;
    },
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


  const addExecutorToAppealMutation = useMutation({
    mutationFn: (data: Partial<ExecutorAssignment>) => {
      if (!id) throw new Error("Appeal ID not found");
      return addAppealExecutor(Number(id), data);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['appeal-executors', id] });
      }
    },
  });

  const removeExecutorFromAppealMutation = useMutation({
    mutationFn: (executorId: number) => {
      if (!id) throw new Error("Appeal ID not found");
      return removeAppealExecutor(Number(id), executorId);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['appeal-executors', id] });
      }
    },
  });

  const updateExecutorDetailsMutation = useMutation({
    mutationFn: ({ executorId, data }: { executorId: number; data: Partial<ExecutorAssignment> }) => {
      if (!id) throw new Error("Appeal ID not found");
      return updateAppealExecutor(Number(id), executorId, data);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['appeal-executors', id] });
        setExecutorDetailsDialogOpen(false);
        setSelectedExecutorForEdit(null);
      }
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
        (sanitizedData as any)[field] = formatDateToISO(sanitizedData[field] as string) || undefined;
      }
    });

    if (isEditMode) updateMutation.mutate(sanitizedData);
    else createMutation.mutate(sanitizedData);
  };

  const handleClear = () => {
    reset(defaultValues);
    setSelectedExecutors([]);
    setSelectedDirectionForExecutor(undefined);
  };

  if (appealLoading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <Box sx={{ mb: 1.5 }} className="animate-fade-in">
        <Typography variant="h5" component="h1" fontWeight="900" color="primary" sx={{ mb: 0.5 }}>
          {isEditMode ? 'Müraciətin Redaktəsi' : 'Yeni Müraciət Qeydiyyatı'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1, py: 0.8 }}>{error}</Alert>}

      <Paper
        className="animate-slide-up glass-card"
        sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', width: '100%' }}
      >
        {/* Flatpickr Global Styles */}
        <style>{`
          .flatpickr-input {
            width: 100% !important;
            height: 30px !important;
            padding: 4px 6px !important;
            font-size: 0.82rem !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 4px !important;
            box-sizing: border-box !important;
            background-color: #fff !important;
            font-family: inherit !important;
          }
          .flatpickr-input:focus {
            border-color: #3e4a21 !important;
            box-shadow: 0 0 0 1px #3e4a21 !important;
            outline: none !important;
          }
          .flatpickr-calendar {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            border-radius: 4px !important;
            border: 1px solid #cbd5e1 !important;
          }
          .flatpickr-day.selected,
          .flatpickr-day.startRange,
          .flatpickr-day.endRange {
            background: #3e4a21 !important;
          }
          .flatpickr-day:hover {
            background: #f0f0f0 !important;
          }
          .flatpickr-current-month {
            color: #3e4a21 !important;
            font-weight: 700 !important;
          }
        `}</style>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={1.5}>
            {/* Top Form Section: 4 Columns */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2}>
                {/* Column 1 */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography sx={labelSx}><NumbersIcon /> Qeydealınma nömrəsi:</Typography>
                      <Controller name="reg_num" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="3-25-4/1-A-1-1/2026" />} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><CalendarMonthIcon /> Qeydealınma tarixi:</Typography>
                      <Controller name="reg_date" control={control} render={({ field }) => (
                        <Flatpickr
                          {...field}
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(dates) => field.onChange(dates[0] ? dates[0].toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '/') : '')}
                          options={{ mode: 'single', dateFormat: 'd/m/Y', allowInput: true }}
                          className="flatpickr-input"
                          placeholder="dd/mm/yyyy"
                        />
                      )} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><EventBusyIcon /> İcra müddəti:</Typography>
                      <Controller name="exp_date" control={control} render={({ field }) => (
                        <Flatpickr
                          {...field}
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(dates) => field.onChange(dates[0] ? dates[0].toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '/') : '')}
                          options={{ mode: 'single', dateFormat: 'd/m/Y' }}
                          className="flatpickr-input"
                          placeholder="dd/mm/yyyy"
                        />
                      )} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={labelSx}><MilitaryTechIcon /> Hansı hərbi hissədən daxil olub:</Typography>
                          <Controller name="InSection" control={control} render={({ field }) => (
                            <Select
                              {...field}
                              options={toSelectOptions(inSections, 'section')}
                              value={field.value ? toSelectOptions(inSections, 'section').find(o => o.value === field.value) : null}
                              onChange={(e) => field.onChange(e?.value)}
                              isClearable
                              isSearchable
                              placeholder="MN Katibliyi"
                              styles={selectStylesLight}
                            />
                          )} />
                        </Box>
                        <IconButton size="small" sx={{ p: '4px', color: '#3e4a21', minWidth: 28 }} onClick={() => setOpenInSectionDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={labelSx}><AssignmentIcon /> Rəhbərin dərkənarı:</Typography>
                          <Controller name="instructions_id" control={control} render={({ field }) => (
                            <Select
                              {...field}
                              options={toSelectOptions(instructions, 'instructions')}
                              value={field.value ? toSelectOptions(instructions, 'instructions').find(o => o.value === field.value) : null}
                              onChange={(e) => field.onChange(e?.value)}
                              isClearable
                              isSearchable
                              placeholder="Seçin..."
                              styles={selectStylesLight}
                            />
                          )} />
                        </Box>
                        <IconButton size="small" sx={{ p: '4px', color: '#3e4a21', minWidth: 28 }} onClick={() => setOpenInstructionDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, p: 0.5, bgcolor: 'rgba(62, 74, 33, 0.03)', borderRadius: 1 }}>
                      <Typography sx={labelSx}><HistoryIcon /> Təkrar müraciət:</Typography>
                      <Controller name="repetition" control={control} render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#3e4a21' }}
                        />
                      )} />
                    </Box>
                  </Box>
                </Grid>

                {/* Column 2 */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography sx={labelSx}><DescriptionIcon /> Digər hərbi hissə üzrə nömrəsi:</Typography>
                      <Controller name="sec_in_ap_num" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Nömrə" />} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><CalendarMonthIcon /> Digər qurum üzrə tarix:</Typography>
                      <Controller name="sec_in_ap_date" control={control} render={({ field }) => (
                        <Flatpickr
                          {...field}
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(dates) => field.onChange(dates[0] ? dates[0].toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '/') : '')}
                          options={{ mode: 'single', dateFormat: 'd/m/Y' }}
                          className="flatpickr-input"
                          placeholder="dd/mm/yyyy"
                        />
                      )} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><DescriptionIcon /> Daxil olan müraciətin nömrəsi:</Typography>
                      <Controller name="in_ap_num" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Nömrə" />} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><CalendarMonthIcon /> Daxil olan müraciətin tarixi:</Typography>
                      <Controller name="in_ap_date" control={control} render={({ field }) => (
                        <Flatpickr
                          {...field}
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(dates) => field.onChange(dates[0] ? dates[0].toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '/') : '')}
                          options={{ mode: 'single', dateFormat: 'd/m/Y' }}
                          className="flatpickr-input"
                          placeholder="dd/mm/yyyy"
                        />
                      )} />
                    </Box>
                  </Box>
                </Grid>

                {/* Column 3 */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={labelSx}><GroupIcon /> Hansı qurumdan gəlib:</Typography>
                          <Controller name="dep_id" control={control} render={({ field }) => (
                            <Select
                              {...field}
                              options={toSelectOptions(departments, 'department')}
                              value={field.value ? toSelectOptions(departments, 'department').find(o => o.value === field.value) : null}
                              onChange={(e) => { field.onChange(e?.value); setValue('official_id', undefined); }}
                              isClearable
                              isSearchable
                              placeholder="Seçin..."
                              styles={selectStylesLight}
                            />
                          )} />
                        </Box>
                        <IconButton size="small" sx={{ p: '4px', color: '#3e4a21', minWidth: 28 }} onClick={() => setOpenDeptDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={labelSx}><PersonIcon /> Müraciət kimdən gəlib:</Typography>
                          <Controller name="official_id" control={control} render={({ field }) => (
                            <Select
                              {...field}
                              options={toSelectOptions(depOfficials, 'official')}
                              value={field.value ? toSelectOptions(depOfficials, 'official').find(o => o.value === field.value) : null}
                              onChange={(e) => field.onChange(e?.value)}
                              isClearable
                              isSearchable
                              placeholder={selectedDepId ? 'Seçin...' : 'Öncə qurum seçin'}
                              isDisabled={!selectedDepId || officialsLoading}
                              styles={selectStylesLight}
                            />
                          )} />
                        </Box>
                        <IconButton size="small" sx={{ p: '4px', color: '#3e4a21', minWidth: 28 }}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><PersonIcon /> Müraciət edənin SAA:</Typography>
                      <Controller name="person" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Aaaaa" />} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={labelSx}><PlaceIcon /> Ünvan:</Typography>
                          <Controller name="region_id" control={control} render={({ field }) => (
                            <Select
                              {...field}
                              options={toSelectOptions(regions, 'region')}
                              value={field.value ? toSelectOptions(regions, 'region').find(o => o.value === field.value) : null}
                              onChange={(e) => field.onChange(e?.value)}
                              isClearable
                              isSearchable
                              placeholder="Seçin..."
                              styles={selectStylesLight}
                            />
                          )} />
                        </Box>
                        <IconButton size="small" sx={{ p: '4px', color: '#3e4a21', minWidth: 28 }} onClick={() => setOpenRegionDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={labelSx}><SupervisorAccountIcon /> Kim baxmışdır:</Typography>
                          <Controller name="who_control_id" control={control} render={({ field }) => (
                            <Select
                              {...field}
                              options={toSelectOptions(whoControls, 'chief')}
                              value={field.value ? toSelectOptions(whoControls, 'chief').find(o => o.value === field.value) : null}
                              onChange={(e) => field.onChange(e?.value)}
                              isClearable
                              isSearchable
                              placeholder="Seçin..."
                              styles={selectStylesLight}
                            />
                          )} />
                        </Box>
                        <IconButton size="small" sx={{ p: '4px', color: '#3e4a21', minWidth: 28 }} onClick={() => setOpenWhoControlDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, p: 0.5, bgcolor: 'rgba(62, 74, 33, 0.03)', borderRadius: 1 }}>
                      <Typography sx={labelSx}><VisibilityIcon /> Nəzarətdədir:</Typography>
                      <Controller name="control" control={control} render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#3e4a21' }}
                        />
                      )} />
                    </Box>
                  </Box>
                </Grid>

                {/* Column 4 */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={labelSx}><CheckCircleIcon /> Müraciətin baxılması:</Typography>
                          <Controller name="status" control={control} render={({ field }) => (
                            <Select
                              {...field}
                              options={toSelectOptions(statuses, 'status')}
                              value={field.value ? toSelectOptions(statuses, 'status').find(o => o.value === field.value) : null}
                              onChange={(e) => field.onChange(e?.value)}
                              isClearable
                              isSearchable
                              placeholder="Seçin..."
                              styles={selectStylesLight}
                            />
                          )} />
                        </Box>
                        <IconButton size="small" sx={{ p: '4px', color: '#3e4a21', minWidth: 28 }}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><LayersIcon /> Vərəq sayı:</Typography>
                      <Controller name="paper_count" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} />} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><MailOutlineIcon /> Elektron poçt ünvanı:</Typography>
                      <Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="rauf@mail.ru" />} />
                    </Box>
                    <Box>
                      <Typography sx={labelSx}><PhoneIcon /> Telefon nömrəsi:</Typography>
                      <Controller name="phone" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="( ) - -" />} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Bottom Form Section: Classification & Content */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
                <Box>
                  <Typography sx={labelSx}><NotesIcon /> Müraciətin qısa məzmunu:</Typography>
                  <Controller name="content" control={control} render={({ field }) => <TextField {...field} fullWidth multiline rows={2} size="small" sx={{ ...inputSx, '& .MuiInputBase-root': { borderRadius: 1.5, height: 'auto' } }} placeholder="Müraciətin əsas mahiyyəti..." />} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>Müraciətin növü:</Typography>
                  <Controller name="content_type_id" control={control} render={({ field }) => (
                    <Select
                      {...field}
                      options={toSelectOptions(contentTypes, 'content_type')}
                      value={field.value ? toSelectOptions(contentTypes, 'content_type').find(o => o.value === field.value) : null}
                      onChange={(e) => field.onChange(e?.value)}
                      isClearable
                      isSearchable
                      placeholder="Seçin..."
                      styles={selectStylesLight}
                    />
                  )} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>Hesabat İndeksi:</Typography>
                  <Controller name="account_index_id" control={control} render={({ field }) => (
                    <Select
                      {...field}
                      options={toSelectOptions(accountIndexes, 'account_index')}
                      value={field.value ? toSelectOptions(accountIndexes, 'account_index').find(o => o.value === field.value) : null}
                      onChange={(e) => field.onChange(e?.value)}
                      isClearable
                      isSearchable
                      placeholder="Seçin..."
                      styles={selectStylesLight}
                    />
                  )} />
                </Box>
                <Box>
                  <Typography sx={labelSx}>Müraciətin indeksi:</Typography>
                  <Controller name="ap_index_id" control={control} render={({ field }) => (
                    <Select
                      {...field}
                      options={toSelectOptions(apIndexes, 'ap_index')}
                      value={field.value ? toSelectOptions(apIndexes, 'ap_index').find(o => o.value === field.value) : null}
                      onChange={(e) => field.onChange(e?.value)}
                      isClearable
                      isSearchable
                      placeholder="1. Sovlet qullugu ve kadr meseleleri"
                      styles={selectStylesLight}
                    />
                  )} />
                </Box>
              </Box>
            </Grid>

            {/* Executor Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#3e4a21', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.82rem' }}>
                  İcraçıların təfsilatları
                </Typography>

                {/* Executor Actions Above Table */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => setOpenExecutorDialog(true)}
                    sx={{
                      color: '#3e4a21',
                      borderColor: 'rgba(62, 74, 33, 0.3)',
                      bgcolor: 'rgba(62, 74, 33, 0.05)',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      '&:hover': { bgcolor: 'rgba(62, 74, 33, 0.1)', borderColor: '#3e4a21' }
                    }}
                  >
                    Əlavə et
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    disabled={!selectedExecutorForEdit}
                    onClick={() => setExecutorDetailsDialogOpen(true)}
                    sx={{
                      color: '#3e4a21',
                      borderColor: 'rgba(62, 74, 33, 0.3)',
                      bgcolor: 'rgba(62, 74, 33, 0.05)',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      '&:hover': { bgcolor: 'rgba(62, 74, 33, 0.1)', borderColor: '#3e4a21' }
                    }}
                  >
                    Redaktə et
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteSweepIcon />}
                    disabled={!selectedExecutorForEdit}
                    onClick={() => {
                      if (selectedExecutorForEdit?.id) {
                        if (window.confirm('Bu icraçını silmək istədiyinizə əminsiniz?')) {
                          removeExecutorFromAppealMutation.mutate(selectedExecutorForEdit.id);
                        }
                      }
                    }}
                    sx={{
                      color: '#d32f2f',
                      borderColor: 'rgba(211, 47, 47, 0.3)',
                      bgcolor: 'rgba(211, 47, 47, 0.05)',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)', borderColor: '#d32f2f' }
                    }}
                  >
                    Sil
                  </Button>
                </Box>

                <Box sx={{ border: '1px solid rgba(62, 74, 33, 0.2)', borderRadius: 1, overflow: 'hidden' }}>
                  <Table size="small" sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: 'rgba(62, 74, 33, 0.08)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>İcraçının struktur bölməsi</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Soyadı, adı</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Hansı sənədlə icra edilib</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Sənədin tarixi</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Tikdiyi işin nömrəsi</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>İşdəki vərəq nömrəsi</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Göndərilmə nömrəsi</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Göndərilmə tarixi</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Hara (kimə) göndərilib</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.8, fontSize: '0.7rem', borderBottom: '1px solid rgba(62, 74, 33, 0.2)' }}>Əsas icraçı</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedExecutors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 2, color: '#64748b', fontSize: '0.7rem' }}>Hələ icraçı təyin edilməyib</TableCell>
                        </TableRow>
                      ) : (
                        selectedExecutors.map((executor) => (
                          <TableRow
                            key={executor.id || executor.executor_id}
                            onClick={() => setSelectedExecutorForEdit(executor)}
                            sx={{
                              '&:hover': { bgcolor: 'rgba(62, 74, 33, 0.04)' },
                              bgcolor: (selectedExecutorForEdit?.id && selectedExecutorForEdit?.id === executor.id) || (selectedExecutorForEdit?.executor_id === executor.executor_id) ? 'rgba(62, 74, 33, 0.12)' : 'inherit',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(62, 74, 33, 0.1)'
                            }}
                          >
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>{executor.direction_name || '-'}</TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>{executor.executor_name || executor.executor || '-'}</TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>{executor.r_num || '-'}</TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>
                              {executor.r_date ? formatDateToDDMMYYYY(executor.r_date) : '-'}
                            </TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>{executor.attach_num || '-'}</TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>{executor.attach_paper_num || '-'}</TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>{executor.out_num || '-'}</TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>
                              {executor.out_date ? formatDateToDDMMYYYY(executor.out_date) : '-'}
                            </TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem' }}>{executor.posted_sec || '-'}</TableCell>
                            <TableCell sx={{ p: 0.5, fontSize: '0.7rem', textAlign: 'center' }}>
                              {executor.is_primary ? '✓' : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Form Footer Actions */}
          <Divider sx={{ mt: 3, mb: 2, opacity: 0.2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<CleaningServicesIcon />}
              onClick={handleClear}
              sx={{
                px: 3,
                borderRadius: 1.5,
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#3e4a21',
                borderColor: '#3e4a21',
                '&:hover': { bgcolor: 'rgba(62, 74, 33, 0.05)', borderColor: '#2c3518' }
              }}
            >
              TƏMİZLƏ
            </Button>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createMutation.isPending || updateMutation.isPending}
                type="submit"
                sx={{
                  px: 4,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  bgcolor: '#3e4a21',
                  '&:hover': { bgcolor: '#2c3518' }
                }}
              >
                {isEditMode ? 'REDAKTƏ ET' : 'YADDA SAXLA'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExitToAppIcon />}
                onClick={() => navigate('/appeals')}
                sx={{
                  px: 3,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#555',
                  borderColor: '#999',
                  '&:hover': { bgcolor: '#f0f0f0', borderColor: '#777' }
                }}
              >
                ÇIXIŞ
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
        onAdd={(value) => addDepartmentMutation.mutateAsync(value).then(() => { })}
        onClose={() => setOpenDeptDialog(false)}
      />
      <CustomLookupDialog
        open={openRegionDialog}
        title="Yeni Region Əlavə Et"
        fieldLabel="Region Adı"
        onAdd={(value) => addRegionMutation.mutateAsync(value).then(() => { })}
        onClose={() => setOpenRegionDialog(false)}
      />
      <CustomLookupDialog
        open={openInSectionDialog}
        title="Yeni Hərbi Hissə Əlavə Et"
        fieldLabel="Hərbi Hissə Adı"
        onAdd={(value) => addInSectionMutation.mutateAsync(value).then(() => { })}
        onClose={() => setOpenInSectionDialog(false)}
      />
      <CustomLookupDialog
        open={openInstructionDialog}
        title="Yeni Rəhbər Göstərişi Əlavə Et"
        fieldLabel="Göstəriş Metni"
        onAdd={(value) => addInstructionMutation.mutateAsync(value).then(() => { })}
        onClose={() => setOpenInstructionDialog(false)}
      />
      <CustomLookupDialog
        open={openWhoControlDialog}
        title="Yeni Nəzarətçi Əlavə Et"
        fieldLabel="Nəzarətçi Adı"
        onAdd={(value) => addWhoControlMutation.mutateAsync(value).then(() => { })}
        onClose={() => setOpenWhoControlDialog(false)}
      />
      <ExecutorDialog
        open={openExecutorDialog}
        onAdd={async (directionId, selectedExecs, directionName) => {
          if (isEditMode) {
            try {
              // Prepare full payloads
              const payloads = selectedExecs.map(ex => ({
                executor_id: ex.id,
                direction_id: directionId,
                is_primary: ex.isPrimary,
                out_num: ex.out_num,
                out_date: ex.out_date,
                attach_num: ex.attach_num,
                attach_paper_num: ex.attach_paper_num,
                r_num: ex.r_num,
                r_date: ex.r_date,
                posted_sec: ex.posted_sec,
                active: true
              }));

              await Promise.all(
                payloads.map(payload => addExecutorToAppealMutation.mutateAsync(payload))
              );
              setOpenExecutorDialog(false);
            } catch (error) {
              console.error("Failed to add executors", error);
            }
          } else {
            // Local mode
            const newEntries = selectedExecs.map(ex => ({
              executor_id: ex.id,
              direction_id: directionId,
              direction_name: directionName,
              executor_name: ex.name,
              is_primary: ex.isPrimary,
              out_num: ex.out_num,
              out_date: ex.out_date, // These are now ISO from ExecutorDialog
              attach_num: ex.attach_num,
              attach_paper_num: ex.attach_paper_num,
              r_num: ex.r_num,
              r_date: ex.r_date, // These are now ISO from ExecutorDialog
              posted_sec: ex.posted_sec,
              active: true
            }));

            // Mark others as non-primary if any of the new ones is primary
            let updatedList = [...selectedExecutors];
            const hasNewPrimary = selectedExecs.some(ex => ex.isPrimary);
            if (hasNewPrimary) {
              updatedList = updatedList.map(e => ({ ...e, is_primary: false }));
            }
            setSelectedExecutors([...updatedList, ...newEntries]);
            setOpenExecutorDialog(false);
          }
        }}
        onClose={() => setOpenExecutorDialog(false)}
        directionFilter={selectedDirectionForExecutor}
        defaultValues={{
          r_num: watch('reg_num'),
          r_date: watch('reg_date')
        }}
      />
      {selectedExecutorForEdit && (
        <ExecutorDetailsDialog
          open={executorDetailsDialogOpen}
          executor={selectedExecutorForEdit}
          onSave={async (data) => {
            if (selectedExecutorForEdit.id) {
              await updateExecutorDetailsMutation.mutateAsync({
                executorId: selectedExecutorForEdit.id,
                data: data,
              });
              // Update local state to reflect is_primary change
              setSelectedExecutors(
                selectedExecutors.map((e: any) => {
                  if (e.id === selectedExecutorForEdit.id) {
                    return { ...e, ...data };
                  }
                  // Clear is_primary from other executors if this one is primary
                  if (data.is_primary && e.id !== selectedExecutorForEdit.id) {
                    return { ...e, is_primary: false };
                  }
                  return e;
                })
              );
            }
          }}
          onClose={() => {
            setExecutorDetailsDialogOpen(false);
            setSelectedExecutorForEdit(null);
          }}
          loading={updateExecutorDetailsMutation.isPending}
        />
      )}    </Layout>
  );
}