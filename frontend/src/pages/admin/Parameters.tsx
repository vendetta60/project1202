import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    getMilitaryUnits,
    createMilitaryUnit,
    updateMilitaryUnit,
    deleteMilitaryUnit,
} from '../../api/militaryUnits';
import {
    getAppealTypes,
    createAppealType,
    updateAppealType,
    deleteAppealType,
} from '../../api/appealTypes';
import type { MilitaryUnit } from '../../api/militaryUnits';
import type { AppealType } from '../../api/appealTypes';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// ─── Generic CRUD Table ────────────────────────────────────────────────
interface CrudTableProps<T extends { id: number; name: string }> {
    title: string;
    queryKey: string;
    items: T[] | undefined;
    isLoading: boolean;
    onAdd: (name: string) => Promise<void>;
    onUpdate: (id: number, name: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

function CrudTable<T extends { id: number; name: string }>({
    title,
    items,
    isLoading,
    onAdd,
    onUpdate,
    onDelete,
}: CrudTableProps<T>) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<T | null>(null);
    const [deleteItem, setDeleteItem] = useState<T | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleOpenAdd = () => {
        setEditItem(null);
        setName('');
        setError('');
        setDialogOpen(true);
    };

    const handleOpenEdit = (item: T) => {
        setEditItem(item);
        setName(item.name);
        setError('');
        setDialogOpen(true);
    };

    const handleOpenDelete = (item: T) => {
        setDeleteItem(item);
        setDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Ad boş ola bilməz');
            return;
        }
        setSaving(true);
        try {
            if (editItem) {
                await onUpdate(editItem.id, name.trim());
            } else {
                await onAdd(name.trim());
            }
            setDialogOpen(false);
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail || 'Xəta baş verdi';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteItem) return;
        try {
            await onDelete(deleteItem.id);
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        } catch {
            // silent
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="#374151">
                    {title} ({items?.length || 0})
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                    sx={{
                        bgcolor: '#1976d2',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#1565c0' },
                    }}
                >
                    Əlavə et
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer sx={{ bgcolor: 'white' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#374151', width: 60 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Ad</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', width: 120 }}>
                                    Əməliyyatlar
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items?.map((item, idx) => (
                                <TableRow
                                    key={item.id}
                                    hover
                                    sx={{ borderBottom: '1px solid #e5e7eb', '&:hover': { bgcolor: '#f9fafb' } }}
                                >
                                    <TableCell sx={{ color: '#6b7280' }}>{idx + 1}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Redaktə et">
                                            <IconButton size="small" onClick={() => handleOpenEdit(item)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Sil">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleOpenDelete(item)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!items || items.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography color="text.secondary" sx={{ py: 3 }}>
                                            Məlumat yoxdur
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Redaktə et' : 'Yeni əlavə et'}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Ad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Ləğv et</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {editItem ? 'Yenilə' : 'Əlavə et'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Silmek istədiyinizdən əminsiniz?</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>{deleteItem?.name}</strong> silinəcək. Bu əməliyyat geri qaytarıla bilməz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Ləğv et</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete}>
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

// ─── Main Parameters Page ──────────────────────────────────────────────
export default function Parameters() {
    const [tab, setTab] = useState(0);
    const queryClient = useQueryClient();

    // Military Units
    const { data: militaryUnits, isLoading: muLoading } = useQuery({
        queryKey: ['militaryUnits'],
        queryFn: getMilitaryUnits,
    });

    // Appeal Types
    const { data: appealTypes, isLoading: atLoading } = useQuery({
        queryKey: ['appealTypes'],
        queryFn: getAppealTypes,
    });

    const handleAddMU = async (name: string) => {
        await createMilitaryUnit({ name });
        queryClient.invalidateQueries({ queryKey: ['militaryUnits'] });
    };
    const handleUpdateMU = async (id: number, name: string) => {
        await updateMilitaryUnit(id, { name });
        queryClient.invalidateQueries({ queryKey: ['militaryUnits'] });
    };
    const handleDeleteMU = async (id: number) => {
        await deleteMilitaryUnit(id);
        queryClient.invalidateQueries({ queryKey: ['militaryUnits'] });
    };

    const handleAddAT = async (name: string) => {
        await createAppealType({ name });
        queryClient.invalidateQueries({ queryKey: ['appealTypes'] });
    };
    const handleUpdateAT = async (id: number, name: string) => {
        await updateAppealType(id, { name });
        queryClient.invalidateQueries({ queryKey: ['appealTypes'] });
    };
    const handleDeleteAT = async (id: number) => {
        await deleteAppealType(id);
        queryClient.invalidateQueries({ queryKey: ['appealTypes'] });
    };

    return (
        <Layout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#1f2937' }}>
                    Parametrlər
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Sistemdəki parametrləri idarə edin (hərbi hissələr, müraciət növləri və s.)
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', bgcolor: 'white' }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        borderBottom: '1px solid #e5e7eb',
                        px: 2,
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                    }}
                >
                    <Tab label="Hərbi Hissələr" />
                    <Tab label="Müraciət Növləri" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tab} index={0}>
                        <CrudTable<MilitaryUnit>
                            title="Hərbi Hissələr"
                            queryKey="militaryUnits"
                            items={militaryUnits}
                            isLoading={muLoading}
                            onAdd={handleAddMU}
                            onUpdate={handleUpdateMU}
                            onDelete={handleDeleteMU}
                        />
                    </TabPanel>

                    <TabPanel value={tab} index={1}>
                        <CrudTable<AppealType>
                            title="Müraciət Növləri"
                            queryKey="appealTypes"
                            items={appealTypes}
                            isLoading={atLoading}
                            onAdd={handleAddAT}
                            onUpdate={handleUpdateAT}
                            onDelete={handleDeleteAT}
                        />
                    </TabPanel>
                </Box>
            </Paper>
        </Layout>
    );
}
