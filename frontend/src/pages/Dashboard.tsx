import { useQuery } from '@tanstack/react-query';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import { getAppeals } from '../api/appeals';
import { getOrgUnits } from '../api/orgUnits';
import { getCurrentUser } from '../api/auth';
import { getUsers } from '../api/users';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: appealsData, isLoading: appealsLoading } = useQuery({
    queryKey: ['appeals', 'stats'],
    queryFn: () => getAppeals({ limit: 10, offset: 0 }),
  });

  const { data: orgUnits, isLoading: orgUnitsLoading } = useQuery({
    queryKey: ['orgUnits'],
    queryFn: getOrgUnits,
    enabled: user?.is_admin,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => getUsers({ limit: 1, offset: 0 }),
    enabled: user?.is_admin,
  });

  const isLoading = appealsLoading || orgUnitsLoading || usersLoading;

  if (isLoading) {
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
          Ana Səhifə
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Müraciətlərin ümumi statistikasını izləyin
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Müraciətlər"
            value={appealsData?.total || 0}
            icon={<DescriptionIcon />}
            color="#1976d2"
          />
        </Grid>
        {user?.is_admin && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="İdarələr"
                value={orgUnits?.length || 0}
                icon={<BusinessIcon />}
                color="#ed6c02"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="İstifadəçilər"
                value={usersData?.total || 0}
                icon={<PeopleIcon />}
                color="#9c27b0"
              />
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', border: '1px solid #e5e7eb' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
          Son Müraciətlər
        </Typography>
        {appealsData?.items && appealsData.items.length > 0 ? (
          <TableContainer sx={{ bgcolor: 'white' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Qeydiyyat №</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Mövzu</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Vətəndaş</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İdarə</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tarix</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appealsData.items.map((appeal) => (
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
                      {new Date(appeal.created_at).toLocaleDateString('az-AZ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            Hələ müraciət yoxdur
          </Typography>
        )}
      </Paper>
    </Layout>
  );
}
