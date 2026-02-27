import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Azerbaijan } from 'flatpickr/dist/l10n/az';
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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Autocomplete,
  Chip,
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

import { getAppeal, createAppeal, updateAppeal, checkDuplicateAppeal } from '../api/appeals';
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
  createDepOfficial,
  getAppealExecutors,
  addAppealExecutor,
  updateAppealExecutor,
  removeAppealExecutor,
  getHolidays,
  type ExecutorAssignment,
} from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePermissions } from '../hooks/usePermissions';
import { CustomLookupDialog } from '../components/CustomLookupDialog';
import { ExecutorDialog } from '../components/ExecutorDialog';
import { ExecutorDetailsDialog } from '../components/ExecutorDetailsDialog';
import { getErrorMessage } from '../utils/errors';
import { formatDateToDDMMYYYY, formatDateToISO, parseDateFromDDMMYYYY, formatDateToDDMMYYYY_Safe } from '../utils/dateUtils';
import { getSelectStyles } from '../utils/formStyles';

interface AppealFormData {
  num: number | string | undefined; // Hansı hərbi hissədən daxil olub
  reg_num: string; // Qeydealınma nömrəsi
  reg_date: string | undefined; // Qeydealınma tarixi
  exp_date: string | undefined; // İcra müddəti
  sec_in_ap_num: string; // Digər hərbi hissə üzrə nömrə
  sec_in_ap_date: string | undefined; // Digər qurum üzrə tarix
  in_ap_num: string; // Daxil olan müraciətin nömrəsi
  in_ap_date: string | undefined; // Daxil olan müraciətin tarixi
  dep_id: number | string | undefined; // Hansı qurumdan gəlib
  official_id: number | string | undefined; // Müraciət kimdən gəlib / İcraçılar
  person: string; // Müraciət edənin SAA
  region_id: number | string | undefined; // Ünvan (Region olaraq işlənir)
  who_control_id: number | string | undefined; // Kim baxımdır (Nəzarətçi)
  instructions_id: number | string | undefined; // Rəhbərin dərkənarı
  email: string; // Elektron poçt ünvanı
  phone: string; // Telefon nömrəsi
  paper_count: string; // Vərəq sayı
  content: string; // Müraciətin qısa məzmunu
  content_type_id: number | string | undefined; // Müraciətin növü
  account_index_id: number | string | undefined; // Hesabat indeksi
  ap_index_id: number | string | undefined; // Müraciətin indeksi
  status: number | string | undefined; // Müraciətin baxılması
  repetition: boolean; // Təkrar müraciət
  control: boolean; // Nəzarətdədir
  InSection: number | string | undefined;
  user_section_id: number | string | undefined;
  IsExecuted: boolean;
  PC: string | undefined;
  PC_Tarixi: string | undefined; // datetime
  exp_days: number | string | undefined;
}

const defaultValues: Partial<AppealFormData> = {
  num: '',
  reg_num: '',
  reg_date: '',
  exp_date: '',
  sec_in_ap_num: '',
  sec_in_ap_date: '',
  in_ap_num: '',
  in_ap_date: '',
  person: '',
  email: '',
  phone: '',
  content: '',
  repetition: false,
  control: false,
  IsExecuted: false,
  dep_id: '',
  official_id: '',
  region_id: '',
  who_control_id: '',
  instructions_id: '',
  content_type_id: '',
  account_index_id: '',
  ap_index_id: '',
  status: '',
  InSection: '',
  paper_count: '1',
  PC: '',
  PC_Tarixi: '',
  exp_days: '',
};



