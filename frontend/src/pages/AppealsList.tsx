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
import { getOrgUnits } from '../api/orgUnits';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppealsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [orgUnitFilter, setOrgUnitFilter] = useState<number | ''>('');
  const [search, setSearch] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: orgUnits } = useQuery({
    queryKey: ['orgUnits'],
    queryFn: getOrgUnits,
    enabled: user?.is_admin,
  });

  const { data: appealsData, isLoading } = useQuery({
    queryKey: ['appeals', page, rowsPerPage, orgUnitFilter, search],
    queryFn: () =>
      getAppeals({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        org_unit_id: orgUnitFilter || undefined,
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

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Gözləyir';
      case 'in_progress':
        return 'İcradadır';
      case 'completed':
        return 'İcra olundu';
      default:
        return status;
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" sx={{ color: '#1f2937' }}>
          Müraciətlər
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appeals/new')}
          sx={{
            bgcolor: '#1976d2',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#1565c0',
            },
          }}
        >
          Yeni Müraciət
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Qeydiyyat № və ya mövzu ilə axtar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ maxWidth: 400, bgcolor: 'white' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {user?.is_admin && (
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>İdarə</InputLabel>
              <Select
                value={orgUnitFilter}
                label="İdarə"
                onChange={(e) => {
                  setOrgUnitFilter(e.target.value as number | '');
                  setPage(0);
                }}
                size="small"
              >
                <MenuItem value="">Hamısı</MenuItem>
                {orgUnits?.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <TableContainer sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Qeydiyyat №</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Mövzu</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Vətəndaş</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İdarə</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İcra şöbəsi</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İcraçı</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Daxil</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İcra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appealsData?.items && appealsData.items.length > 0 ? (
                appealsData.items.map((appeal) => (
                  <TableRow
                    key={appeal.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                      },
                      borderBottom: '1px solid #e5e7eb',
                    }}
                    onClick={() => navigate(`/appeals/${appeal.id}`)}
                  >
                    <TableCell sx={{ fontSize: '0.875rem' }}>{appeal.reg_no}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{appeal.subject}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {appeal.citizen
                        ? `${appeal.citizen.first_name} ${appeal.citizen.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{appeal.org_unit?.name || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {appeal.executor_org_unit?.name || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{appeal.executor?.full_name || '-'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor:
                            appeal.status === 'completed'
                              ? '#d1fae5'
                              : appeal.status === 'in_progress'
                                ? '#fef3c7'
                                : '#e0e7ff',
                          color:
                            appeal.status === 'completed'
                              ? '#065f46'
                              : appeal.status === 'in_progress'
                                ? '#92400e'
                                : '#3730a3',
                        }}
                      >
                        {statusLabel(appeal.status)}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {new Date(appeal.received_at || appeal.created_at).toLocaleDateString('az-AZ')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {appeal.execution_date
                        ? new Date(appeal.execution_date).toLocaleDateString('az-AZ')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Müraciət tapılmadı</Typography>
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
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          sx={{
            bgcolor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            '& .MuiTablePagination-root': {
              color: '#374151',
            },
          }}
        />
      </Paper>
    </Layout>
  );
}
