import { useState, useCallback, useEffect, useMemo } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import Select from 'react-select';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Azerbaijan } from 'flatpickr/dist/l10n/az';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import { getAppealReport, ReportParams, exportForma4, exportAppealStats } from '../api/reports';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSelectStyles } from '../utils/formStyles';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

const groupByOptions = [
    { value: 'department', label: 'İdarə üzrə' },
    { value: 'region', label: 'Region üzrə' },
    { value: 'status', label: 'Müraciətin baxılması vəziyyətinə görə' },
    { value: 'index', label: 'Müraciətin indeksi üzrə' },
    { value: 'account_index', label: 'Hesabat indeksi üzrə' },
    { value: 'exec_direction', label: 'İcra struktur bölmə üzrə' },
    { value: 'content_type', label: 'Müraciətin növü üzrə' },
    { value: 'insection', label: 'Hərbi hissə üzrə' },
];

export default function Reports() {
    const theme = useTheme();
    const [params, setParams] = useState<ReportParams>({
        group_by: 'department',
        start_date: '',
        end_date: '',
    });
    const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
    const [printAfterOpen, setPrintAfterOpen] = useState(false);

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
            case 'status': return 'Müraciətin baxılması vəziyyəti';
            case 'index': return 'Müraciətin indeksi';
            case 'account_index': return 'Hesabat indeksi';
            case 'exec_direction': return 'İcra struktur bölmə';
            case 'content_type': return 'Müraciətin növü';
            case 'insection': return 'Hərbi hissə (Bölmə)';
            default: return 'Kateqoriya';
        }
    };

    const groupLabel = getGroupLabel(params.group_by || 'department');
    const periodStr = `${params.start_date ? formatDateToDDMMYYYY(params.start_date) : 'ƏVVƏLDƏN'} — ${params.end_date ? formatDateToDDMMYYYY(params.end_date) : 'BUGÜNƏDƏK'}`;
    const total = reportData?.total ?? 0;
    const printHtml = useMemo(() => {
        const esc = (s: string) => {
            const div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML;
        };
        const rows = (reportData?.items || []).map((item) => {
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
            return `<tr><td>${esc(item.name)}</td><td>${item.count}</td><td>${pct}%</td></tr>`;
        }).join('');
        return `
            <div class="report-title">MÜRACİƏTLƏRİN STATİSTİK HESABATI</div>
            <div class="report-meta">Qruplaşdırma: ${esc(groupLabel)} üzrə</div>
            <div class="report-meta">Hesabat dövrü: ${esc(periodStr)}</div>
            <table>
                <thead><tr><th>${esc(groupLabel)}</th><th>Sayı</th><th>Nisbət (%)</th></tr></thead>
                <tbody>${rows}<tr class="total-row"><td>CƏMİ</td><td>${total}</td><td>100.0%</td></tr></tbody>
            </table>
        `;
    }, [reportData, total, groupLabel, periodStr]);

    const handlePrintPreview = useCallback((andPrint: boolean) => {
        setPrintAfterOpen(andPrint);
        setPrintPreviewOpen(true);
    }, []);

    const handlePrint = useCallback(() => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html><html><head>
            <meta charset="utf-8"><title>Hesabat - Çap</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #000; }
                .report-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 8px; }
                .report-meta { font-size: 14px; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                th, td { border: 1px solid #000; padding: 8px 12px; text-align: center; }
                th { font-weight: bold; background: #f5f5f5; }
                .total-row { font-weight: bold; background: #eee; }
            </style></head><body>
            ${printHtml}
            </body></html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 250);
    }, [printHtml]);

    const handleClosePrintPreview = useCallback(() => {
        setPrintPreviewOpen(false);
        setPrintAfterOpen(false);
    }, []);

    useEffect(() => {
        if (printPreviewOpen && printAfterOpen) {
            const t = setTimeout(() => {
                handlePrint();
                setPrintAfterOpen(false);
            }, 400);
            return () => clearTimeout(t);
        }
    }, [printPreviewOpen, printAfterOpen, handlePrint]);

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

            {/* Print Header */}
            <Box className="print-only" sx={{ mb: 4, textAlign: 'center', borderBottom: '2px solid #000', pb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                    MÜRACİƏTLƏRİN STATİSTİK HESABATI
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {getGroupLabel(params.group_by || 'department')} ÜZRƏ BÖLGÜ
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Hesabat dövrü:{' '}
                    {params.start_date ? formatDateToDDMMYYYY(params.start_date) : 'ƏVVƏLDƏN'} —{' '}
                    {params.end_date ? formatDateToDDMMYYYY(params.end_date) : 'BUGÜNƏDƏK'}
                </Typography>
            </Box>

            <Paper
                className="animate-fade-in glass-card no-print"
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
                            value={params.start_date ? [new Date(params.start_date)] : []}
                            onChange={(dates) => setParams({ ...params, start_date: dates[0]?.toISOString().split('T')[0] || '' })}
                            options={{
                                mode: 'single',
                                dateFormat: 'd.m.Y',
                                locale: {
                                    ...Azerbaijan,
                                    firstDayOfWeek: 1
                                }
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
                            value={params.end_date ? [new Date(params.end_date)] : []}
                            onChange={(dates) => setParams({ ...params, end_date: dates[0]?.toISOString().split('T')[0] || '' })}
                            options={{
                                mode: 'single',
                                dateFormat: 'd.m.Y',
                                locale: {
                                    ...Azerbaijan,
                                    firstDayOfWeek: 1
                                }
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

                    <Grid size={{ xs: 12, md: 4 }} className="no-print">
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
                                startIcon={<VisibilityIcon />}
                                sx={{ mt: 4, borderWidth: 2, fontWeight: 800, '&:hover': { borderWidth: 2 } }}
                                onClick={() => handlePrintPreview(false)}
                            >
                                ÇAP ÖNCƏSİ BAXIŞ
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<PrintIcon />}
                                sx={{ mt: 1, borderWidth: 2, fontWeight: 800, '&:hover': { borderWidth: 2 } }}
                                onClick={() => handlePrintPreview(true)}
                            >
                                ÇAP ET
                            </Button>

                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={() => exportAppealStats('excel', params)}
                                    sx={{ fontWeight: 700, flex: 1, minWidth: 80 }}
                                >
                                    EXCEL
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{ fontWeight: 700, flex: 1, minWidth: 80, bgcolor: '#2b579a', '&:hover': { bgcolor: '#1e3e6d' } }}
                                    startIcon={<DescriptionIcon />}
                                    onClick={() => exportAppealStats('word', params)}
                                >
                                    WORD
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    fullWidth
                                    onClick={() => exportAppealStats('pdf', params)}
                                    sx={{ fontWeight: 700, flex: 1, minWidth: 80 }}
                                >
                                    PDF
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Çap öncəsi baxış — Word-də olduğu kimi */}
            <Dialog
                open={printPreviewOpen}
                onClose={handleClosePrintPreview}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
                    Çap öncəsi baxış
                </DialogTitle>
                <DialogContent>
                    <Box
                        className="report-print-preview"
                        sx={{
                            fontFamily: "'Segoe UI', Arial, sans-serif",
                            color: '#000',
                            '& .report-title': { fontSize: 18, fontWeight: 700, textAlign: 'center', mb: 1 },
                            '& .report-meta': { fontSize: 14, mb: 1 },
                            '& table': { width: '100%', borderCollapse: 'collapse', mt: 2 },
                            '& th, & td': { border: '1px solid #000', p: 1.5, textAlign: 'center' },
                            '& th': { fontWeight: 700, bgcolor: '#f5f5f5' },
                            '& .total-row': { fontWeight: 700, bgcolor: '#eee' },
                        }}
                        dangerouslySetInnerHTML={{ __html: printHtml }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClosePrintPreview} sx={{ fontWeight: 700 }}>
                        Bağla
                    </Button>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
                        Çap ET
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Forma No. 4 Section */}
            <Paper
                className="animate-slide-up glass-card no-print"
                sx={{
                    p: 4,
                    mt: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.7)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <FileDownloadIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="800" color="primary">
                        4 nömrəli Forma (Müraciətlər Jurnalı)
                    </Typography>
                </Box>

                <Grid container spacing={3} alignItems="flex-end">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Başlanğıc Tarix</Typography>
                        <Flatpickr
                            value={params.start_date ? [new Date(params.start_date)] : []}
                            onChange={(dates) => setParams({ ...params, start_date: dates[0]?.toISOString().split('T')[0] || '' })}
                            options={{
                                mode: 'single',
                                dateFormat: 'd.m.Y',
                                locale: { ...Azerbaijan, firstDayOfWeek: 1 },
                            }}
                            className="w-full"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.23)', backgroundColor: 'white' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Son Tarix</Typography>
                        <Flatpickr
                            value={params.end_date ? [new Date(params.end_date)] : []}
                            onChange={(dates) => setParams({ ...params, end_date: dates[0]?.toISOString().split('T')[0] || '' })}
                            options={{
                                mode: 'single',
                                dateFormat: 'd.m.Y',
                                locale: { ...Azerbaijan, firstDayOfWeek: 1 },
                            }}
                            className="w-full"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.23)', backgroundColor: 'white' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<TableChartIcon />}
                                onClick={() => exportForma4('excel', params)}
                                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                            >
                                EXCEL
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<DescriptionIcon />}
                                onClick={() => exportForma4('word', params)}
                                sx={{ borderRadius: 2, fontWeight: 700, px: 3, bgcolor: '#2b579a', '&:hover': { bgcolor: '#1e3e6d' } }}
                            >
                                WORD
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() => exportForma4('pdf', params)}
                                sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                            >
                                PDF
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
