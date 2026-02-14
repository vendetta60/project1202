import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    TablePagination,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getUsers } from '../../api/users';
import { useToast } from '../../components/Toast';

export default function UsersList() {
    const navigate = useNavigate();
    const { ToastComponent } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch users
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users', searchQuery, page, rowsPerPage],
        queryFn: () =>
            getUsers({
                q: searchQuery || undefined,
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

    if (usersLoading) {
        return (
            <Layout>
                <LoadingSpinner />
            </Layout>
        );
    }

    return (
        <Layout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#1f2937' }}>
                    İstifadəçi İdarəetməsi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Sistemdəki istifadəçiləri idarə edin
                </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="İstifadəçi axtar..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(0);
                    }}
                    size="small"
                    sx={{ flexGrow: 1, maxWidth: 400, bgcolor: 'white' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/users/new')}
                    sx={{
                        bgcolor: '#1976d2',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: '#1565c0',
                        },
                    }}
                >
                    Yeni İstifadəçi
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer sx={{ bgcolor: 'white' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İstifadəçi adı</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Soyad</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Ad</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Section ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Admin</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Əməliyyatlar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usersData?.items.map((user) => (
                                <TableRow
                                    key={user.id}
                                    hover
                                    sx={{
                                        '&:hover': {
                                            bgcolor: '#f9fafb',
                                        },
                                        borderBottom: '1px solid #e5e7eb',
                                    }}
                                >
                                    <TableCell sx={{ fontSize: '0.875rem' }}>
                                        <Typography fontWeight="500">{user.username}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{user.surname || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{user.name || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{user.section_id || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.is_admin ? 'Admin' : 'User'}
                                            color={user.is_admin ? 'primary' : 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Redaktə et">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {usersData?.items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary" sx={{ py: 3 }}>
                                            İstifadəçi tapılmadı
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={usersData?.total || 0}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Səhifədə sətir:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    sx={{
                        bgcolor: '#f9fafb',
                        borderTop: '1px solid #e5e7eb',
                    }}
                />
            </Paper>
            <ToastComponent />
        </Layout>
    );
}
