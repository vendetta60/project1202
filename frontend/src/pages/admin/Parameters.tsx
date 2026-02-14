import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@mui/material';
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

// Simple Read-Only Table
function SimpleTable({ items, columns }: { items: any[] | undefined, columns: { id: string, label: string }[] }) {
    if (!items || items.length === 0) {
        return <Typography color="text.secondary" sx={{ py: 2 }}>Məlumat yoxdur</Typography>;
    }
    return (
        <TableContainer sx={{ bgcolor: 'white', border: '1px solid #e5e7eb' }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                        {columns.map(col => (
                            <TableCell key={col.id} sx={{ fontWeight: 600 }}>{col.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, idx) => (
                        <TableRow key={idx} hover>
                            {columns.map(col => (
                                <TableCell key={col.id}>{item[col.id]}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default function Parameters() {
    const [tab, setTab] = useState(0);

    const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });
    const { data: regions } = useQuery({ queryKey: ['regions'], queryFn: getRegions });
    const { data: statuses } = useQuery({ queryKey: ['apStatuses'], queryFn: getApStatuses });
    const { data: indexes } = useQuery({ queryKey: ['apIndexes'], queryFn: getApIndexes });
    const { data: instructions } = useQuery({ queryKey: ['chiefInstructions'], queryFn: getChiefInstructions });
    const { data: inSections } = useQuery({ queryKey: ['inSections'], queryFn: getInSections });
    const { data: whoControls } = useQuery({ queryKey: ['whoControls'], queryFn: getWhoControls });

    return (
        <Layout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#1f2937' }}>
                    Parametrlər (Məlumat Kitabçaları)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Sistemdəki soraqçaların siyahısı (Oxunur rejimdə)
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
                    <Tab label="İndekslər" />
                    <Tab label="Rəhbər Göstərişləri" />
                    <Tab label="Daxili Şöbələr" />
                    <Tab label="Nəzarətçilər" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    <TabPanel value={tab} index={0}>
                        <SimpleTable items={departments} columns={[
                            { id: 'id', label: 'ID' },
                            { id: 'department', label: 'İdarə Adı' }
                        ]} />
                    </TabPanel>
                    <TabPanel value={tab} index={1}>
                        <SimpleTable items={regions} columns={[
                            { id: 'id', label: 'ID' },
                            { id: 'region', label: 'Region Adı' }
                        ]} />
                    </TabPanel>
                    <TabPanel value={tab} index={2}>
                        <SimpleTable items={statuses} columns={[
                            { id: 'id', label: 'ID' },
                            { id: 'status', label: 'Status' }
                        ]} />
                    </TabPanel>
                    <TabPanel value={tab} index={3}>
                        <SimpleTable items={indexes} columns={[
                            { id: 'id', label: 'ID' },
                            { id: 'ap_index', label: 'İndeks' }
                        ]} />
                    </TabPanel>
                    <TabPanel value={tab} index={4}>
                        <SimpleTable items={instructions} columns={[
                            { id: 'id', label: 'ID' },
                            { id: 'instructions', label: 'Göstəriş' }
                        ]} />
                    </TabPanel>
                    <TabPanel value={tab} index={5}>
                        <SimpleTable items={inSections} columns={[
                            { id: 'id', label: 'ID' },
                            { id: 'section', label: 'Şöbə' }
                        ]} />
                    </TabPanel>
                    <TabPanel value={tab} index={6}>
                        <SimpleTable items={whoControls} columns={[
                            { id: 'id', label: 'ID' },
                            { id: 'chief', label: 'Nəzarətçi' }
                        ]} />
                    </TabPanel>
                </Box>
            </Paper>
        </Layout>
    );
}
