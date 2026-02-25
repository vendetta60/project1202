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
    Block as BlockIcon,
    CheckCircle as UnblockIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getUsers, resetUserPassword, toggleBlockUser, deleteUser } from '../../api/users';
import { useToast } from '../../components/Toast';
import { usePermissions } from '../../hooks/usePermissions';

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
    const { ToastComponent } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number, username: string, is_blocked?: boolean } | null>(null);

    const { isAdmin, isSuperAdmin, canCreateUser, canEditUser, canDeleteUser, canBlockUser, canResetPassword: canResetPw, rank: currentRank } = usePermissions();
    void isAdmin;
    void isSuperAdmin;
    const canResetPassword = canResetPw;
    const queryClient = useQueryClient();
    const { showToast } = useToast();

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

    const handleOpenResetDialog = (id: number, username: string) => {
        setSelectedUser({ id, username });
        setResetDialogOpen(true);
    };

    const handleOpenBlockDialog = (id: number, username: string, is_blocked: boolean) => {
        setSelectedUser({ id, username, is_blocked });
        setBlockDialogOpen(true);
    };

    const handleOpenDeleteDialog = (id: number, username: string) => {
        setSelectedUser({ id, username });
        setDeleteDialogOpen(true);
    };

    const blockMutation = useMutation({
        mutationFn: (userId: number) => toggleBlockUser(userId),
        onSuccess: () => {
            showToast(selectedUser?.is_blocked ? 'İstifadəçi blokdan çıxarıldı' : 'İstifadəçi bloklandı', 'success');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setBlockDialogOpen(false);
            setSelectedUser(null);
        },
        onError: (error: any) => {
            showToast(error.response?.data?.detail || 'Xəta baş verdi', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: number) => deleteUser(userId),
        onSuccess: () => {
            showToast('İstifadəçi silindi', 'success');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeleteDialogOpen(false);
            setSelectedUser(null);
        },
        onError: (error: any) => {
            showToast(error.response?.data?.detail || 'İstifadəçini silərkən xəta baş verdi', 'error');
        }
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
                    {canCreateUser && (
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
                    )}
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
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Chip
                                                label={user.is_super_admin ? 'SUPER ADMIN' : user.is_admin ? 'ADMIN' : 'USER'}
                                                size="small"
                                                sx={{
                                                    bgcolor: user.is_super_admin ? '#8e44ad' : user.is_admin ? '#4a5d23' : 'rgba(0,0,0,0.08)',
                                                    color: (user.is_super_admin || user.is_admin) ? 'white' : '#666',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    borderRadius: 1,
                                                    height: 24,
                                                    border: (user.is_super_admin || user.is_admin) ? 'none' : '1px solid rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            {user.is_blocked && (
                                                <Chip
                                                    label="BLOKED"
                                                    size="small"
                                                    color="error"
                                                    sx={{
                                                        ml: 1,
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        borderRadius: 1,
                                                        height: 24,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                            {canResetPassword && (currentRank >= (user.rank || 1) || isSuperAdmin) && (
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
                                            {canEditUser && (currentRank >= (user.rank || 1) || isSuperAdmin) && (
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
                                            )}
                                            {canBlockUser && (currentRank > (user.rank || 1) || isSuperAdmin) && (
                                                <Tooltip title={user.is_blocked ? "Blokdan çıxar" : "Blokla"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenBlockDialog(user.id, user.username || '', !!user.is_blocked)}
                                                        sx={{
                                                            color: user.is_blocked ? '#27ae60' : '#e74c3c',
                                                            '&:hover': { bgcolor: user.is_blocked ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)' }
                                                        }}
                                                    >
                                                        {user.is_blocked ? <UnblockIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {canDeleteUser && (currentRank > (user.rank || 1) || isSuperAdmin) && (
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDeleteDialog(user.id, user.username || '')}
                                                        sx={{
                                                            color: '#c0392b',
                                                            '&:hover': { bgcolor: 'rgba(192, 57, 43, 0.1)' }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
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

            {selectedUser && resetDialogOpen && (
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

            {/* Block Confirmation Dialog */}
            <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {selectedUser?.is_blocked ? 'Blokdan çıxar' : 'Blokla'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        <strong>{selectedUser?.username}</strong> istifadəçisini {selectedUser?.is_blocked ? 'blokdan çıxarmaq' : 'bloklamaq'} istədiyinizə əminsiniz?
                    </Typography>
                    {!selectedUser?.is_blocked && (
                        <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 500 }}>
                            Bloklanmış istifadəçilər sistemə giriş edə bilməyəcək.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setBlockDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>Ləğv et</Button>
                    <Button
                        variant="contained"
                        onClick={() => selectedUser && blockMutation.mutate(selectedUser.id)}
                        disabled={blockMutation.isPending}
                        sx={{
                            bgcolor: selectedUser?.is_blocked ? '#27ae60' : '#e74c3c',
                            '&:hover': { bgcolor: selectedUser?.is_blocked ? '#219150' : '#c0392b' },
                            fontWeight: 700
                        }}
                    >
                        {blockMutation.isPending ? 'Gözləyin...' : (selectedUser?.is_blocked ? 'Blokdan çıxar' : 'Blokla')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: '#c0392b' }}>İstifadəçini Sil</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        <strong>{selectedUser?.username}</strong> istifadəçisini sistemdən tamamilə silmək istədiyinizə əminsiniz?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 700 }}>
                        DİQQƏT: Bu əməliyyat geri qaytarıla bilməz və istifadəçiyə aid bütün məlumatlar silinəcək.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>Ləğv et</Button>
                    <Button
                        variant="contained"
                        onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
                        disabled={deleteMutation.isPending}
                        sx={{ bgcolor: '#c0392b', '&:hover': { bgcolor: '#a63026' }, fontWeight: 700 }}
                    >
                        {deleteMutation.isPending ? 'Silinir...' : 'Bəli, Sil'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastComponent />
        </Layout>
    );
}
