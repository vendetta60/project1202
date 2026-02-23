import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    LockReset as LockResetIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getUsers, resetUserPassword } from '../../api/users';
import { getCurrentUser } from '../../api/auth';
import { useToast } from '../../components/Toast';

interface PasswordResetDialogProps {
    open: boolean;
    onClose: () => void;
    userId: number;
    username: string;
}

function PasswordResetDialog({ open, onClose, userId, username }: PasswordResetDialogProps) {
    const [password, setPassword] = useState('');
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => resetUserPassword(userId, password),
        onSuccess: () => {
            showToast('Parol müvəffəqiyyətlə sıfırlandı', 'success');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onClose();
        },
        onError: (error: any) => {
            showToast(error.response?.data?.detail || 'Parolu sıfırlayarkən xəta baş verdi', 'error');
        }
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 800 }}>Parolu Sıfırla</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    <strong>{username}</strong> istifadəçisi üçün yeni parolu daxil edin:
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Yeni Parol"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 700 }}>Ləğv et</Button>
                <Button
                    onClick={() => mutation.mutate()}
                    variant="contained"
                    disabled={!password || mutation.isPending}
                    sx={{ bgcolor: '#4a5d23', '&:hover': { bgcolor: '#3a4a1b' }, fontWeight: 700 }}
                >
                    {mutation.isPending ? 'Sıfırlanır...' : 'Sıfırla'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function UsersList() {
    const navigate = useNavigate();
    const { ToastComponent, showToast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number, username: string } | null>(null);

    // Fetch current user for permissions
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
    });

    // Fetch users
    const { data: usersData, isLoading: usersLoading, isError, error } = useQuery({
        queryKey: ['users', searchQuery, page, rowsPerPage],
        queryFn: () =>
            getUsers({
                q: searchQuery || undefined,
                limit: rowsPerPage,
                offset: page * rowsPerPage,
            }),
    });

    const canResetPassword = currentUser?.is_admin; // Simplified for now, or use complex logic if needed

    const handleOpenResetDialog = (id: number, username: string) => {
        setSelectedUser({ id, username });
        setResetDialogOpen(true);
    };

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

    if (isError) {
        return (
            <Layout>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                        Xəta baş verdi
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {error instanceof Error ? error.message : 'İstifadəçiləri yükləməkdə xəta baş verdi. Lütfən admin sələhiyyətlərə sahib olduğunuzdan əmin olun.'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{ bgcolor: '#4a5d23' }}
                    >
                        Yenidən yüklə
                    </Button>
                </Box>
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
                                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>İdarə</TableCell>
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
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                            {canResetPassword && (
                                                <Tooltip title="Parolu sıfırla">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenResetDialog(user.id, user.username || '')}
                                                        sx={{
                                                            color: '#e67e22',
                                                            '&:hover': { bgcolor: 'rgba(230, 126, 34, 0.1)' }
                                                        }}
                                                    >
                                                        <LockResetIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
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
                                        </Box>
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

            {selectedUser && (
                <PasswordResetDialog
                    open={resetDialogOpen}
                    onClose={() => {
                        setResetDialogOpen(false);
                        setSelectedUser(null);
                    }}
                    userId={selectedUser.id}
                    username={selectedUser.username}
                />
            )}

            <ToastComponent />
        </Layout>
    );
}