export default function AppealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isEditMode = !!id;
  const [error, setError] = useState<string>('');
  const selectStyles = getSelectStyles(theme.palette.primary.main);
  const { canEditAppeal } = usePermissions();
  // In view/edit mode, if user lacks edit_appeal → read-only
  const isReadOnly = isEditMode && !canEditAppeal;
  const labelSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'text.secondary',
    mb: 0.1,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& svg': { fontSize: '0.85rem', color: 'primary.main' },
  };
  const inputSx = {
    '& .MuiInputBase-root': {
      backgroundColor: 'background.paper',
      fontSize: '0.82rem',
      borderRadius: '4px',
      height: '30px',
    },
    '& .MuiOutlinedInput-input': { padding: '4px 6px' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
  };

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
  const [phoneInputValue, setPhoneInputValue] = useState('');
  const [openWhoControlDialog, setOpenWhoControlDialog] = useState(false);
  const [openOfficialDialog, setOpenOfficialDialog] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [pendingSubmitData, setPendingSubmitData] = useState<AppealFormData | null>(null);
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
  const inSectionFilled = watch('InSection'); // "Hansı hərbi hissədən daxil olub" – doldurulmadan Digər hərbi hissə/Digər qurum sahələri deaktiv

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

  // Calendar Day Styling & Tooltips
  const onDayCreate = (_dObj: any, _dStr: any, _fp: any, dayElem: any) => {
    const date = dayElem.dateObj;
    // Sunday is 0, Saturday is 6
    if (date.getDay() === 0 || date.getDay() === 6) {
      dayElem.classList.add('is-sunday');
    }

    // Check holidays
    if (holidays && holidays.length > 0) {
      const holiday = holidays.find(h => {
        const start = new Date(h.start_date);
        const end = new Date(h.end_date);
        // Reset times for comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      });

      if (holiday) {
        dayElem.classList.add('is-holiday');
        dayElem.setAttribute('title', holiday.name);
      }
    }
  };

  const commonFlatpickrOptions = {
    mode: 'single' as const,
    dateFormat: 'd.m.Y',
    allowInput: true,
    locale: {
      ...Azerbaijan,
      firstDayOfWeek: 1
    },
    onDayCreate
  };

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });
  const { data: holidays } = useQuery({ queryKey: ['holidays'], queryFn: getHolidays });

  const calculateAndSetExpDate = (daysToAdd: number) => {
    const regDateStr = watch('reg_date');
    if (!regDateStr || isNaN(daysToAdd) || daysToAdd <= 0) {
      if (daysToAdd === 0) setValue('exp_date', regDateStr);
      return;
    }

    let currentDate = parseDateFromDDMMYYYY(regDateStr);
    if (!currentDate) return;

    let addedDays = 0;
    // We start from the day AFTER registration date
    let calculationDate = new Date(currentDate);

    while (addedDays < daysToAdd) {
      calculationDate.setDate(calculationDate.getDate() + 1);
      const dayOfWeek = calculationDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Check if it's a weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      // Check if it's a holiday
      const isHoliday = holidays?.some(h => {
        const start = new Date(h.start_date);
        const end = new Date(h.end_date);
        // Normalize to date-only for comparison
        const check = new Date(calculationDate.getFullYear(), calculationDate.getMonth(), calculationDate.getDate());
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return check >= s && check <= e;
      });

      if (isHoliday) {
        continue;
      }

      addedDays++;
    }

    setValue('exp_date', formatDateToDDMMYYYY_Safe(calculationDate));
  };

  const calculateWorkingDays = (startDateStr: string, endDateStr: string): number => {
    const startDate = parseDateFromDDMMYYYY(startDateStr);
    const endDate = parseDateFromDDMMYYYY(endDateStr);

    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    if (endDate < startDate) return 0;

    let workingDays = 0;
    let tempDate = new Date(startDate);

    while (tempDate < endDate) {
      tempDate.setDate(tempDate.getDate() + 1);
      const dayOfWeek = tempDate.getDay();

      // Check weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Check holidays
      const isHoliday = holidays?.some(h => {
        const start = new Date(h.start_date);
        const end = new Date(h.end_date);
        const check = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return check >= s && check <= e;
      });

      if (isHoliday) continue;

      workingDays++;
    }

    return workingDays;
  };

  // Auto-calculate exp_date when reg_date or exp_days change
  const regDateValue = watch('reg_date');
  const expDaysValue = watch('exp_days');

  useEffect(() => {
    if (regDateValue && expDaysValue !== undefined) {
      calculateAndSetExpDate(Number(expDaysValue));
    }
  }, [regDateValue, expDaysValue, holidays]);

  // Returns true if duplicate found (dialog opened), false if safe to proceed
  const checkDuplicateBeforeSubmit = async (data: AppealFormData): Promise<boolean> => {
    const trimmedPerson = data.person?.trim();
    if (!trimmedPerson || isEditMode) return false;

    const currentYear = new Date().getFullYear();
    // Use raw user_section_id from form, or fall back to the logged-in user's section
    const sectionId = data.user_section_id || user?.section_id;

    if (!sectionId) {
      console.warn("Cannot check duplicate: sectionId missing");
      return false;
    }

    try {
      const result = await checkDuplicateAppeal(trimmedPerson, currentYear, Number(sectionId));
      if (result.exists) {
        setDuplicateCount(result.count);
        // Store sanitized data for actual submission after dialog confirm
        setPendingSubmitData(sanitizeFormData(data));
        setDuplicateDialogOpen(true);
        return true;
      }
    } catch (error) {
      console.error("Duplicate check failed", error);
    }
    return false;
  };

  // Appeal data and existing executors

  const { data: appealExecutors } = useQuery({
    queryKey: ['appeal-executors', id],
    queryFn: () => id ? getAppealExecutors(Number(id)) : Promise.resolve([]),
    enabled: isEditMode && !!id,
  });

  const { data: appeal, isLoading: appealLoading, isError: appealError, error: appealFetchError } = useQuery({
    queryKey: ['appeal', id],
    queryFn: () => getAppeal(Number(id)),
    enabled: isEditMode,
    retry: false, // Silinmiş müraciət üçün yenidən cəhd etmə
  });

  // React Query v5-də onError yoxdur – useEffect ilə izləyirik
  useEffect(() => {
    if (appealError) {
      const status = (appealFetchError as any)?.response?.status;
      if (status === 404 || status === 403) {
        navigate('/dashboard');
      }
    }
  }, [appealError, appealFetchError, navigate]);

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
      const workingDays = (appeal.reg_date && appeal.exp_date && holidays)
        ? calculateWorkingDays(formatDateToDDMMYYYY(appeal.reg_date), formatDateToDDMMYYYY(appeal.exp_date))
        : '';

      reset({
        num: appeal.num || '',
        reg_num: appeal.reg_num || '',
        reg_date: appeal.reg_date ? formatDateToDDMMYYYY(appeal.reg_date) : '',
        exp_date: appeal.exp_date ? formatDateToDDMMYYYY(appeal.exp_date) : '',
        exp_days: workingDays,
        sec_in_ap_num: appeal.sec_in_ap_num || '',
        sec_in_ap_date: appeal.sec_in_ap_date ? formatDateToDDMMYYYY(appeal.sec_in_ap_date) : '',
        in_ap_num: appeal.in_ap_num || '',
        in_ap_date: appeal.in_ap_date ? formatDateToDDMMYYYY(appeal.in_ap_date) : '',
        dep_id: appeal.dep_id || '',
        official_id: appeal.official_id || '',
        region_id: appeal.region_id || '',
        person: appeal.person || '',
        email: appeal.email || '',
        phone: appeal.phone || '',
        content: appeal.content || '',
        content_type_id: appeal.content_type_id || '',
        account_index_id: appeal.account_index_id || '',
        ap_index_id: appeal.ap_index_id || '',
        paper_count: appeal.paper_count || '1',
        who_control_id: appeal.who_control_id || '',
        instructions_id: appeal.instructions_id || '',
        status: appeal.status || '',
        repetition: appeal.repetition || false,
        control: appeal.control || false,
        PC: appeal.PC || '',
        PC_Tarixi: appeal.PC_Tarixi ? formatDateToDDMMYYYY(appeal.PC_Tarixi) : '',
        InSection: appeal.InSection || '',
      });
    }
  }, [appeal, reset, holidays]);

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

  const addDepOfficialMutation = useMutation({
    mutationFn: (name: string) => createDepOfficial({ dep_id: Number(selectedDepId), official: name }),
    onSuccess: (newOfficial) => {
      queryClient.invalidateQueries({ queryKey: ['dep-officials', selectedDepId] });
      setValue('official_id', newOfficial.id);
      setOpenOfficialDialog(false);
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

  const sanitizeFormData = (data: AppealFormData): AppealFormData => {
    const sanitizedData = { ...data };
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
        (sanitizedData as any)[field] = formatDateToISO(sanitizedData[field] as string) || undefined;
      }
    });
    return sanitizedData;
  };

  const onSubmit = async (data: AppealFormData) => {
    // On create mode: check for duplicate BEFORE sanitizing (to keep user_section_id intact)
    if (!isEditMode) {
      const isDuplicate = await checkDuplicateBeforeSubmit(data);
      if (isDuplicate) return; // Wait for dialog confirmation
    }

    const sanitizedData = sanitizeFormData(data);
    if (isEditMode) updateMutation.mutate(sanitizedData as any);
    else createMutation.mutate(sanitizedData as any);
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
          {isEditMode ? (isReadOnly ? 'Müraciətin Baxışı' : 'Müraciətin Redaktəsi') : 'Yeni Müraciət Qeydiyyatı'}
        </Typography>
        {isReadOnly && (
          <Alert severity="info" sx={{ mt: 1, borderRadius: 1 }}>
            Siz bu müraciəti yalnız baxış rejimində görürsünuz. Redaktə etmək üçün icazənə yoxlayın.
          </Alert>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1, py: 0.8 }}>{error}</Alert>}

      <Paper
        className="animate-slide-up glass-card"
        sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 2, width: '100%' }}
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
            border-color: var(--app-primary) !important;
            box-shadow: 0 0 0 1px var(--app-primary) !important;
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
            background: var(--app-primary) !important;
          }
          .flatpickr-day:hover {
            background: #f0f0f0 !important;
          }
          .flatpickr-current-month {
            color: var(--app-primary) !important;
            font-weight: 700 !important;
          }
          .flatpickr-day.is-sunday {
            color: #d32f2f !important;
            font-weight: 700 !important;
          }
          .flatpickr-day.is-holiday {
            background-color: #e8f5e9 !important;
            color: #2e7d32 !important;
            border-radius: 4px !important;
            font-weight: 700 !important;
            border: 1px solid #a5d6a7 !important;
          }
          .flatpickr-day.is-holiday:hover {
            background-color: #c8e6c9 !important;
          }
          .flatpickr-day.is-holiday.selected {
            background-color: var(--app-primary) !important;
            color: #fff !important;
          }
        `}</style>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0 }}>
            <Grid container spacing={1.5}>
              {/* Top Form Section: 4 Columns */}
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  {/* Column 1 */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography sx={labelSx}><NumbersIcon /> Qeydealınma nömrəsi:</Typography>
                        <Controller name="reg_num" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            sx={{
                              ...inputSx,
                              '& .MuiInputBase-root': {
                                ...inputSx['& .MuiInputBase-root'],
                                bgcolor: 'action.hover',
                                cursor: 'not-allowed',
                              },
                            }}
                            InputProps={{ readOnly: true }}
                            placeholder={isEditMode ? '' : 'Avtomatik təyin olunacaq'}
                          />
                        )} />
                      </Box>
                      <Box>
                        <Typography sx={labelSx}><CalendarMonthIcon /> Qeydealınma tarixi: <span style={{ color: '#d32f2f' }}>*</span></Typography>
                        <Controller
                          name="reg_date"
                          control={control}
                          rules={{ required: 'Bu sahə vacibdir' }}
                          render={({ field, fieldState }) => (
                            <Box>
                              <Flatpickr
                                id="reg_date_picker"
                                key="reg_date_picker"
                                name={field.name}
                                value={parseDateFromDDMMYYYY(field.value) || ''}
                                onChange={(dates) => {
                                  const dateStr = formatDateToDDMMYYYY_Safe(dates[0]);
                                  field.onChange(dateStr);

                                  // Sync reg_num year
                                  if (dates[0]) {
                                    const year = dates[0].getFullYear();
                                    const currentRegNum = watch('reg_num');
                                    if (currentRegNum) {
                                      const parts = currentRegNum.split('/');
                                      if (parts.length > 1) {
                                        parts[parts.length - 1] = year.toString();
                                        setValue('reg_num', parts.join('/'));
                                      } else {
                                        const segments = currentRegNum.split('-');
                                        if (segments.length > 1) {
                                          const last = segments[segments.length - 1];
                                          if (last.length === 4 && !isNaN(Number(last))) {
                                            segments[segments.length - 1] = year.toString();
                                            setValue('reg_num', segments.join('-'));
                                          }
                                        }
                                      }
                                    }
                                  }
                                }}
                                onBlur={field.onBlur}
                                options={{ ...commonFlatpickrOptions }}
                                className="flatpickr-input"
                                placeholder="dd.mm.yyyy"
                                style={fieldState.error ? { borderColor: '#d32f2f', boxShadow: '0 0 0 1px #d32f2f' } : {}}
                              />
                              {fieldState.error && (
                                <Typography color="error" variant="caption" sx={{ ml: 1, mt: 0.5, display: 'block' }}>
                                  {fieldState.error.message}
                                </Typography>
                              )}
                            </Box>
                          )}
                        />
                      </Box>
                      <Box>
                        <Typography sx={labelSx}><EventBusyIcon /> İcra müddəti (gün):</Typography>
                        <Controller name="exp_days" control={control} render={({ field: daysField }) => (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              {...daysField}
                              value={daysField.value || ''}
                              size="small"
                              type="number"
                              sx={{ ...inputSx, width: '80px' }}
                              placeholder="15"
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                                daysField.onChange(val);
                              }}
                            />
                            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              Date: {watch('exp_date') || '-'}
                            </Typography>
                          </Box>
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
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                              />
                            )} />
                          </Box>
                          <IconButton size="small" sx={{ p: '4px', color: 'primary.main', minWidth: 28 }} onClick={() => setOpenInSectionDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
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
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                              />
                            )} />
                          </Box>
                          <IconButton size="small" sx={{ p: '4px', color: 'primary.main', minWidth: 28 }} onClick={() => setOpenInstructionDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, p: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography sx={labelSx}><HistoryIcon /> Təkrar müraciət:</Typography>
                        <Controller name="repetition" control={control} render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            readOnly
                            disabled
                            title="Bu sahə avtomatik təyin olunur"
                            style={{ width: 16, height: 16, cursor: 'not-allowed', accentColor: theme.palette.primary.main, opacity: 0.65 }}
                          />
                        )} />
                      </Box>
                    </Box>
                  </Grid>

                  {/* Column 2 */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ opacity: inSectionFilled ? 1 : 0.65, pointerEvents: inSectionFilled ? 'auto' : 'none' }}>
                        <Typography sx={labelSx}><DescriptionIcon /> Digər hərbi hissə üzrə nömrəsi:</Typography>
                        <Controller name="sec_in_ap_num" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Nömrə" disabled={!inSectionFilled} />} />
                      </Box>
                      <Box sx={{ opacity: inSectionFilled ? 1 : 0.65, pointerEvents: inSectionFilled ? 'auto' : 'none' }}>
                        <Typography sx={labelSx}><CalendarMonthIcon /> Digər qurum üzrə tarix:</Typography>
                        <Controller
                          name="sec_in_ap_date"
                          control={control}
                          render={({ field }) => (
                            <Flatpickr
                              id="sec_in_ap_date_picker"
                              key="sec_in_ap_date_picker"
                              name={field.name}
                              value={parseDateFromDDMMYYYY(field.value) || ''}
                              onChange={(dates) => field.onChange(formatDateToDDMMYYYY_Safe(dates[0]))}
                              onBlur={field.onBlur}
                              options={{ ...commonFlatpickrOptions }}
                              className="flatpickr-input"
                              placeholder="dd.mm.yyyy"
                            />
                          )}
                        />
                      </Box>
                      <Box>
                        <Typography sx={labelSx}><DescriptionIcon /> Daxil olan müraciətin nömrəsi:</Typography>
                        <Controller name="in_ap_num" control={control} render={({ field }) => <TextField {...field} fullWidth size="small" sx={inputSx} placeholder="Nömrə" />} />
                      </Box>
                      <Box>
                        <Typography sx={labelSx}><CalendarMonthIcon /> Daxil olan müraciətin tarixi:</Typography>
                        <Controller name="in_ap_date" control={control} render={({ field }) => (
                          <Flatpickr
                            id="in_ap_date_picker"
                            key="in_ap_date_picker"
                            name={field.name}
                            value={parseDateFromDDMMYYYY(field.value) || ''}
                            onChange={(dates) => field.onChange(formatDateToDDMMYYYY_Safe(dates[0]))}
                            onBlur={field.onBlur}
                            options={{ ...commonFlatpickrOptions }}
                            disabled={!inSectionFilled}
                            className="flatpickr-input"
                            placeholder="dd.mm.yyyy"
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
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                              />
                            )} />
                          </Box>
                          <IconButton size="small" sx={{ p: '4px', color: 'primary.main', minWidth: 28 }} onClick={() => setOpenDeptDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
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
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                              />
                            )} />
                          </Box>
                          <IconButton
                            size="small"
                            sx={{ p: '4px', color: 'primary.main', minWidth: 28 }}
                            disabled={!selectedDepId}
                            onClick={() => setOpenOfficialDialog(true)}
                            title={selectedDepId ? 'Yeni ad əlavə et' : 'Əvvəlcə qurum seçin'}
                          >
                            <AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={labelSx}>
                          <PersonIcon /> Müraciət edənin SAA: <span style={{ color: '#d32f2f' }}>*</span>
                        </Typography>
                        <Controller
                          name="person"
                          control={control}
                          rules={{ required: 'Bu sahə vacibdir' }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              sx={inputSx}
                              placeholder="Aaaaa"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                            />
                          )}
                        />
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
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                              />
                            )} />
                          </Box>
                          <IconButton size="small" sx={{ p: '4px', color: 'primary.main', minWidth: 28 }} onClick={() => setOpenRegionDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
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
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                              />
                            )} />
                          </Box>
                          <IconButton size="small" sx={{ p: '4px', color: 'primary.main', minWidth: 28 }} onClick={() => setOpenWhoControlDialog(true)}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, p: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography sx={labelSx}><VisibilityIcon /> Nəzarətdədir:</Typography>
                        <Controller name="control" control={control} render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: theme.palette.primary.main }}
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
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                              />
                            )} />
                          </Box>
                          <IconButton size="small" sx={{ p: '4px', color: 'primary.main', minWidth: 28 }}><AddCircleOutlineIcon sx={{ fontSize: '0.9rem' }} /></IconButton>
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
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => {
                            const baseDisplay = (field.value || '')
                              .split(',')
                              .filter(Boolean)
                              .join('\n');
                            const displayValue = phoneInputValue !== '' ? phoneInputValue : baseDisplay;

                            return (
                              <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                size="small"
                                placeholder="+994xx xxx xx xx  (hər sətrdə bir nömrə)"
                                value={displayValue}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/\r/g, '') || '';
                                  const lines = raw.split('\n');

                                  const processed: string[] = [];
                                  let lastDigitsLen = 0;

                                  lines.forEach((line, idx) => {
                                    let digits = line.replace(/\D/g, '');
                                    if (digits.startsWith('994')) digits = digits.slice(3);
                                    digits = digits.slice(0, 9);

                                    if (!digits) {
                                      processed.push('');
                                      return;
                                    }

                                    let formatted = '+994';
                                    if (digits.length <= 2) {
                                      formatted += ` ${digits}`;
                                    } else if (digits.length <= 5) {
                                      formatted += ` ${digits.slice(0, 2)} ${digits.slice(2)}`;
                                    } else if (digits.length <= 7) {
                                      formatted += ` ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
                                    } else {
                                      formatted += ` ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
                                    }

                                    if (idx === lines.length - 1) {
                                      lastDigitsLen = digits.length;
                                    }

                                    processed.push(formatted.trim());
                                  });

                                  let display = processed.join('\n');
                                  if (lastDigitsLen === 9) {
                                    display = display + '\n';
                                  }

                                  const stored = processed
                                    .map(l => l.trim())
                                    .filter(Boolean)
                                    .join(',');

                                  setPhoneInputValue(display);
                                  field.onChange(stored);
                                }}
                                sx={{
                                  ...inputSx,
                                  '& .MuiInputBase-root': {
                                    ...inputSx['& .MuiInputBase-root'],
                                    height: 'auto',
                                    minHeight: '40px',
                                    alignItems: 'flex-start',
                                  },
                                }}
                              />
                            );
                          }}
                        />
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
                        styles={selectStyles}
                        menuPortalTarget={document.body}
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
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    )} />
                  </Box>
                  <Box>
                    <Typography sx={labelSx}>
                      Müraciətin indeksi: <span style={{ color: '#d32f2f' }}>*</span>
                    </Typography>
                    <Controller
                      name="ap_index_id"
                      control={control}
                      rules={{ required: 'Bu sahə vacibdir' }}
                      render={({ field, fieldState }) => (
                        <Box>
                          <Select
                            {...field}
                            options={toSelectOptions(apIndexes, 'ap_index')}
                            value={field.value ? toSelectOptions(apIndexes, 'ap_index').find(o => o.value === field.value) : null}
                            onChange={(e) => field.onChange(e?.value)}
                            isClearable
                            isSearchable
                            placeholder="1. Sovlet qullugu ve kadr meseleleri"
                            styles={{
                              ...selectStyles,
                              control: (base: any, state: any) => ({
                                ...selectStyles.control(base, state),
                                borderColor: fieldState.error ? '#d32f2f' : (selectStyles.control(base, state).borderColor || '#cbd5e1'),
                                '&:hover': {
                                  borderColor: fieldState.error ? '#d32f2f' : '#94a3b8'
                                }
                              })
                            }}
                            menuPortalTarget={document.body}
                          />
                          {fieldState.error && (
                            <Typography color="error" variant="caption" sx={{ ml: 1, mt: 0.5, display: 'block' }}>
                              {fieldState.error.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Executor Section */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.82rem' }}>
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
                        color: '#7c3aed',
                        borderColor: 'rgba(124, 58, 237, 0.4)',
                        bgcolor: 'rgba(124, 58, 237, 0.05)',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.1)', borderColor: '#7c3aed' }
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
                        color: '#374151',
                        borderColor: '#cbd5e1',
                        bgcolor: '#f9f9f9',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        '&:hover': { bgcolor: '#f3f4f6', borderColor: '#9ca3af' },
                        '&.Mui-disabled': { borderColor: '#e5e7eb', color: '#9ca3af' }
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
                        if (selectedExecutorForEdit) {
                          if (window.confirm('Bu icraçını silmək istədiyinizə əminsiniz?')) {
                            if (isEditMode && selectedExecutorForEdit.id) {
                              removeExecutorFromAppealMutation.mutate(selectedExecutorForEdit.id);
                            } else {
                              setSelectedExecutors(prev => prev.filter(ex =>
                                (ex.id && ex.id !== selectedExecutorForEdit.id) ||
                                (ex.executor_id !== selectedExecutorForEdit.executor_id)
                              ));
                              setSelectedExecutorForEdit(null);
                            }
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
                        borderRadius: '6px',
                        '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)', borderColor: '#d32f2f' },
                        '&.Mui-disabled': { borderColor: '#fee2e2', color: '#f87171' }
                      }}
                    >
                      Sil
                    </Button>
                  </Box>

                  <Box sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}>
                    <Table size="small" sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow sx={{
                          background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                        }}>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>İCRAÇININ STRUKTUR BÖLMƏSİ</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>SOYADI, ADI</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>HANSI SƏNƏDLƏ İCRA EDİLİB</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>SƏNƏDİN TARİXİ</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>TİKDİYİ İŞİN NÖMRƏSİ</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>İŞDƏKİ VƏRƏQ NÖMRƏSİ</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>GÖNDƏRİLMƏ NÖMRƏSİ</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>GÖNDƏRİLMƏ TARİXİ</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            borderRight: '1px solid rgba(255,255,255,0.1)'
                          }}>HARA (KİMƏ) GÖNDƏRİLİB</TableCell>
                          <TableCell sx={{
                            fontWeight: 700, py: 1.2, fontSize: '0.7rem', color: 'white',
                            textAlign: 'center'
                          }}>ƏSAS İCRAÇI</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedExecutors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} align="center" sx={{ py: 2, color: 'text.secondary', fontSize: '0.7rem' }}>Hələ icraçı təyin edilməyib</TableCell>
                          </TableRow>
                        ) : (
                          selectedExecutors.map((executor) => (
                            <TableRow
                              key={executor.id || executor.executor_id}
                              onClick={() => setSelectedExecutorForEdit(executor)}
                              sx={{
                                '&:hover': { bgcolor: 'action.hover' },
                                bgcolor: (selectedExecutorForEdit?.id && selectedExecutorForEdit?.id === executor.id) || (selectedExecutorForEdit?.executor_id === executor.executor_id) ? 'action.selected' : 'inherit',
                                cursor: 'pointer',
                                borderBottom: '1px solid',
                                borderColor: 'divider'
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
              {!isReadOnly && (
                <Button
                  variant="outlined"
                  startIcon={<CleaningServicesIcon />}
                  onClick={handleClear}
                  sx={{
                    px: 3,
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: '#334155',
                    borderColor: '#cbd5e1',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                  }}
                >
                  TƏMİZLƏ
                </Button>
              )}
              <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
                {!isReadOnly && (
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    type="submit"
                    sx={{
                      px: 4,
                      borderRadius: '50px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                      textTransform: 'none',
                      boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.4)',
                      '&:hover': { filter: 'brightness(1.05)', boxShadow: '0 10px 15px -3px rgb(79 70 229 / 0.4)' }
                    }}
                  >
                    {isEditMode ? 'REDAKTƏ ET' : 'YADDA SAXLA'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<ExitToAppIcon />}
                  onClick={() => navigate('/appeals')}
                  sx={{
                    px: 3,
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: '#334155',
                    borderColor: '#cbd5e1',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                  }}
                >
                  ÇIXIŞ
                </Button>
              </Box>
            </Box>
          </fieldset>
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
      <CustomLookupDialog
        open={openOfficialDialog}
        title="Yeni Ad Əlavə Et"
        fieldLabel="Ad, Soyad, Ata adı"
        onAdd={(value) => addDepOfficialMutation.mutateAsync(value).then(() => { })}
        onClose={() => setOpenOfficialDialog(false)}
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
            if (isEditMode && selectedExecutorForEdit.id) {
              await updateExecutorDetailsMutation.mutateAsync({
                executorId: selectedExecutorForEdit.id,
                data: data,
              });
            }

            // Always update local state to reflect changes (ui update)
            setSelectedExecutors(prev =>
              prev.map((e: any) => {
                const match = (e.id && e.id === selectedExecutorForEdit.id) ||
                  (e.executor_id === selectedExecutorForEdit.executor_id);
                if (match) {
                  return { ...e, ...data };
                }
                // Clear is_primary from other executors if this one is primary
                if (data.is_primary) {
                  return { ...e, is_primary: false };
                }
                return e;
              })
            );
            setExecutorDetailsDialogOpen(false);
            setSelectedExecutorForEdit(null);
          }}
          onClose={() => {
            setExecutorDetailsDialogOpen(false);
            setSelectedExecutorForEdit(null);
          }}
          loading={updateExecutorDetailsMutation.isPending}
        />
      )}

      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800, color: 'warning.dark' }}>⚠️ Təkrar Müraciət!</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 500 }}>
            Bu şəxsin (<strong>{pendingSubmitData?.person}</strong>) artıq qeydiyyatda{' '}
            <strong>{duplicateCount}</strong> müraciəti var.
            <br />
            Müraciəti təkrar müraciət kimi qeydiyyata almaq istəyirsiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setDuplicateDialogOpen(false);
              setPendingSubmitData(null);
            }}
            sx={{ fontWeight: 700, color: 'text.secondary' }}
          >
            Xeyr, qeydə alma
          </Button>
          <Button
            onClick={() => {
              if (pendingSubmitData) {
                const dataWithRepetition = { ...pendingSubmitData, repetition: true };
                setValue('repetition', true);
                setDuplicateDialogOpen(false);
                setPendingSubmitData(null);
                createMutation.mutate(dataWithRepetition);
              }
            }}
            variant="contained"
            color="warning"
            autoFocus
            sx={{ fontWeight: 700 }}
          >
            Bəli, qeydə alın
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}