import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    useTheme,
} from '@mui/material';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getAppealReport, ReportParams } from '../api/reports';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSelectStyles } from '../utils/formStyles';

const groupByOptions = [
    { value: 'department', label: 'İdarə üzrə' },
    { value: 'region', label: 'Region üzrə' },
    { value: 'status', label: 'Status üzrə' },
    { value: 'index', label: 'İndeks üzrə' },
    { value: 'insection', label: 'Hərbi hissə üzrə' },
];

export default function Reports() {
    const theme = useTheme();
    const [params, setParams] = useState<ReportParams>({
        group_by: 'department',
        start_date: '',
        end_date: '',
    });
    const startDateRef = useRef<any>(null);
    const endDateRef = useRef<any>(null);

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['report', params],
        queryFn: () => getAppealReport(params),
    });

    const handlePreset = (type: 'week' | 'month' | 'year') => {
        const end = new Date();
        const start = new Date();
        if (type === 'week') start.setDate(end.getDate() - 7);
        else if (type === 'month') start.setMonth(end.getMonth() - 1);
        else if (type === 'year') start.setFullYear(end.getFullYear() - 1);

        setParams({
            ...params,
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0],
        });
    };

    const clearFilters = () => {
        setParams({
            group_by: 'department',
            start_date: '',
            end_date: '',
        });
    };

    const getGroupLabel = (val: string) => {
        switch (val) {
            case 'department': return 'İdarə';
            case 'region': return 'Region';
            case 'status': return 'Status';
            case 'index': return 'Müraciət İndeksi';
            case 'insection': return 'Hərbi hissə (Bölmə)';
            default: return 'Kateqoriya';
        }
    };

    return (
        <Layout>
            <Box sx={{ mb: 4 }} className="animate-fade-in">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" fontWeight="900" color="primary">
                        Hesabatlar və Analitika
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                    Müraciətlərin statistik təhlili və dinamik hesabatların yaradılması
                </Typography>
            </Box>

            <Paper
                className="animate-fade-in glass-card"
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.7)',
                    '& .flatpickr-input': {
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider',
                        padding: '8px 12px',
                        backgroundColor: 'background.paper',
                        fontSize: '14px',
                        '&:focus': {
                            outline: 'none',
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 1px',
                        },
                    },
                    '& .flatpickr-calendar': {
                        borderRadius: '8px',
                        backgroundColor: 'background.paper',
                        boxShadow: 2,
                    },
                    '& .flatpickr-day.selected': {
                        backgroundColor: 'primary.main',
                        borderColor: 'primary.main',
                    },
                    '& .flatpickr-day:hover': {
                        backgroundColor: 'action.hover',
                    },
                    '& .flatpickr-current-month': {
                        color: 'primary.main',
                        fontWeight: 700,
                    },
                }}
            >
                <Grid container spacing={3} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Qruplaşdırma</Typography>
                        <Select
                            value={groupByOptions.find(o => o.value === params.group_by) || null}
                            onChange={(e) => setParams({ ...params, group_by: e?.value || 'department' })}
                            options={groupByOptions}
                            styles={getSelectStyles(theme.palette.primary.main)}
                            menuPortalTarget={document.body}
                            isSearchable={false}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2.5 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Başlanğıc Tarix</Typography>
                        <Flatpickr
                            ref={startDateRef}
                            value={params.start_date ? new Date(params.start_date) : null}
                            onChange={(dates) => setParams({ ...params, start_date: dates[0]?.toISOString().split('T')[0] || '' })}
                            options={{
                                mode: 'single',
                                dateFormat: 'Y-m-d',
                            }}
                            placeholder="Tarix seçin"
                            className="w-full"
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
                    <Grid size={{ xs: 12, md: 2.5 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Son Tarix</Typography>
                        <Flatpickr
                            ref={endDateRef}
                            value={params.end_date ? new Date(params.end_date) : null}
                            onChange={(dates) => setParams({ ...params, end_date: dates[0]?.toISOString().split('T')[0] || '' })}
                            options={{
                                mode: 'single',
                                dateFormat: 'Y-m-d',
                            }}
                            placeholder="Tarix seçin"
                            className="w-full"
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
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {['Həftə', 'Ay', 'İl'].map((label, idx) => (
                                <Button
                                    key={label}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handlePreset(['week', 'month', 'year'][idx] as any)}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        px: 2,
                                        borderWidth: 2,
                                        '&:hover': { borderWidth: 2 }
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                            <Button
                                size="small"
                                variant="text"
                                color="error"
                                onClick={clearFilters}
                                sx={{ fontWeight: 800, ml: 1 }}
                            >
                                TƏMİZLƏ
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Statistics Content */}
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper
                            className="animate-slide-up glass-card"
                            sx={{ borderRadius: 4, overflow: 'hidden' }}
                        >
                            <TableContainer>
                                <Table size="medium">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="military-table-header">{getGroupLabel(params.group_by || 'department')}</TableCell>
                                            <TableCell className="military-table-header" align="right">SAYI</TableCell>
                                            <TableCell className="military-table-header" sx={{ width: '40%' }}>NİSBƏT (%)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData?.items.map((item) => {
                                            const percentage = reportData.total > 0 ? (item.count / reportData.total) * 100 : 0;
                                            return (
                                                <TableRow key={item.id || item.name} hover sx={{ '& td': { py: 2.5, fontWeight: 600 } }}>
                                                    <TableCell sx={{ color: 'primary.main', fontWeight: 800 }}>{item.name}</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '1.1rem' }}>{item.count}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={percentage}
                                                                sx={{
                                                                    flexGrow: 1,
                                                                    height: 10,
                                                                    borderRadius: 5,
                                                                    bgcolor: 'action.hover',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: 'primary.main',
                                                                        borderRadius: 5
                                                                    }
                                                                }}
                                                            />
                                                            <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 40 }}>{Math.round(percentage)}%</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {(!reportData?.items || reportData.items.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                                                    <Typography color="text.secondary">Məlumat tapılmadı</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            className="animate-slide-up glass-card"
                            sx={{
                                p: 6,
                                textAlign: 'center',
                                borderRadius: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                bgcolor: 'action.hover'
                            }}
                        >
                            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '2px' }}>
                                ÜMUMİ MÜRACİƏT SAYI
                            </Typography>
                            <Typography variant="h1" sx={{ fontWeight: 900, color: 'primary.main', my: 2 }}>
                                {reportData?.total || 0}
                            </Typography>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    HESABAT DÖVRÜ
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                                    {params.start_date || 'ƏVVƏLDƏN'} — {params.end_date || 'BUGÜNƏDƏK'}
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 4, borderWidth: 2, fontWeight: 800, '&:hover': { borderWidth: 2 } }}
                                onClick={() => window.print()}
                            >
                                ÇAP ET / PDF YÜKLƏ
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Layout>
    );
}
