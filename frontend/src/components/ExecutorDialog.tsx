import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    ListItemText,
    Checkbox,
    Typography,
    Divider,
    Grid,
    TextField,
} from '@mui/material';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { getDirections, getExecutorListByDirection } from '../api/lookups';
import { formatDateToISO, parseDateFromDDMMYYYY, formatDateToDDMMYYYY_Safe } from '../utils/dateUtils';

export interface SelectedExecutorData {
    id: number;
    name: string;
    isPrimary: boolean;
    // Extra fields from form
    out_num?: string;
    out_date?: string;
    attach_num?: string;
    attach_paper_num?: string;
    r_num?: string;
    r_date?: string;
    posted_sec?: string;
}

interface ExecutorDialogProps {
    open: boolean;
    onAdd: (directionId: number, executors: SelectedExecutorData[], directionName: string) => Promise<void>;
    onClose: () => void;
    directionFilter?: number;
    defaultValues?: Partial<SelectedExecutorData>;
}

export function ExecutorDialog({
    open,
    onAdd,
    onClose,
    directionFilter,
    defaultValues,
}: ExecutorDialogProps) {
    const [directionId, setDirectionId] = useState<number | ''>('');
    const [executorIds, setExecutorIds] = useState<number[]>([]);
    const [primaryExecutorId, setPrimaryExecutorId] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Extra fields state
    const [outNum, setOutNum] = useState('');
    const [outDate, setOutDate] = useState('');
    const [attachNum, setAttachNum] = useState('');
    const [attachPaperNum, setAttachPaperNum] = useState('');
    const [rNum, setRNum] = useState('');
    const [rDate, setRDate] = useState('');
    const [postedSec, setPostedSec] = useState('');

    const { data: directions } = useQuery({
        queryKey: ['directions'],
        queryFn: getDirections,
        enabled: open,
    });

    const { data: executors, isLoading: isLoadingExecutors } = useQuery({
        queryKey: ['executors', directionId],
        queryFn: () => getExecutorListByDirection(Number(directionId)),
        enabled: open && !!directionId,
    });

    // If directionFilter or defaultValues are provided, auto-select it
    useEffect(() => {
        if (open) {
            if (directionFilter) setDirectionId(directionFilter);
            if (defaultValues) {
                if (defaultValues.out_num) setOutNum(defaultValues.out_num);
                if (defaultValues.out_date) {
                    // Pre-fill might be in DD/MM/YYYY format
                    setOutDate(defaultValues.out_date.includes('/') ? defaultValues.out_date : defaultValues.out_date);
                }
                if (defaultValues.attach_num) setAttachNum(defaultValues.attach_num);
                if (defaultValues.attach_paper_num) setAttachPaperNum(defaultValues.attach_paper_num);
                if (defaultValues.r_num) setRNum(defaultValues.r_num);
                if (defaultValues.r_date) {
                    // Pre-fill might be in DD/MM/YYYY format
                    setRDate(defaultValues.r_date);
                }
                if (defaultValues.posted_sec) setPostedSec(defaultValues.posted_sec);
            }
        }
    }, [directionFilter, defaultValues, open]);

    // Handle single vs multiple selection and primary logic
    useEffect(() => {
        if (executorIds.length === 1) {
            setPrimaryExecutorId(executorIds[0]);
        } else if (executorIds.length === 0) {
            setPrimaryExecutorId('');
        } else if (primaryExecutorId && !executorIds.includes(Number(primaryExecutorId))) {
            setPrimaryExecutorId('');
        }
    }, [executorIds, primaryExecutorId]);

    const handleAdd = async () => {
        if (!directionId || executorIds.length === 0) {
            setError('Xahiş edirik bölmə və ən azı bir icraçı seçin');
            return;
        }

        if (executorIds.length > 1 && !primaryExecutorId) {
            setError('Xahiş edirik əsas icraçını seçin');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            // Helper to ensure dates are ISO for backend
            const ensureISO = (dateStr: string) => {
                if (!dateStr) return '';
                if (dateStr.includes('.')) return formatDateToISO(dateStr);
                return dateStr;
            };

            const selectedDirectionName = directions?.find(d => d.id === directionId)?.direction || '';
            const selectedExecutors: SelectedExecutorData[] = executorIds.map(id => {
                const ex = executors?.find(e => e.id === id);
                return {
                    id,
                    name: ex?.executor || '',
                    isPrimary: id === primaryExecutorId,
                    out_num: outNum,
                    out_date: ensureISO(outDate),
                    attach_num: attachNum,
                    attach_paper_num: attachPaperNum,
                    r_num: rNum,
                    r_date: ensureISO(rDate),
                    posted_sec: postedSec
                };
            });

            await onAdd(directionId as number, selectedExecutors, selectedDirectionName);
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Xəta baş verdi. Xahiş edirik yenidən cəhd edin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setExecutorIds([]);
        setPrimaryExecutorId('');
        if (!directionFilter) setDirectionId('');
        setOutNum('');
        setOutDate('');
        setAttachNum('');
        setAttachPaperNum('');
        setRNum('');
        setRDate('');
        setPostedSec('');
        setError('');
        onClose();
    };

    const selectedExecutorsOptions = useMemo(() => {
        return executors?.filter(ex => executorIds.includes(ex.id)) || [];
    }, [executors, executorIds]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, color: '#3e4a21' }}>Yeni İcraçı Təyin Et</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <FormControl fullWidth size="small">
                        <InputLabel>Bölmə (İstiqamət)</InputLabel>
                        <Select
                            value={directionId}
                            label="Bölmə (İstiqamət)"
                            onChange={(e) => {
                                setDirectionId(e.target.value as number | '');
                                setExecutorIds([]);
                                setPrimaryExecutorId('');
                                setError('');
                            }}
                            disabled={!!directionFilter || isLoading}
                        >
                            <MenuItem value="">Seçin</MenuItem>
                            {directions?.map((dir) => (
                                <MenuItem key={dir.id} value={dir.id}>
                                    {dir.direction}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!directionId || isLoading || isLoadingExecutors} sx={{ position: 'relative' }}>
                        <InputLabel>İcraçılar</InputLabel>
                        <Select
                            multiple
                            value={executorIds}
                            label="İcraçılar"
                            onChange={(e) => {
                                setExecutorIds(e.target.value as number[]);
                                setError('');
                            }}
                            renderValue={(selected) => {
                                return executors
                                    ?.filter(ex => selected.includes(ex.id))
                                    .map(ex => ex.executor)
                                    .join(', ');
                            }}
                        >
                            {executors?.map((ex) => (
                                <MenuItem key={ex.id} value={ex.id}>
                                    <Checkbox checked={executorIds.indexOf(ex.id) > -1} />
                                    <ListItemText primary={ex.executor} />
                                </MenuItem>
                            ))}
                        </Select>
                        {isLoadingExecutors && <CircularProgress size={20} sx={{ position: 'absolute', right: 35, top: 10 }} />}
                    </FormControl>

                    {executorIds.length > 1 && (
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                            <InputLabel>Əsas İcraçı</InputLabel>
                            <Select
                                value={primaryExecutorId}
                                label="Əsas İcraçı"
                                onChange={(e) => {
                                    setPrimaryExecutorId(e.target.value as number);
                                    setError('');
                                }}
                            >
                                {selectedExecutorsOptions.map((ex) => (
                                    <MenuItem key={ex.id} value={ex.id}>
                                        {ex.executor}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, ml: 1 }}>
                                Birdən çox icraçı seçildikdə əsas icraçını müəyyən edin
                            </Typography>
                        </FormControl>
                    )}

                    {executorIds.length === 1 && (
                        <Typography variant="caption" sx={{ ml: 1, color: '#3e4a21', fontWeight: 600 }}>
                            Seçilmiş icraçı avtomatik olaraq əsas icraçı kimi təyin ediləcək.
                        </Typography>
                    )}

                    <Divider sx={{ my: 1, opacity: 0.3 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#3e4a21', mb: -1 }}>İcra Təfsilatları</Typography>

                    <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Hansı sənədlə icra edilib</Typography>
                            <TextField fullWidth size="small" value={rNum} onChange={(e) => setRNum(e.target.value)} sx={{ '& .MuiInputBase-root': { height: '30px', fontSize: '0.8rem' } }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Sənədin tarixi</Typography>
                            <Flatpickr
                                value={parseDateFromDDMMYYYY(rDate) || undefined}
                                onChange={(dates) => setRDate(formatDateToDDMMYYYY_Safe(dates[0]))}
                                options={{ dateFormat: 'd.m.Y' }}
                                placeholder="Tarix"
                                style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Tikdiyi işin nömrəsi</Typography>
                            <TextField fullWidth size="small" value={attachNum} onChange={(e) => setAttachNum(e.target.value)} sx={{ '& .MuiInputBase-root': { height: '30px', fontSize: '0.8rem' } }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', mb: 0.5 }}>İşdəki vərəq nömrəsi</Typography>
                            <TextField fullWidth size="small" value={attachPaperNum} onChange={(e) => setAttachPaperNum(e.target.value)} sx={{ '& .MuiInputBase-root': { height: '30px', fontSize: '0.8rem' } }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Göndərilmə nömrəsi</Typography>
                            <TextField fullWidth size="small" value={outNum} onChange={(e) => setOutNum(e.target.value)} sx={{ '& .MuiInputBase-root': { height: '30px', fontSize: '0.8rem' } }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Göndərilmə tarixi</Typography>
                            <Flatpickr
                                value={parseDateFromDDMMYYYY(outDate) || undefined}
                                onChange={(dates) => setOutDate(formatDateToDDMMYYYY_Safe(dates[0]))}
                                options={{ dateFormat: 'd.m.Y' }}
                                placeholder="Tarix"
                                style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', mb: 0.5 }}>Hara (kimə) göndərilib</Typography>
                            <TextField fullWidth multiline rows={1} size="small" value={postedSec} onChange={(e) => setPostedSec(e.target.value)} sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem', height: 'auto' } }} />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={isLoading} sx={{ color: '#666' }}>
                    İmtina Et
                </Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    disabled={isLoading || !directionId || executorIds.length === 0}
                    sx={{
                        bgcolor: '#3e4a21',
                        '&:hover': { bgcolor: '#2c3518' },
                        px: 3,
                        fontWeight: 700
                    }}
                >
                    {isLoading ? 'Əlavə Edilir...' : 'Əlavə Et'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
