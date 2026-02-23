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
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import { getAppeals } from '../api/appeals';
import { getDepartments } from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import { getUsers } from '../api/users';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: appealsData, isLoading: appealsLoading } = useQuery({
    queryKey: ['appeals', 'stats'],
    queryFn: () => getAppeals({ limit: 10, offset: 0 }),
  });

  const { data: departments, isLoading: depsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => getUsers({ limit: 1, offset: 0 }),
    enabled: !!user?.is_admin,
  });

  const isLoading = appealsLoading || depsLoading || usersLoading;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  // Helper to resolve Department Name
  const getDepName = (id?: number) => {
    return departments?.find(d => d.id === id)?.department || '-';
  };

  return (
    <Layout>
      <Box sx={{ mb: 6 }} className="animate-fade-in">
        <Typography variant="h4" component="h1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon fontSize="large" /> Ana Səhifə
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
          Hərbi hissə üzrə müraciətlərin statistikası və son fəaliyyətlər
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ümumi Müraciətlər"
            value={appealsData?.total || 0}
            icon={<DescriptionIcon fontSize="large" />}
            color={theme.palette.primary.main}
          />
        </Grid>
        {user?.is_admin && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Qeydiyyatda olan İdarələr"
                value={departments?.length || 0}
                icon={<BusinessIcon fontSize="large" />}
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Sistem İstifadəçiləri"
                value={usersData?.total || 0}
                icon={<PeopleIcon fontSize="large" />}
                color={theme.palette.primary.dark}
              />
            </Grid>
          </>
        )}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Analitik Hesabatlar"
            value="STATİSTİKA"
            icon={<AssessmentIcon fontSize="large" />}
            color={theme.palette.primary.light}
            onClick={() => navigate('/reports')}
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }} className="animate-fade-in">
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appeals/new')}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
          }}
        >
          Yeni Müraciət Daxil Et
        </Button>
      </Box>

      <Paper
        className="animate-slide-up glass-card"
        sx={{
          p: 0,
          overflow: 'hidden',
          borderRadius: 4,
        }}
      >
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.5px' }}>
            SON MÜRACİƏTLƏR
          </Typography>
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/appeals')}
            sx={{ fontWeight: 800 }}
          >
            Hamısına bax →
          </Button>
        </Box>

        {appealsData?.items && appealsData.items.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="military-table-header">Qeydiyyat №</TableCell>
                  <TableCell className="military-table-header">Vətəndaş</TableCell>
                  <TableCell className="military-table-header">İdarə</TableCell>
                  <TableCell className="military-table-header">Məzmun</TableCell>
                  <TableCell className="military-table-header">Tarix</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appealsData.items.map((appeal) => (
                  <TableRow
                    key={appeal.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      '& td': { py: 2.5, fontSize: '0.9rem', fontWeight: 500 }
                    }}
                    onClick={() => navigate(`/appeals/${appeal.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{appeal.reg_num || '-'}</TableCell>
                    <TableCell>{appeal.person || '-'}</TableCell>
                    <TableCell>{getDepName(appeal.dep_id)}</TableCell>
                    <TableCell sx={{ maxWidth: 350, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appeal.content || '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {appeal.reg_date ? new Date(appeal.reg_date).toLocaleDateString('az-AZ') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              Sistemdə hələ heç bir müraciət qeydə alınmayıb
            </Typography>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
