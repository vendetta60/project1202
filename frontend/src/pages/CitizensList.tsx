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
        <Typography
          variant="h4"
          component="h1"
          fontWeight="900"
          color="primary"
          sx={{ mb: 1 }}
        >
          Vətəndaşlar
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
          Sistemdə qeydiyyatda olan vətəndaşların siyahısı və məlumatları
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
        <TextField
          fullWidth
          placeholder="Ad, soyad və ya FIN ilə axtarın..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          sx={{
            bgcolor: 'white',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5d23' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#4a5d23' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper
        className="animate-slide-up glass-card"
        sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#3e4a21' }}>
                <TableCell sx={{ fontWeight: 700, color: 'white', py: 2 }}>Ad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', py: 2 }}>Soyad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', py: 2 }}>FIN</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', py: 2 }}>Telefon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citizensData?.items && citizensData.items.length > 0 ? (
                citizensData.items.map((citizen: any) => (
                  <TableRow
                    key={citizen.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(74, 93, 35, 0.04)',
                      },
                      '& td': { py: 2, fontSize: '0.875rem', fontWeight: 500 }
                    }}
                    onClick={() => navigate(`/citizens/${citizen.id}`)}
                  >
                    <TableCell sx={{ color: '#333' }}>{citizen.first_name}</TableCell>
                    <TableCell sx={{ color: '#333' }}>{citizen.last_name}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#3e4a21' }}>{citizen.fin}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{citizen.phone || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
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
          sx={{
            bgcolor: 'white',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            '& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#333'
            }
          }}
        />
      </Paper>
    </Layout>
  );
}
