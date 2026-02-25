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
} from '@mui/material';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { ExecutorAssignment } from '../api/lookups';
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#3e4a21' }}>
        İcraçı Təfsilatları
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Əsas icraçı */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_primary || false}
                onChange={(e) => handleChange('is_primary', e.target.checked)}
                sx={{
                  '&.Mui-checked': {
                    color: '#3e4a21',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 600, color: '#333' }}>
                Əsas icraçı kimi işarələ
              </Typography>
            }
            sx={{ mb: 1 }}
          />

          <Grid container spacing={2}>
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
                value={parseDateFromDDMMYYYY(formData.out_date) || undefined}
                onChange={(dates) =>
                  handleChange('out_date', formatDateToDDMMYYYY_Safe(dates[0]))
                }
                options={{
                  mode: 'single',
                  dateFormat: 'd.m.Y',
                }}
                placeholder="Tarix seçin"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  backgroundColor: 'white',
                  fontSize: '14px',
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
                value={parseDateFromDDMMYYYY(formData.r_date) || undefined}
                onChange={(dates) =>
                  handleChange('r_date', formatDateToDDMMYYYY_Safe(dates[0]))
                }
                options={{
                  mode: 'single',
                  dateFormat: 'd.m.Y',
                }}
                placeholder="Tarix"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  backgroundColor: 'white',
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
                value={parseDateFromDDMMYYYY(formData.PC_Tarixi) || undefined}
                onChange={(dates) =>
                  handleChange('PC_Tarixi', formatDateToDDMMYYYY_Safe(dates[0]))
                }
                options={{
                  mode: 'single',
                  dateFormat: 'd.m.Y',
                }}
                placeholder="Tarix"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  backgroundColor: 'white',
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
                        color: '#3e4a21',
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
            borderColor: '#ccc',
            color: '#666',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { borderColor: '#999' },
          }}
        >
          Ləğv et
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#3e4a21',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#2c3a19' },
          }}
        >
          Yadda saxla
        </Button>
      </DialogActions>
    </Dialog>
  );
}
