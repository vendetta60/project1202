import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    Button,
    TextField,
    IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../../components/Layout';
import ConfirmDialog, { useConfirmDialog } from '../../components/ConfirmDialog';
import {
    getDepartments,
    getRegions,
    getApStatuses,
    getChiefInstructions,
    getInSections,
    getWhoControls,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createRegion,
    updateRegion,
    deleteRegion,
    createChiefInstruction,
    updateChiefInstruction,
    deleteChiefInstruction,
    createInSection,
    updateInSection,
    deleteInSection,
    createWhoControl,
    updateWhoControl,
    deleteWhoControl,
    createApStatus,
    updateApStatus,
    deleteApStatus,
    getUserSections,
    createUserSection,
    updateUserSection,
    deleteUserSection,
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
} from '../../api/lookups';

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

interface EditableTableProps {
    items: any[] | undefined;
    columns: { id: string; label: string; type?: 'text' | 'number' | 'date' }[];
    onAdd: (data: any) => void;
    onEdit: (id: number, data: any) => void;
    onDelete: (id: number) => void;
    hideDelete?: boolean;
}

function EditableTable({ items, columns, onAdd, onEdit, onDelete, hideDelete }: EditableTableProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState<any>({});

    const handleStartEdit = (item: any) => {
        setEditingId(item.id);
        setEditData({ ...item });
    };

    const handleSaveEdit = () => {
        if (editingId) {
            onEdit(editingId, editData);
            setEditingId(null);
        }
    };

    const handleAdd = () => {
        onAdd(newData);
        setNewData({});
        setIsAdding(false);
    };

    if (!items || items.length === 0) {
        return (
            <Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAdding(true)}
                    sx={{
                        mb: 2,
                        bgcolor: '#4a5d23',
                        '&:hover': { bgcolor: '#3a4a1b' },
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 1.5
                    }}
                >
                    Əlavə Et
                </Button>
                <Typography color="text.secondary" sx={{ py: 2 }}>Məlumat yoxdur</Typography>

                {isAdding && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 2,
                            bgcolor: '#fcfcfc',
                            border: '1px solid rgba(74, 93, 35, 0.1)',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#4a5d23' }}>Yeni Məlumat</Typography>
                        {columns.filter(c => c.id !== 'id').map(col => (
                            <TextField
                                key={col.id}
                                label={col.label}
                                type={col.type || 'text'}
                                value={newData[col.id] || ''}
                                onChange={(e) => setNewData({ ...newData, [col.id]: e.target.value })}
                                fullWidth
                                size="small"
                                InputLabelProps={col.type === 'date' ? { shrink: true } : undefined}
                                sx={{
                                    mb: 2,
                                    bgcolor: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                                }}
                            />
                        ))}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleAdd}
                                sx={{ bgcolor: '#4a5d23', '&:hover': { bgcolor: '#3a4a1b' }, fontWeight: 600, textTransform: 'none' }}
                            >
                                Yadda Saxla
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setIsAdding(false)}
                                sx={{ color: '#666', borderColor: '#ccc', textTransform: 'none' }}
                            >
                                İmtina Et
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>
        );
    }

    return (
        <Box className="animate-fade-in">
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAdding(true)}
                    sx={{
                        bgcolor: '#4a5d23',
                        '&:hover': { bgcolor: '#3a4a1b' },
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 1.5
                    }}
                >
                    Əlavə Et
                </Button>
            </Box>

            {isAdding && (
                <Paper
                    className="animate-slide-up"
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: '#fcfcfc',
                        border: '1px solid rgba(74, 93, 35, 0.1)',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#4a5d23' }}>Yeni Məlumat</Typography>
                    {columns.filter(c => c.id !== 'id').map(col => (
                        <TextField
                            key={col.id}
                            label={col.label}
                            type={col.type || 'text'}
                            value={newData[col.id] || ''}
                            onChange={(e) => setNewData({ ...newData, [col.id]: e.target.value })}
                            fullWidth
                            size="small"
                            InputLabelProps={col.type === 'date' ? { shrink: true } : undefined}
                            sx={{
                                mb: 2,
                                bgcolor: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                            }}
                        />
                    ))}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleAdd}
                            sx={{ bgcolor: '#4a5d23', '&:hover': { bgcolor: '#3a4a1b' }, fontWeight: 600, textTransform: 'none' }}
                        >
                            Yadda Saxla
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setIsAdding(false)}
                            sx={{ color: '#666', borderColor: '#ccc', textTransform: 'none' }}
                        >
                            İmtina Et
                        </Button>
                    </Box>
                </Paper>
            )}

            <TableContainer sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#3e4a21' }}>
                            {columns.map(col => (
                                <TableCell key={col.id} sx={{ fontWeight: 700, color: 'white', py: 1.5 }}>{col.label}</TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 700, color: 'white', py: 1.5 }}>Əməliyyatlar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: 'rgba(74, 93, 35, 0.04)' } }}>
                                {editingId === item.id ? (
                                    <>
                                        {columns.filter(c => c.id !== 'id').map(col => (
                                            <TableCell key={col.id}>
                                                <TextField
                                                    type={col.type || 'text'}
                                                    value={col.type === 'date' && editData[col.id] ? editData[col.id].substring(0, 10) : (editData[col.id] || '')}
                                                    onChange={(e) => setEditData({ ...editData, [col.id]: e.target.value })}
                                                    size="small"
                                                    fullWidth
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
                                                    }}
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={handleSaveEdit}
                                                sx={{ bgcolor: '#4a5d23', mr: 1, '&:hover': { bgcolor: '#3a4a1b' } }}
                                            >
                                                Yadda Saxla
                                            </Button>
                                            <Button size="small" variant="outlined" onClick={() => setEditingId(null)} sx={{ color: '#666', borderColor: '#ccc' }}>
                                                İmtina Et
                                            </Button>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        {columns.map(col => (
                                            <TableCell key={col.id} sx={{ color: '#333' }}>
                                                {col.type === 'date' && item[col.id]
                                                    ? new Date(item[col.id]).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                    : item[col.id]}
                                            </TableCell>
                                        ))}
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleStartEdit(item)}
                                                sx={{ color: '#4a5d23', mr: 1, '&:hover': { bgcolor: 'rgba(74, 93, 35, 0.1)' } }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            {!hideDelete && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(item.id)}
                                                    sx={{ color: '#d32f2f', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default function Parameters() {
    const [tab, setTab] = useState(0);
    const queryClient = useQueryClient();
    const { dialogState, showConfirm, hideConfirm, handleConfirm } = useConfirmDialog();

    const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });
    const { data: regions } = useQuery({ queryKey: ['regions'], queryFn: getRegions });
    const { data: statuses } = useQuery({ queryKey: ['apStatuses'], queryFn: getApStatuses });

    const { data: instructions } = useQuery({ queryKey: ['chiefInstructions'], queryFn: getChiefInstructions });
    const { data: inSections } = useQuery({ queryKey: ['inSections'], queryFn: getInSections });
    const { data: whoControls } = useQuery({ queryKey: ['whoControls'], queryFn: getWhoControls });
    const { data: userSections } = useQuery({ queryKey: ['userSections'], queryFn: getUserSections });
    const { data: holidays } = useQuery({ queryKey: ['holidays'], queryFn: getHolidays });

    // Department mutations
    const createDeptMutation = useMutation({
        mutationFn: createDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
    });

    const updateDeptMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateDepartment(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
    });

    const deleteDeptMutation = useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
    });

    // Region mutations
    const createRegionMutation = useMutation({
        mutationFn: createRegion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
    });

    const updateRegionMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateRegion(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
    });

    const deleteRegionMutation = useMutation({
        mutationFn: deleteRegion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
    });

    // Status mutations
    const createStatusMutation = useMutation({
        mutationFn: createApStatus,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apStatuses'] }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateApStatus(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apStatuses'] }),
    });

    const deleteStatusMutation = useMutation({
        mutationFn: deleteApStatus,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apStatuses'] }),
    });

    // ChiefInstruction mutations
    const createInstructionMutation = useMutation({
        mutationFn: createChiefInstruction,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chiefInstructions'] }),
    });

    const updateInstructionMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateChiefInstruction(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chiefInstructions'] }),
    });

    const deleteInstructionMutation = useMutation({
        mutationFn: deleteChiefInstruction,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chiefInstructions'] }),
    });

    // InSection mutations
    const createInSectionMutation = useMutation({
        mutationFn: createInSection,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inSections'] }),
    });

    const updateInSectionMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateInSection(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inSections'] }),
    });

    const deleteInSectionMutation = useMutation({
        mutationFn: deleteInSection,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inSections'] }),
    });

    // WhoControl mutations
    const createWhoControlMutation = useMutation({
        mutationFn: createWhoControl,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whoControls'] }),
    });

    const updateWhoControlMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateWhoControl(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whoControls'] }),
    });

    const deleteWhoControlMutation = useMutation({
        mutationFn: deleteWhoControl,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whoControls'] }),
    });

    // UserSection mutations
    const createSectionMutation = useMutation({
        mutationFn: createUserSection,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSections'] }),
    });

    const updateSectionMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateUserSection(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSections'] }),
    });

    const deleteSectionMutation = useMutation({
        mutationFn: deleteUserSection,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSections'] }),
        onError: (err: any) => {
            alert(err.response?.data?.detail || 'Bölmə silinə bilmədi');
        }
    });

    // Holiday mutations
    const createHolidayMutation = useMutation({
        mutationFn: createHoliday,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
    });

    const updateHolidayMutation = useMutation({
        mutationFn: ({ id, data }: any) => updateHoliday(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
    });

    const deleteHolidayMutation = useMutation({
        mutationFn: deleteHoliday,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
    });

    return (
        <Layout>
            <Box sx={{ mb: 4 }} className="animate-fade-in">
                <Typography variant="h4" component="h1" gutterBottom fontWeight="900" color="primary">
                    Parametrlər
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                    Sistemdəki soraqçaların siyahısını idarə edin
                </Typography>
            </Box>

            <Paper
                className="animate-slide-up glass-card"
                sx={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            color: '#666',
                            '&.Mui-selected': { color: '#4a5d23' }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#4a5d23',
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        }
                    }}
                >
                    <Tab label="İdarələr" />
                    <Tab label="Regionlar" />
                    <Tab label="Statuslar" />
                    <Tab label="Rəhbər Göstərişləri" />
                    <Tab label="Daxili Şöbələr" />
                    <Tab label="Nəzarətçilər" />
                    <Tab label="Bölmələr" />
                    <Tab label="Bayramlar" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tab} index={0}>
                        <EditableTable
                            items={departments}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'department', label: 'İdarə Adı' }
                            ]}
                            onAdd={(data) => createDeptMutation.mutate(data)}
                            onEdit={(id, data) => updateDeptMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu idarəni silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz.', () => deleteDeptMutation.mutate(id), 'error')}
                            hideDelete
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={1}>
                        <EditableTable
                            items={regions}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'region', label: 'Region Adı' }
                            ]}
                            onAdd={(data) => createRegionMutation.mutate(data)}
                            onEdit={(id, data) => updateRegionMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu regionu silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz.', () => deleteRegionMutation.mutate(id), 'error')}
                            hideDelete
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={2}>
                        <EditableTable
                            items={statuses}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'status', label: 'Status' }
                            ]}
                            onAdd={(data) => createStatusMutation.mutate(data)}
                            onEdit={(id, data) => updateStatusMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu statusu silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz.', () => deleteStatusMutation.mutate(id), 'error')}
                            hideDelete
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={3}>
                        <EditableTable
                            items={instructions}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'instructions', label: 'Göstəriş' }
                            ]}
                            onAdd={(data) => createInstructionMutation.mutate(data)}
                            onEdit={(id, data) => updateInstructionMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu rəhbər göstərişini silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz.', () => deleteInstructionMutation.mutate(id), 'error')}
                            hideDelete
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={4}>
                        <EditableTable
                            items={inSections}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'section', label: 'Şöbə' }
                            ]}
                            onAdd={(data) => createInSectionMutation.mutate(data)}
                            onEdit={(id, data) => updateInSectionMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu daxili şöbəni silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz.', () => deleteInSectionMutation.mutate(id), 'error')}
                            hideDelete
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={5}>
                        <EditableTable
                            items={whoControls}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'chief', label: 'Nəzarətçi' }
                            ]}
                            onAdd={(data) => createWhoControlMutation.mutate(data)}
                            onEdit={(id, data) => updateWhoControlMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu nəzarətçini silmək istədiyinizə əminsinizmi? Bu əməliyyat geri qaytarıla bilməz.', () => deleteWhoControlMutation.mutate(id), 'error')}
                            hideDelete
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={6}>
                        <EditableTable
                            items={userSections}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'user_section', label: 'Bölmə Adı' },
                                { id: 'section_index', label: 'İndeks (Sıra)' }
                            ]}
                            onAdd={(data) => createSectionMutation.mutate(data)}
                            onEdit={(id, data) => updateSectionMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu bölməni silmək istədiyinizə əminsinizmi? Əgər bölməyə aid müraciətlər varsa, silməyə icazə verilməyəcək.', () => deleteSectionMutation.mutate(id), 'error')}
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={7}>
                        <EditableTable
                            items={holidays}
                            columns={[
                                { id: 'id', label: 'ID' },
                                { id: 'name', label: 'Bayram Adı' },
                                { id: 'start_date', label: 'Başlanğıc Tarixi', type: 'date' },
                                { id: 'end_date', label: 'Bitmə Tarixi', type: 'date' }
                            ]}
                            onAdd={(data) => createHolidayMutation.mutate(data)}
                            onEdit={(id, data) => updateHolidayMutation.mutate({ id, data })}
                            onDelete={(id) => showConfirm('Silmək istəyirsiniz?', 'Bu bayramı silmək istədiyinizə əminsinizmi?', () => deleteHolidayMutation.mutate(id), 'error')}
                        />
                    </TabPanel>
                </Box>
            </Paper>
            <ConfirmDialog
                open={dialogState.open}
                title={dialogState.title}
                message={dialogState.message}
                confirmText="Bəli, Sil"
                cancelText="Xeyr, İmtina Et"
                onConfirm={handleConfirm}
                onCancel={hideConfirm}
                severity={dialogState.severity === 'error' ? 'error' : 'warning'}
            />
        </Layout>
    );
}
