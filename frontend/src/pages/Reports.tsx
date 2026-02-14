import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getAppealReport, ReportParams } from '../api/reports';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Reports() {
    const [params, setParams] = useState<ReportParams>({
        group_by: 'department',
        start_date: '',
        end_date: '',
    });

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

            {/* Filters Section */}
            <Paper
                className="animate-fade-in glass-card"
                sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
            >
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Qruplaşdırma</InputLabel>
                            <Select
                                value={params.group_by}
                                label="Qruplaşdırma"
                                onChange={(e) => setParams({ ...params, group_by: e.target.value })}
                                sx={{ bgcolor: 'white', borderRadius: 2 }}
                            >
                                <MenuItem value="department">İdarə üzrə</MenuItem>
                                <MenuItem value="region">Region üzrə</MenuItem>
                                <MenuItem value="status">Status üzrə</MenuItem>
                                <MenuItem value="index">İndeks üzrə</MenuItem>
                                <MenuItem value="insection">Hərbi hissə üzrə</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2.5 }}>
                        <TextField
                            label="Başlanğıc Tarix"
                            type="date"
                            fullWidth
                            size="small"
                            value={params.start_date}
                            onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2.5 }}>
                        <TextField
                            label="Son Tarix"
                            type="date"
                            fullWidth
                            size="small"
                            value={params.end_date}
                            onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
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
                                                    <TableCell sx={{ color: '#3e4a21', fontWeight: 800 }}>{item.name}</TableCell>
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
                                                                    bgcolor: 'rgba(62, 74, 33, 0.1)',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        background: 'linear-gradient(90deg, #3e4a21 0%, #a68b44 100%)',
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
                                background: 'linear-gradient(135deg, rgba(62, 74, 33, 0.05) 0%, rgba(44, 62, 80, 0.05) 100%) !important'
                            }}
                        >
                            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '2px' }}>
                                ÜMUMİ MÜRACİƏT SAYI
                            </Typography>
                            <Typography variant="h1" sx={{ fontWeight: 900, color: '#3e4a21', my: 2 }}>
                                {reportData?.total || 0}
                            </Typography>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(62, 74, 33, 0.08)', borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#3e4a21' }}>
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
