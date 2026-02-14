import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getAppeals } from '../api/appeals';
import { getDepartments, getApStatuses, getRegions } from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppealsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Filters
  const [depFilter, setDepFilter] = useState<number | ''>('');
  const [regionFilter, setRegionFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [search, setSearch] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  // Lookups
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: statuses } = useQuery({
    queryKey: ['apStatuses'],
    queryFn: getApStatuses,
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
  });

  const { data: appealsData, isLoading } = useQuery({
    queryKey: ['appeals', page, rowsPerPage, depFilter, regionFilter, statusFilter, search],
    queryFn: () =>
      getAppeals({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        dep_id: depFilter || undefined,
        region_id: regionFilter || undefined,
        status: statusFilter || undefined,
        q: search || undefined,
      }),
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusName = (statusId?: number) => {
    if (!statusId) return '-';
    // Statuses in DB might be different from IDs, but typically we map ID to name
    // The lookups API returns { id, status }
    return statuses?.find(s => s.id === statusId)?.status || statusId;
  };

  const getDepName = (depId?: number) => {
    if (!depId) return '-';
    return departments?.find(d => d.id === depId)?.department || depId;
  };

  const getRegionName = (regionId?: number) => {
    if (!regionId) return '-';
    return regions?.find(r => r.id === regionId)?.region || regionId;
  };

  // Helper for status colors - logic might need adjustment based on actual status IDs/Names
  const getStatusColor = (statusId?: number) => {
    // Example logic - adjust based on real data
    // Assuming 1=Yeni/Pending, 2=İcrada, 3=Tamamlanıb etc.
    // Use names for safe fallback if IDs are unknown or unstable
    const name = getStatusName(statusId).toString().toLowerCase();
    if (name.includes('icra') && name.includes('olun')) return { bg: '#d1fae5', text: '#065f46' }; // Completed
    if (name.includes('icra')) return { bg: '#fef3c7', text: '#92400e' }; // In progress
    return { bg: '#e0e7ff', text: '#3730a3' }; // Pending/Other
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }} className="animate-fade-in">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="900" color="primary">
            Müraciətlər
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appeals/new')}
            sx={{
              bgcolor: '#3e4a21',
              px: 3,
              '&:hover': { bgcolor: '#2c3518' },
            }}
          >
            Yeni Müraciət Daxil Et
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
          Sistemdəki bütün müraciətlərin siyahısı və idarəedilməsi
        </Typography>
      </Box>

      <Paper
        className="animate-fade-in glass-card"
        sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
      >
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Axtarış (№, məzmun, vətəndaş)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              sx: { bgcolor: 'white', borderRadius: 2 }
            }}
          />

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>İdarə</InputLabel>
            <Select
              value={depFilter}
              label="İdarə"
              onChange={(e) => {
                setDepFilter(e.target.value as number | '');
                setPage(0);
              }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="">Hamısı</MenuItem>
              {departments?.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Region</InputLabel>
            <Select
              value={regionFilter}
              label="Region"
              onChange={(e) => {
                setRegionFilter(e.target.value as number | '');
                setPage(0);
              }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="">Hamısı</MenuItem>
              {regions?.map((reg) => (
                <MenuItem key={reg.id} value={reg.id}>
                  {reg.region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value as number | '');
                setPage(0);
              }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            >
              <MenuItem value="">Hamısı</MenuItem>
              {statuses?.map((st) => (
                <MenuItem key={st.id} value={st.id}>
                  {st.status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper
        className="animate-slide-up glass-card"
        sx={{ borderRadius: 4, overflow: 'hidden' }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="military-table-header">Qeydiyyat №</TableCell>
                <TableCell className="military-table-header">Vətəndaş</TableCell>
                <TableCell className="military-table-header">Region</TableCell>
                <TableCell className="military-table-header">İdarə</TableCell>
                <TableCell className="military-table-header" sx={{ maxWidth: 300 }}>Məzmun</TableCell>
                <TableCell className="military-table-header">Status</TableCell>
                <TableCell className="military-table-header">Tarix</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appealsData?.items && appealsData.items.length > 0 ? (
                appealsData.items.map((appeal) => {
                  const statusColor = getStatusColor(appeal.status);
                  return (
                    <TableRow
                      key={appeal.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(62, 74, 33, 0.05)' },
                        '& td': { py: 2.5, fontSize: '0.875rem', fontWeight: 500 }
                      }}
                      onClick={() => navigate(`/appeals/${appeal.id}`)}
                    >
                      <TableCell sx={{ fontWeight: 800, color: '#3e4a21' }}>{appeal.reg_num || '-'}</TableCell>
                      <TableCell>{appeal.person || '-'}</TableCell>
                      <TableCell>{getRegionName(appeal.region_id as any)}</TableCell>
                      <TableCell>{getDepName(appeal.dep_id as any)}</TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {appeal.content || '-'}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.75,
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            bgcolor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.text}30`
                          }}
                        >
                          {getStatusName(appeal.status as any)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {appeal.reg_date ? new Date(appeal.reg_date).toLocaleDateString('az-AZ') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Axtarışa uyğun müraciət tapılmadı</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={appealsData?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Səhifə başına:"
          sx={{
            bgcolor: 'rgba(62, 74, 33, 0.03)',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            '& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#3e4a21'
            }
          }}
        />
      </Paper>
    </Layout>
  );
}
