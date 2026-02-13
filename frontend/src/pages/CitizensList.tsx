import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getCitizens } from '../api/citizens';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CitizensList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: citizensData, isLoading } = useQuery({
    queryKey: ['citizens', page, rowsPerPage, search],
    queryFn: () =>
      getCitizens({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
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

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
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
          Vətəndaşlar
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Ad, soyad və ya FIN ilə axtarın..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{ bgcolor: 'white' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <TableContainer sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Ad</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Soyad</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>FIN</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Telefon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citizensData?.items && citizensData.items.length > 0 ? (
                citizensData.items.map((citizen) => (
                  <TableRow
                    key={citizen.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                      },
                      borderBottom: '1px solid #e5e7eb',
                    }}
                    onClick={() => navigate(`/citizens/${citizen.id}`)}
                  >
                    <TableCell sx={{ fontSize: '0.875rem' }}>{citizen.first_name}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{citizen.last_name}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{citizen.fin}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{citizen.phone || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      Vətəndaş tapılmadı
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={citizensData?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Səhifə başına:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          sx={{
            bgcolor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
          }}
        />
      </Paper>
    </Layout>
  );
}
