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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getAppeals } from '../api/appeals';
import { getDepartments, getInSections } from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import { getUsers } from '../api/users';
import { getAppealReport } from '../api/reports';
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
    queryKey: ['appeals', 'recent'],
    queryFn: () => getAppeals({ limit: 5, offset: 0 }),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => getUsers({ limit: 1, offset: 0 }),
    enabled: !!user?.is_admin,
  });

  // Analytics Queries
  const { data: statusStats } = useQuery({
    queryKey: ['reports', 'status'],
    queryFn: () => getAppealReport({ group_by: 'status' }),
  });

  const { data: deptStats } = useQuery({
    queryKey: ['reports', 'department'],
    queryFn: () => getAppealReport({ group_by: 'department' }),
  });

  const isLoading = appealsLoading;

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const CHART_COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#ed6c02',
    '#2e7d32',
    '#9c27b0',
    '#d32f2f',
  ];

  return (
    <Layout>
      {/* Header Section */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }} className="animate-fade-in">
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <DashboardIcon fontSize="large" /> KOMANDA MƏRKƏZİ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.8 }}>
            Hərbi hissə üzrə müraciətlərin genişləndirilmiş analitikası
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appeals/new')}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 3,
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: `0 8px 20px ${theme.palette.primary.main}30`,
            '&:hover': {
              boxShadow: `0 12px 25px ${theme.palette.primary.main}50`,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Yeni Müraciət Daxil Et
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ümumi Müraciətlər"
            value={statusStats?.total || 0}
            icon={<DescriptionIcon />}
            color={theme.palette.primary.main}
            trend="+12% bu ay"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Sistem İstifadəçiləri"
            value={usersData?.total || 0}
            icon={<PeopleIcon />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Qeydiyyatda olan İdarələr"
            value={departments?.length || 0}
            icon={<BusinessIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Baxılmamış"
            value={statusStats?.items.find(i => i.name === 'Baxılmamış')?.count || 0}
            icon={<TrendingUpIcon />}
            color="#ed6c02"
            trend="Diqqət tələb edir"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper className="glass-card" sx={{ p: 3, height: 450, borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" /> STATUSLAR ÜZRƏ PAYLANMA
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats?.items || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {(statusStats?.items || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper className="glass-card" sx={{ p: 3, height: 450, borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" /> İDARƏLƏR ÜZRƏ MÜRACİƏT SAYI
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats?.items || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 600 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar
                    dataKey="count"
                    fill={theme.palette.primary.main}
                    radius={[10, 10, 0, 0]}
                    barSize={40}
                  >
                    {(deptStats?.items || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`${theme.palette.primary.main}${index % 2 === 0 ? '' : 'cc'}`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Appeals Table */}
      <Paper
        className="animate-slide-up glass-card"
        sx={{
          p: 0,
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ p: 3, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            SON MÜRACİƏTLƏR
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/appeals')}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
              borderColor: 'divider',
              color: 'text.secondary'
            }}
          >
            Hamısına bax
          </Button>
        </Box>

        {appealsData?.items && appealsData.items.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Qeydiyyat №</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Vətəndaş</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>İdarə</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Məzmun</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>Tarix</TableCell>
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
                      '& td': { py: 2.5, fontSize: '0.9rem', borderBottom: '1px solid', borderColor: 'divider' }
                    }}
                    onClick={() => navigate(`/appeals/${appeal.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{appeal.reg_num || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{appeal.person || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{appeal.in_section?.section || appeal.dep_id || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'text.secondary' }}>
                      {appeal.content || '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
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
