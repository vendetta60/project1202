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
            <Box sx={{ mb: 4 }} className="animate-fade-in">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h4" component="h1" fontWeight="900" color="primary">
                        İstifadəçi İdarəetməsi
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                    Sistemdəki istifadəçiləri idarə edin
                </Typography>
            </Box>

            <Paper
                className="animate-fade-in glass-card"
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="İstifadəçi axtar..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        size="small"
                        sx={{
                            flexGrow: 1,
                            maxWidth: 400,
                            bgcolor: 'white',
                            borderRadius: 1.5,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(74, 93, 35, 0.2)' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(74, 93, 35, 0.4)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: '#4a5d23' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/admin/users/new')}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 700,
                            bgcolor: '#4a5d23',
                            '&:hover': { bgcolor: '#3a4a1b' },
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Yeni İstifadəçi
                    </Button>
                </Box>
            </Paper>

            <Paper
                className="animate-slide-up glass-card"
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <TableContainer sx={{ bgcolor: 'white' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#3e4a21' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>İstifadəçi adı</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Soyad</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Ad</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Department</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Status</TableCell>
                                <TableCell align="right" sx={{ color: 'white', fontWeight: 700, py: 2 }}>Əməliyyatlar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usersData?.items.map((user) => (
                                <TableRow
                                    key={user.id}
                                    hover
                                    sx={{
                                        '&:hover': { bgcolor: 'rgba(62, 74, 33, 0.04)' },
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <TableCell sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#2c3e50' }}>
                                        {user.username}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem', color: '#444' }}>{user.surname || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem', color: '#444' }}>{user.name || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#4a5d23' }}>
                                        {user.section_name || user.section_id || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.is_admin ? 'ADMIN' : 'USER'}
                                            size="small"
                                            sx={{
                                                bgcolor: user.is_admin ? '#4a5d23' : 'rgba(0,0,0,0.08)',
                                                color: user.is_admin ? 'white' : '#666',
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                borderRadius: 1,
                                                height: 24,
                                                border: user.is_admin ? 'none' : '1px solid rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Redaktə et">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                                sx={{
                                                    color: '#4a5d23',
                                                    '&:hover': { bgcolor: 'rgba(74, 93, 35, 0.1)' }
                                                }}
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
                                        <Typography color="text.secondary" sx={{ py: 4, fontWeight: 500 }}>
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
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
                    sx={{
                        bgcolor: 'white',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontWeight: 600,
                            color: '#555',
                        }
                    }}
                />
            </Paper>
            <ToastComponent />
        </Layout>
    );
}
