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
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    getDepartments,
    getRegions,
    getApStatuses,
    getApIndexes,
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
    columns: { id: string; label: string }[];
    onAdd: (data: any) => void;
    onEdit: (id: number, data: any) => void;
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

function EditableTable({ items, columns, onAdd, onEdit, onDelete, isLoading }: EditableTableProps) {
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
                    sx={{ mb: 2, bgcolor: '#3e4a21' }}
                >
                    Əlavə Et
                </Button>
                <Typography color="text.secondary" sx={{ py: 2 }}>Məlumat yoxdur</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAdding(true)}
                    sx={{ bgcolor: '#3e4a21' }}
                >
                    Əlavə Et
                </Button>
            </Box>

            {isAdding && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Yeni Məlumat</Typography>
                    {columns.filter(c => c.id !== 'id').map(col => (
                        <TextField
                            key={col.id}
                            label={col.label}
                            value={newData[col.id] || ''}
                            onChange={(e) => setNewData({ ...newData, [col.id]: e.target.value })}
                            fullWidth
                            size="small"
                            sx={{ mb: 1 }}
                        />
                    ))}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" onClick={handleAdd} sx={{ bgcolor: '#3e4a21' }}>
                            Yadda Saxla
                        </Button>
                        <Button variant="outlined" onClick={() => setIsAdding(false)}>
                            İmtina Et
                        </Button>
                    </Box>
                </Paper>
            )}

            <TableContainer sx={{ bgcolor: 'white', border: '1px solid #e5e7eb' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                            {columns.map(col => (
                                <TableCell key={col.id} sx={{ fontWeight: 600 }}>{col.label}</TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Əməliyyatlar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id} hover>
                                {editingId === item.id ? (
                                    <>
                                        {columns.filter(c => c.id !== 'id').map(col => (
                                            <TableCell key={col.id}>
                                                <TextField
                                                    value={editData[col.id] || ''}
                                                    onChange={(e) => setEditData({ ...editData, [col.id]: e.target.value })}
                                                    size="small"
                                                    fullWidth
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell align="right">
                                            <Button size="small" variant="contained" onClick={handleSaveEdit} sx={{ bgcolor: '#3e4a21', mr: 1 }}>
                                                Yadda Saxla
                                            </Button>
                                            <Button size="small" variant="outlined" onClick={() => setEditingId(null)}>
                                                İmtina Et
                                            </Button>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        {columns.map(col => (
                                            <TableCell key={col.id}>{item[col.id]}</TableCell>
                                        ))}
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleStartEdit(item)}
                                                sx={{ color: '#3e4a21', mr: 1 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => onDelete(item.id)}
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
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

    const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });
    const { data: regions } = useQuery({ queryKey: ['regions'], queryFn: getRegions });
    const { data: statuses } = useQuery({ queryKey: ['apStatuses'], queryFn: getApStatuses });
    const { data: indexes } = useQuery({ queryKey: ['apIndexes'], queryFn: getApIndexes });
    const { data: instructions } = useQuery({ queryKey: ['chiefInstructions'], queryFn: getChiefInstructions });
    const { data: inSections } = useQuery({ queryKey: ['inSections'], queryFn: getInSections });
    const { data: whoControls } = useQuery({ queryKey: ['whoControls'], queryFn: getWhoControls });

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

    return (
        <Layout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#1f2937' }}>
                    Parametrlər (Məlumat Kitabçaları)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Sistemdəki soraqçaların siyahısını idarə edin
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', bgcolor: 'white' }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: '1px solid #e5e7eb' }}
                >
                    <Tab label="İdarələr" />
                    <Tab label="Regionlar" />
                    <Tab label="Statuslar" />
                    <Tab label="Rəhbər Göstərişləri" />
                    <Tab label="Daxili Şöbələr" />
                    <Tab label="Nəzarətçilər" />
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
                            onDelete={(id) => deleteDeptMutation.mutate(id)}
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
                            onDelete={(id) => deleteRegionMutation.mutate(id)}
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
                            onDelete={(id) => deleteStatusMutation.mutate(id)}
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
                            onDelete={(id) => deleteInstructionMutation.mutate(id)}
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
                            onDelete={(id) => deleteInSectionMutation.mutate(id)}
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
                            onDelete={(id) => deleteWhoControlMutation.mutate(id)}
                        />
                    </TabPanel>
                </Box>
            </Paper>
        </Layout>
    );
}
