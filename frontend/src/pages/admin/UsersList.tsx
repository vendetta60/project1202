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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    Search as SearchIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog, { useConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { getUsers, toggleUserActive, assignUserRoles } from '../../api/users';
import { getRoles } from '../../api/roles';
import type { User } from '../../api/users';
import type { Role } from '../../api/roles';

export default function UsersList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast, ToastComponent } = useToast();
    const { dialogState, showConfirm, hideConfirm, handleConfirm } = useConfirmDialog();

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

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

    // Fetch roles for assignment dialog
    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles,
    });

    // Toggle user active mutation
    const toggleActiveMutation = useMutation({
        mutationFn: toggleUserActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showToast('İstifadəçi statusu dəyişdirildi', 'success');
        },
        onError: () => {
            showToast('Xəta baş verdi', 'error');
        },
    });

    // Assign roles mutation
    const assignRolesMutation = useMutation({
        mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
            assignUserRoles(userId, roleIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setRoleDialogOpen(false);
            setSelectedUser(null);
            showToast('Rollar təyin edildi', 'success');
        },
        onError: () => {
            showToast('Xəta baş verdi', 'error');
        },
    });

    const handleToggleActive = (user: User) => {
        showConfirm(
            user.is_active ? 'İstifadəçini deaktiv et?' : 'İstifadəçini aktiv et?',
            `${user.username} istifadəçisini ${user.is_active ? 'deaktiv' : 'aktiv'} etmək istədiyinizdən əminsiniz?`,
            () => toggleActiveMutation.mutate(user.id),
            'warning'
        );
    };

    const handleOpenRoleDialog = (user: User) => {
        setSelectedUser(user);
        setSelectedRoleIds(user.roles.map((r) => r.id));
        setRoleDialogOpen(true);
    };

    const handleAssignRoles = () => {
        if (selectedUser) {
            assignRolesMutation.mutate({
                userId: selectedUser.id,
                roleIds: selectedRoleIds,
            });
        }
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
                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tam ad</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Rollar</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İdarə</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
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
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{user.full_name || '-'}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {user.roles.length > 0 ? (
                                                user.roles.map((role) => (
                                                    <Chip
                                                        key={role.id}
                                                        label={role.name}
                                                        size="small"
                                                        color={role.is_system ? 'primary' : 'default'}
                                                        variant="outlined"
                                                    />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Rol yoxdur
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{user.org_unit?.name || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.is_active ? 'Aktiv' : 'Deaktiv'}
                                            color={user.is_active ? 'success' : 'default'}
                                            size="small"
                                            variant="filled"
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
                                        <Tooltip title="Rolları təyin et">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenRoleDialog(user)}
                                            >
                                                <PersonAddIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={user.is_active ? 'Deaktiv et' : 'Aktiv et'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleActive(user)}
                                                color={user.is_active ? 'error' : 'success'}
                                            >
                                                {user.is_active ? (
                                                    <LockIcon fontSize="small" />
                                                ) : (
                                                    <LockOpenIcon fontSize="small" />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {usersData?.items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
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

            {/* Role Assignment Dialog */}
            <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Rolları təyin et - {selectedUser?.username}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Rollar</InputLabel>
                        <Select
                            multiple
                            value={selectedRoleIds}
                            onChange={(e) => setSelectedRoleIds(e.target.value as number[])}
                            input={<OutlinedInput label="Rollar" />}
                            renderValue={(selected) =>
                                roles
                                    ?.filter((r) => selected.includes(r.id))
                                    .map((r) => r.name)
                                    .join(', ')
                            }
                        >
                            {roles?.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    <Checkbox checked={selectedRoleIds.includes(role.id)} />
                                    <ListItemText
                                        primary={role.name}
                                        secondary={role.description}
                                    />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleDialogOpen(false)}>Ləğv et</Button>
                    <Button
                        onClick={handleAssignRoles}
                        variant="contained"
                        disabled={assignRolesMutation.isPending}
                    >
                        Təyin et
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={dialogState.open}
                title={dialogState.title}
                message={dialogState.message}
                onConfirm={handleConfirm}
                onCancel={hideConfirm}
                severity={dialogState.severity}
            />

            <ToastComponent />
        </Layout>
    );
}
