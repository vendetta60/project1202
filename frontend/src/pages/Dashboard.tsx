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
} from 'recharts';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { getAppeals } from '../api/appeals';
import { getCurrentUser } from '../api/auth';
import { getUsers } from '../api/users';
import { getAppealReport } from '../api/reports';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

// ─── Premium Stat Card ────────────────────────────────────────────────────────
interface MetricProps {
  label: string;
  value: number | string;
  trend?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  staggerClass?: string;
}

function StatCard({ label, value, trend, icon, iconBg, iconColor, staggerClass = '' }: MetricProps) {
  return (
    <Paper
      elevation={0}
      className={`glass-card animate-slide-up ${staggerClass}`}
      sx={{
        p: 3,
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)`,
          opacity: 0.7,
        },
      }}
    >
      <Box sx={{
        width: { xs: 48, sm: 56 },
        height: { xs: 48, sm: 56 },
        borderRadius: '18px',
        background: `linear-gradient(135deg, ${iconBg} 0%, ${iconBg}80 100%)`,
        color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: { xs: 24, sm: 28 }, flexShrink: 0,
        boxShadow: `0 8px 20px ${iconColor}30`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          noWrap
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 900, lineHeight: 1,
            color: 'text.primary', letterSpacing: '-0.03em',
          }}>
          {value}
        </Typography>
        <Typography
          noWrap
          sx={{
            fontSize: { xs: '0.65rem', sm: '0.72rem' }, fontWeight: 700, color: 'text.secondary',
            textTransform: 'uppercase', letterSpacing: '0.07em', mt: 0.6,
            display: 'block'
          }}>
          {label}
        </Typography>
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

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const CHART_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e'];

const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <Paper elevation={4} sx={{ px: 1.5, py: 1, borderRadius: '10px', minWidth: 100, border: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
          {payload[0].name || payload[0].payload.name}
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: payload[0].fill || '#6366f1' }}>
          {payload[0].value}
        </Typography>
      </Paper>
    );
  }
  return null;
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const primary = muiTheme.palette.primary.main;

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });

  const { data: appealsData, isLoading: appealsLoading } = useQuery({
    queryKey: ['appeals', 'recent'],
    queryFn: () => getAppeals({
      limit: 6,
      offset: 0,
    }),
    enabled: !!user,
  });


  const { data: statusReport } = useQuery({
    queryKey: ['reports', 'status'],
    queryFn: () => getAppealReport({ group_by: 'status' }),
  });
  const { data: deptReport } = useQuery({
    queryKey: ['reports', 'department'],
    queryFn: () => getAppealReport({ group_by: 'department' }),
  });
  const { data: regionReport } = useQuery({
    queryKey: ['reports', 'region'],
    queryFn: () => getAppealReport({ group_by: 'region' }),
  });

  if (appealsLoading) return <Layout><LoadingSpinner /></Layout>;

  const globalTotal = statusReport?.total || 0;

  // derive global counts from statusReport
  const completedCount = statusReport?.items.filter(i => { const n = i.name?.toLowerCase() ?? ''; return n.includes('icra') && (n.includes('olun') || n.includes('edildi')); }).reduce((acc, i) => acc + i.count, 0) ?? 0;
  const inProgressCount = statusReport?.items.filter(i => { const n = i.name?.toLowerCase() ?? ''; return n.includes('icra') && !n.includes('olun') && !n.includes('edildi'); }).reduce((acc, i) => acc + i.count, 0) ?? 0;
  const pendingCount = statusReport?.items.filter(i => { const n = i.name?.toLowerCase() ?? ''; return n.includes('baxılmamış') || n.includes('gözl'); }).reduce((acc, i) => acc + i.count, 0) ?? 0;

  const statusPieData = (statusReport?.items || []).filter(i => i.name && i.count > 0);
  const deptBarData = (deptReport?.items || []).filter(i => i.name && i.name !== 'Naməlum').slice(0, 6);
  const regionBarData = (regionReport?.items || []).filter(i => i.name && i.name !== 'Naməlum').slice(0, 5);

  const textPrimary = muiTheme.palette.text.primary;
  const textSecondary = muiTheme.palette.text.secondary;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.07)';
  const chartGrid = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)';

  return (
    <Layout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }} className="page-enter">

        {/* ── Header ─────────────────────────────────────────────── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          mb: 4, p: 3, borderRadius: '20px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.1)'}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(99,102,241,0.06)',
        }}
          className="animate-slide-up animate-stagger-1"
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                mb: 0.5,
                background: `linear-gradient(135deg, ${textPrimary} 0%, ${primary} 120%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Xoş gəlmisiniz!
            </Typography>
            <Typography sx={{ color: textSecondary, fontWeight: 500, fontSize: '0.9rem' }}>
              Sistemin ümumi vəziyyəti və son müraciətlər
            </Typography>
          </Box>
          <Button
            className="btn-glow"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appeals/new')}
            sx={{
              px: 3.5, py: 1.3,
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${primary} 0%, #8b5cf6 100%)`,
              boxShadow: `0 8px 24px ${primary}50`,
              '&:hover': {
                background: `linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)`,
                boxShadow: `0 12px 32px ${primary}60`,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Yeni Müraciət
          </Button>
        </Box>

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Cəmi Müraciət" value={globalTotal}
              icon={<DescriptionOutlinedIcon fontSize="inherit" />}
              iconBg={`${primary}22`} iconColor={primary}
              trend="+12% bu ay" staggerClass="animate-stagger-1"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Gözləmədə" value={pendingCount}
              icon={<PendingActionsIcon fontSize="inherit" />}
              iconBg="#dbeafe" iconColor="#2563eb"
              staggerClass="animate-stagger-2"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="İcrada" value={inProgressCount}
              icon={<HourglassTopIcon fontSize="inherit" />}
              iconBg="#fef3c7" iconColor="#d97706"
              staggerClass="animate-stagger-3"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Tamamlanmış" value={completedCount}
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              iconBg="#d1fae5" iconColor="#059669"
              staggerClass="animate-stagger-4"
            />
          </Grid>
        </Grid>

        {/* ── Charts Row ─────────────────────────────────────────── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Status Donut */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              className="glass-card animate-scale-in animate-stagger-3"
              sx={{ p: 3, borderRadius: '20px', height: '100%' }}
            >
              <Typography sx={{
                fontWeight: 800, fontSize: '0.78rem', color: textSecondary,
                mb: 3, textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                Müraciət Statusları
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusPieData} cx="50%" cy="50%"
                    innerRadius={65} outerRadius={95} paddingAngle={4}
                    dataKey="count" nameKey="name"
                  >
                    {statusPieData.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <RTooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(v) => <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Depts Bar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              className="glass-card animate-scale-in animate-stagger-4"
              sx={{ p: 3, borderRadius: '20px', height: '100%' }}
            >
              <Typography sx={{
                fontWeight: 800, fontSize: '0.78rem', color: textSecondary,
                mb: 3, textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                İdarələr üzrə statistika (top 6)
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptBarData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: textSecondary, fontWeight: 600 }} interval={0} angle={-35} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: textSecondary }} />
                  <RTooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={28}>
                    {deptBarData.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Regions Bar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              className="glass-card animate-scale-in animate-stagger-5"
              sx={{ p: 3, borderRadius: '20px', height: '100%' }}
            >
              <Typography sx={{
                fontWeight: 800, fontSize: '0.78rem', color: textSecondary,
                mb: 3, textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                Regionlar üzrə statistika (top 5)
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={regionBarData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGrid} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: textSecondary }} />
                  <YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: textSecondary, fontWeight: 600 }} />
                  <RTooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                    {regionBarData.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[(i + 3) % CHART_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* ── Recent Appeals Table ───────────────────────────────── */}
        <Paper
          elevation={0}
          className="glass-card animate-slide-up animate-stagger-5"
          sx={{ borderRadius: '20px', overflow: 'hidden' }}
        >
          <Box sx={{
            p: 3, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${borderColor}`,
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: textPrimary }}>
              Son Müraciətlər
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/appeals')}
              sx={{
                fontWeight: 700, textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { bgcolor: `${primary}12` },
              }}
            >
              Hamısına bax
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Qeydiyyat №', 'Vətəndaş', 'Mövzu', 'Tarix'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700, fontSize: '0.72rem', color: 'white',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        background: `linear-gradient(135deg, ${primary}, #8b5cf6)`,
                        borderBottom: 'none',
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {appealsData?.items.map((appeal) => (
                  <TableRow
                    key={appeal.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                        '& td:first-of-type': { borderLeft: `3px solid ${primary}` },
                      },
                      '& td:first-of-type': {
                        borderLeft: '3px solid transparent',
                        transition: 'border-color 0.15s ease',
                      },
                    }}
                    onClick={() => navigate(`/appeals/${appeal.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 700, color: primary, fontSize: '0.85rem' }}>
                      {appeal.reg_num || '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: textPrimary, fontSize: '0.85rem' }}>
                      {appeal.person || '—'}
                    </TableCell>
                    <TableCell sx={{
                      color: textSecondary, fontSize: '0.82rem',
                      maxWidth: 250, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {appeal.content || '—'}
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, fontSize: '0.8rem', fontWeight: 600 }}>
                      {appeal.reg_date ? new Date(appeal.reg_date).toLocaleDateString('az-AZ') : '—'}
                    </TableCell>
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
