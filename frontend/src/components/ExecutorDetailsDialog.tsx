import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Azerbaijan } from 'flatpickr/dist/l10n/az';
import { ExecutorAssignment, getDirections, getExecutorListByDirection } from '../api/lookups';
import { parseDateFromDDMMYYYY, formatDateToDDMMYYYY_Safe } from '../utils/dateUtils';

interface ExecutorDetailsDialogProps {
  open: boolean;
  executor: ExecutorAssignment | null;
  onSave: (data: Partial<ExecutorAssignment>) => void;
  onClose: () => void;
  loading?: boolean;
}

export function ExecutorDetailsDialog({
  open,
  executor,
  onSave,
  onClose,
  loading = false,
}: ExecutorDetailsDialogProps) {
  const [formData, setFormData] = useState<Partial<ExecutorAssignment>>(
    executor || {}
  );

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: getDirections,
    enabled: open,
  });

  const { data: executors, isLoading: isLoadingExecutors } = useQuery({
    queryKey: ['executors', formData.direction_id],
    queryFn: () => getExecutorListByDirection(Number(formData.direction_id)),
    enabled: open && !!formData.direction_id,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Include names for local state updates
    const selectedDir = directions?.find(d => d.id === formData.direction_id);
    const selectedEx = executors?.find(e => e.id === formData.executor_id);
    
    // Sanitize dates: convert empty strings to undefined for backend
    const sanitizedData = { ...formData };
    const dateFields: (keyof ExecutorAssignment)[] = ['out_date', 'r_date', 'PC_Tarixi'];
    dateFields.forEach(field => {
      if (sanitizedData[field] === '') {
        delete sanitizedData[field];
      }
    });

    onSave({
      ...sanitizedData,
      direction_name: selectedDir?.direction || (formData as any).direction_name,
      executor_name: selectedEx?.executor || (formData as any).executor_name,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        fontWeight: 800, 
        color: 'white',
        background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
        pb: 2
      }}>
        İcraçı Təfsilatları
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2}>
            {/* Bölmə / İdarə */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.85rem', fontWeight: 600 }}>İcraçının struktur bölməsi</InputLabel>
                <Select
                  value={formData.direction_id || ''}
                  label="İcraçının struktur bölməsi"
                  onChange={(e) => {
                    handleChange('direction_id', e.target.value);
                    handleChange('executor_id', undefined);
                  }}
                  sx={{ borderRadius: 1.5, bgcolor: 'white' }}
                >
                  {directions?.map((dir) => (
                    <MenuItem key={dir.id} value={dir.id}>{dir.direction}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* İcraçı */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" disabled={!formData.direction_id || isLoadingExecutors}>
                <InputLabel sx={{ fontSize: '0.85rem', fontWeight: 600 }}>İcraçı</InputLabel>
                <Select
                  value={formData.executor_id || ''}
                  label="İcraçı"
                  onChange={(e) => handleChange('executor_id', e.target.value)}
                  sx={{ borderRadius: 1.5, bgcolor: 'white' }}
                  endAdornment={isLoadingExecutors ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
                >
                  {executors?.map((ex) => (
                    <MenuItem key={ex.id} value={ex.id}>{ex.executor}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Əsas icraçı */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_primary || false}
                    onChange={(e) => handleChange('is_primary', e.target.checked)}
                    sx={{
                      '&.Mui-checked': {
                        color: '#7c3aed',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600, color: '#333' }}>
                    Əsas icraçı kimi işarələ
                  </Typography>
                }
              />
            </Grid>
            {/* Göndərilmə nömrəsi */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                Göndərilmə nömrəsi
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.out_num || ''}
                onChange={(e) => handleChange('out_num', e.target.value)}
                placeholder="Nömrə"
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 1.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                }}
              />
            </Grid>

            {/* Göndərilmə tarixi */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                Göndərilmə tarixi
              </Typography>
              <Flatpickr
                value={parseDateFromDDMMYYYY(formData.out_date) || ''}
                onChange={(dates) =>
                  handleChange('out_date', formatDateToDDMMYYYY_Safe(dates[0]))
                }
                options={{
                  mode: 'single',
                  dateFormat: 'd.m.Y',
                  locale: {
                    ...Azerbaijan,
                    firstDayOfWeek: 1
                  }
                }}
                placeholder="Tarix seçin"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </Grid>

            {/* Tikdiyi işin nömrəsi */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                Tikdiyi işin nömrəsi
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.attach_num || ''}
                onChange={(e) => handleChange('attach_num', e.target.value)}
                placeholder="Nömrə"
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 1.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                }}
              />
            </Grid>

            {/* İşdəki vərəq nömrəsi */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                İşdəki vərəq nömrəsi
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.attach_paper_num || ''}
                onChange={(e) => handleChange('attach_paper_num', e.target.value)}
                placeholder="Nömrə"
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 1.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                }}
              />
            </Grid>

            {/* Cavab nömrəsi (Hansı sənədlə icra edilib) */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                Hansı sənədlə icra edilib
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.r_num || ''}
                onChange={(e) => handleChange('r_num', e.target.value)}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 1.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                }}
              />
            </Grid>

            {/* Sənədin tarixi */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                Sənədin tarixi
              </Typography>
              <Flatpickr
                value={parseDateFromDDMMYYYY(formData.r_date) || ''}
                onChange={(dates) =>
                  handleChange('r_date', formatDateToDDMMYYYY_Safe(dates[0]))
                }
                options={{
                  mode: 'single',
                  dateFormat: 'd.m.Y',
                  locale: {
                    ...Azerbaijan,
                    firstDayOfWeek: 1
                  }
                }}
                placeholder="Tarix"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  backgroundColor: '#f8fafc',
                  fontSize: '14px',
                }}
              />
            </Grid>

            {/* Hara (kimə) göndərilib */}
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                Hara (kimə) göndərilib
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                value={formData.posted_sec || ''}
                onChange={(e) => handleChange('posted_sec', e.target.value)}
                placeholder="Ünvan..."
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 1.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                }}
              />
            </Grid>

            {/* PC */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                PC
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.PC || ''}
                onChange={(e) => handleChange('PC', e.target.value)}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'white', borderRadius: 1.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                }}
              />
            </Grid>

            {/* PC Tarixi */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#444', mb: 0.5 }}>
                PC Tarixi
              </Typography>
              <Flatpickr
                value={parseDateFromDDMMYYYY(formData.PC_Tarixi) || ''}
                onChange={(dates) =>
                  handleChange('PC_Tarixi', formatDateToDDMMYYYY_Safe(dates[0]))
                }
                options={{
                  mode: 'single',
                  dateFormat: 'd.m.Y',
                  locale: {
                    ...Azerbaijan,
                    firstDayOfWeek: 1
                  }
                }}
                placeholder="Tarix"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  backgroundColor: '#f8fafc',
                  fontSize: '14px',
                }}
              />
            </Grid>

            {/* Aktiv */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active || false}
                    onChange={(e) => handleChange('active', e.target.checked)}
                    sx={{
                      '&.Mui-checked': {
                        color: '#7c3aed',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600, color: '#333' }}>
                    Aktiv
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#e2e8f0',
            color: '#64748b',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '50px',
            px: 3,
            '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
          }}
        >
          Ləğv et
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '50px',
            px: 4,
            boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.4)',
            '&:hover': { filter: 'brightness(1.05)', boxShadow: '0 10px 15px -3px rgb(79 70 229 / 0.4)' },
          }}
        >
          Yadda saxla
        </Button>
      </DialogActions>
    </Dialog>
  );
}
