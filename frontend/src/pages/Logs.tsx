import { useState } from 'react';
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
    TablePagination,
    Chip,
    useTheme,
} from '@mui/material';
import Select from 'react-select';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getLogs } from '../api/logs';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSelectStyles } from '../utils/formStyles';

const ACTION_COLORS: Record<string, string> = {
    CREATE: '#4caf50',
    UPDATE: '#2196f3',
    DELETE: '#f44336',
    READ: '#9c27b0',
};

const ACTION_LABELS: Record<string, string> = {
    CREATE: 'YARATDI',
    UPDATE: 'YENİLƏDİ',
    DELETE: 'SİLDİ',
    READ: 'OXUDU',
};

const ENTITY_TYPE_OPTIONS = [
    { value: '', label: 'Hamısı' },
    { value: 'Appeal', label: 'Müraciət' },
    { value: 'User', label: 'İstifadəçi' },
    { value: 'Contact', label: 'Əlaqə' },
    { value: 'Department', label: 'İdarə' },
    { value: 'Region', label: 'Region' },
];

const ACTION_OPTIONS = [
    { value: '', label: 'Hamısı' },
    { value: 'CREATE', label: 'Yaratma' },
    { value: 'UPDATE', label: 'Yenilənmə' },
    { value: 'DELETE', label: 'Silmə' },
    { value: 'READ', label: 'Oxuma' },
];

export default function Logs() {
    const theme = useTheme();
    const [filters, setFilters] = useState({
        entity_type: '',
        action: '',
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const { data: logsData, isLoading, refetch } = useQuery({
        queryKey: ['audit-logs', filters, page, rowsPerPage],
        queryFn: () =>
            getLogs({
                entity_type: filters.entity_type || undefined,
                action: filters.action || undefined,
                limit: rowsPerPage,
                offset: page * rowsPerPage,
            }),
    });

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClearFilters = () => {
        setFilters({
            entity_type: '',
            action: '',
        });
        setPage(0);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('az-AZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <Layout>
            <Box sx={{ mb: 4 }} className="animate-fade-in">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" fontWeight="900" color="primary">
                        Audit Logları
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                    Sistemdə edilən bütün əməliyyatların tarixçəsi və izləmə
                </Typography>
            </Box>

            {/* Filters Section */}
            <Paper
                className="animate-fade-in glass-card"
                sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
            >
                <Grid container spacing={3} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Entity Növü</Typography>
                        <Select
                            value={ENTITY_TYPE_OPTIONS.find(o => o.value === filters.entity_type) || null}
                            onChange={(e) => {
                                setFilters({ ...filters, entity_type: e?.value || '' });
                                setPage(0);
                            }}
                            options={ENTITY_TYPE_OPTIONS}
                            styles={getSelectStyles(theme.palette.primary.main)}
                            menuPortalTarget={document.body}
                            isSearchable={false}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Əməliyyat Növü</Typography>
                        <Select
                            value={ACTION_OPTIONS.find(o => o.value === filters.action) || null}
                            onChange={(e) => {
                                setFilters({ ...filters, action: e?.value || '' });
                                setPage(0);
                            }}
                            options={ACTION_OPTIONS}
                            styles={getSelectStyles(theme.palette.primary.main)}
                            menuPortalTarget={document.body}
                            isSearchable={false}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => refetch()}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    borderWidth: 2,
                                    '&:hover': { borderWidth: 2 }
                                }}
                            >
                                YENİLƏ
                            </Button>
                            <Button
                                variant="text"
                                color="error"
                                onClick={handleClearFilters}
                                sx={{ fontWeight: 800, ml: 'auto' }}
                            >
                                FİLTRLƏRİ TƏMİZLƏ
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Logs Table */}
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <Paper
                    className="animate-slide-up glass-card"
                    sx={{ borderRadius: 4, overflow: 'hidden' }}
                >
                    <TableContainer>
                        <Table size="medium">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell className="military-table-header">Tarix/Saat</TableCell>
                                    <TableCell className="military-table-header">Entity</TableCell>
                                    <TableCell className="military-table-header">Entity ID</TableCell>
                                    <TableCell className="military-table-header">Əməliyyat</TableCell>
                                    <TableCell className="military-table-header">İstifadəçi</TableCell>
                                    <TableCell className="military-table-header">Təsvir</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logsData?.items && logsData.items.length > 0 ? (
                                    logsData.items.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                {formatDate(log.created_at)}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                {log.entity_type}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>#{log.entity_id}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={ACTION_LABELS[log.action] || log.action}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: ACTION_COLORS[log.action] || '#999',
                                                        color: 'white',
                                                        fontWeight: 800,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {log.created_by_name || `ID: ${log.created_by}` || '-'}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.85rem' }}>
                                                {log.description || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary" fontWeight={600}>
                                                Məlumat tapılmadı
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        component="div"
                        count={logsData?.total || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Səhifə başına satır:"
                        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
                        sx={{
                            bgcolor: 'action.hover',
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                fontWeight: 700,
                                color: 'primary.main',
                            }
                        }}
                    />
                </Paper>
            )}
        </Layout>
    );
}
