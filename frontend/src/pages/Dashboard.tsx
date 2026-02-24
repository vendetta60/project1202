import { useQuery } from '@tanstack/react-query';
import {
  Grid, Paper, Typography, Button, Box,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, useTheme as useMuiTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { getAppeals } from '../api/appeals';
import { getDepartments } from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import { getUsers } from '../api/users';
import { getAppealReport } from '../api/reports';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

// ─── Metric Card ─────────────────────────────────────────────────────────────
interface MetricProps {
  label: string; value: number | string; trend?: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
}
function StatCard({ label, value, trend, icon, iconBg, iconColor }: MetricProps) {
  return (
    <Paper elevation={0} className="glass-card animate-slide-up"
      sx={{ p: 3, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 2.5 }}
    >
      <Box sx={{
        width: 54, height: 54, borderRadius: '16px', bgcolor: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0
      }}>
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1, color: 'text.primary' }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mt: 0.5 }}>{label}</Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
            <TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>{trend}</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

const CHART_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e'];

const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <Paper elevation={4} sx={{ px: 1.5, py: 1, borderRadius: '10px', minWidth: 100 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>{payload[0].name || payload[0].payload.name}</Typography>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: payload[0].fill || '#6366f1' }}>{payload[0].value}</Typography>
      </Paper>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const primary = muiTheme.palette.primary.main;

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });

  const { data: appealsData, isLoading: appealsLoading } = useQuery({
    queryKey: ['appeals', 'recent'],
    queryFn: () => getAppeals({ limit: 6, offset: 0 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => getUsers({ limit: 1, offset: 0 }),
    enabled: !!user?.is_admin,
  });

  const { data: statusReport } = useQuery({ queryKey: ['reports', 'status'], queryFn: () => getAppealReport({ group_by: 'status' }) });
  const { data: deptReport } = useQuery({ queryKey: ['reports', 'department'], queryFn: () => getAppealReport({ group_by: 'department' }) });

  if (appealsLoading) return <Layout><LoadingSpinner /></Layout>;

  const globalTotal = statusReport?.total || 0;
  const userCount = usersData?.total || 12; // fallback if not admin
  const deptCount = deptReport?.items.length || 8;

  const statusPieData = (statusReport?.items || []).filter(i => i.name && i.count > 0);
  const deptBarData = (deptReport?.items || []).slice(0, 6);

  const textPrimary = muiTheme.palette.text.primary;
  const textSecondary = muiTheme.palette.text.secondary;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.07)';
  const chartGrid = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)';

  return (
    <Layout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }} className="animate-fade-in">

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: textPrimary, letterSpacing: '-0.03em', mb: 0.5 }}>Xoş gəlmisiniz!</Typography>
            <Typography sx={{ color: textSecondary, fontWeight: 500, fontSize: '0.9rem' }}>Sistemin ümumi vəziyyəti və son müraciətlər</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appeals/new')}
            sx={{ px: 3, py: 1.2, borderRadius: '12px', fontWeight: 700, boxShadow: `0 8px 24px ${primary}40`, textTransform: 'none' }}
          >
            Yeni Müraciət
          </Button>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Cəmi Müraciət" value={globalTotal} icon={<DescriptionOutlinedIcon fontSize="inherit" />} iconBg={`${primary}15`} iconColor={primary} trend="+12% bu ay" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="İstifadəçilər" value={userCount} icon={<PeopleOutlineIcon fontSize="inherit" />} iconBg="#dbeafe" iconColor="#2563eb" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="İdarə və Şöbələr" value={deptCount} icon={<BusinessOutlinedIcon fontSize="inherit" />} iconBg="#fef3c7" iconColor="#d97706" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Hesabatlar" value="24" icon={<AssessmentOutlinedIcon fontSize="inherit" />} iconBg="#d1fae5" iconColor="#059669" trend="Yaxşı" />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={5}>
            <Paper elevation={0} className="glass-card" sx={{ p: 3, borderRadius: '20px', height: '100%' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: textPrimary, mb: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Müraciət Statusları</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="count" nameKey="name">
                    {statusPieData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} strokeWidth={0} />)}
                  </Pie>
                  <RTooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} className="glass-card" sx={{ p: 3, borderRadius: '20px', height: '100%' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: textPrimary, mb: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>İdarələr üzrə statistika</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: textSecondary }} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: textSecondary }} />
                  <RTooltip content={<ChartTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="count" fill={primary} radius={[6, 6, 0, 0]} barSize={40}>
                    {deptBarData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity Table */}
        <Paper elevation={0} className="glass-card" sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}` }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: textPrimary }}>Son Müraciətlər</Typography>
            <Button size="small" onClick={() => navigate('/appeals')} sx={{ fontWeight: 700, textTransform: 'none' }}>Hamısına bax</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textSecondary, textTransform: 'uppercase' }}>Qeydiyyat №</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textSecondary, textTransform: 'uppercase' }}>Vətəndaş</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textSecondary, textTransform: 'uppercase' }}>Mövzu</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textSecondary, textTransform: 'uppercase' }}>Tarix</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appealsData?.items.map((appeal) => (
                  <TableRow key={appeal.id} hover sx={{ cursor: 'pointer', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }} onClick={() => navigate(`/appeals/${appeal.id}`)}>
                    <TableCell sx={{ fontWeight: 700, color: primary, fontSize: '0.85rem' }}>{appeal.reg_num || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: textPrimary, fontSize: '0.85rem' }}>{appeal.person || '—'}</TableCell>
                    <TableCell sx={{ color: textSecondary, fontSize: '0.82rem', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appeal.content || '—'}</TableCell>
                    <TableCell sx={{ color: textSecondary, fontSize: '0.8rem', fontWeight: 600 }}>{appeal.reg_date ? new Date(appeal.reg_date).toLocaleDateString('az-AZ') : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Layout>
  );
}
