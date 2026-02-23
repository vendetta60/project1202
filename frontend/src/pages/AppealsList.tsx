import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
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
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getAppeals } from '../api/appeals';
import { getDepartments, getApStatuses, getRegions } from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSelectStyles } from '../utils/formStyles';

export default function AppealsList() {
  const navigate = useNavigate();
  const theme = useTheme();
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
      <Box sx={{ mb: 6 }} className="animate-fade-in">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="900"
            color="primary"
          >
            Müraciətlər
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appeals/new')}
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.2,
              fontWeight: 700,
              boxShadow: 2,
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
            }}
          >
            Yeni Müraciət
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
          Sistemdəki bütün müraciətlərin siyahısı və idarəedilməsi
        </Typography>
      </Box>

      <Paper
        className="animate-slide-up glass-card"
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
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
            sx={{
              flexGrow: 1,
              minWidth: 300,
              '& .MuiOutlinedInput-root': { bgcolor: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          {/* Replace MUI Selects with react-select for consistent styling */}
          <div style={{ minWidth: 200 }}>
            {/* İdarə */}
            <Select
              // @ts-ignore
              options={(departments || []).map(d => ({ value: d.id, label: d.department }))}
              value={(departments || []).map(d => ({ value: d.id, label: d.department })).find(o => o.value === depFilter) || null}
              onChange={(e: any) => { setDepFilter(e?.value || ''); setPage(0); }}
              styles={getSelectStyles(theme.palette.primary.main)}
              menuPortalTarget={document.body}
              isClearable
            />
          </div>

          <div style={{ minWidth: 150 }}>
            {/* Region */}
            <Select
              // @ts-ignore
              options={(regions || []).map(r => ({ value: r.id, label: r.region }))}
              value={(regions || []).map(r => ({ value: r.id, label: r.region })).find(o => o.value === regionFilter) || null}
              onChange={(e: any) => { setRegionFilter(e?.value || ''); setPage(0); }}
              styles={getSelectStyles(theme.palette.primary.main)}
              menuPortalTarget={document.body}
              isClearable
            />
          </div>

          <div style={{ minWidth: 150 }}>
            {/* Status */}
            <Select
              // @ts-ignore
              options={(statuses || []).map(s => ({ value: s.id, label: s.status }))}
              value={(statuses || []).map(s => ({ value: s.id, label: s.status })).find(o => o.value === statusFilter) || null}
              onChange={(e: any) => { setStatusFilter(e?.value || ''); setPage(0); }}
              styles={getSelectStyles(theme.palette.primary.main)}
              menuPortalTarget={document.body}
              isClearable
            />
          </div>
        </Box>
      </Paper>

      <Paper
        className="animate-slide-up glass-card"
        sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700, width: 60 }}>Sıra №</TableCell>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700 }}>Qeydiyyat №</TableCell>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700 }}>Vətəndaş</TableCell>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700 }}>Region</TableCell>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700 }}>İdarə</TableCell>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700, maxWidth: 300 }}>Məzmun</TableCell>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                <TableCell className="military-table-header" sx={{ color: 'white', fontWeight: 700 }}>Tarix</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appealsData?.items && appealsData.items.length > 0 ? (
                appealsData.items.map((appeal, index) => {
                  const statusColor = getStatusColor(appeal.status);
                  return (
                    <TableRow
                      key={appeal.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        '& td': { py: 2, fontSize: '0.875rem', fontWeight: 500 }
                      }}
                      onClick={() => navigate(`/appeals/${appeal.id}`)}
                    >
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{appeal.reg_num || '-'}</TableCell>
                      <TableCell>{appeal.person || '-'}</TableCell>
                      <TableCell>{getRegionName(appeal.region_id || undefined)}</TableCell>
                      <TableCell>{getDepName(appeal.dep_id || undefined)}</TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {appeal.content || '-'}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.text}30`
                          }}
                        >
                          {getStatusName(appeal.status as any)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {appeal.reg_date ? new Date(appeal.reg_date).toLocaleDateString('az-AZ') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 500 }}>Axtarışa uyğun müraciət tapılmadı</Typography>
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
            bgcolor: 'white',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            '& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.primary'
            }
          }}
        />
      </Paper>
    </Layout>
  );
}
