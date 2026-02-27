import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  Box, Typography, Button, InputAdornment, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Paper, useTheme as useMuiTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import InboxIcon from '@mui/icons-material/Inbox';

import { getAppeals, deleteAppeal, restoreAppeal } from '../api/appeals';
import { getDepartments, getApStatuses, getRegions } from '../api/lookups';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePermissions } from '../hooks/usePermissions';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

// ─── React-Select dark styles ─────────────────────────────────────────────────
function selectStyles(isDark: boolean, primary: string) {
  const bg = isDark ? '#1f2638' : '#ffffff';
  const hover = isDark ? '#2a3248' : '#f8fafc';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26,31,54,0.15)';
  const text = isDark ? '#e8ecf4' : '#1a1f36';
  const muted = isDark ? '#6b7898' : '#8890a4';
  return {
    control: (b: any, s: any) => ({ ...b, background: bg, border: `1px solid ${s.isFocused ? primary : border}`, borderRadius: 10, minHeight: 40, boxShadow: s.isFocused ? `0 0 0 3px ${primary}25` : 'none', '&:hover': { borderColor: primary } }),
    menu: (b: any) => ({ ...b, background: bg, border: `1px solid ${border}`, borderRadius: 12, zIndex: 9999, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }),
    option: (b: any, s: any) => ({ ...b, background: s.isFocused ? hover : 'transparent', color: text, fontSize: 13, '&:active': { background: hover } }),
    singleValue: (b: any) => ({ ...b, color: text, fontSize: 13 }),
    placeholder: (b: any) => ({ ...b, color: muted, fontSize: 13 }),
    dropdownIndicator: (b: any) => ({ ...b, color: muted }),
    clearIndicator: (b: any) => ({ ...b, color: muted }),
    indicatorSeparator: () => ({ display: 'none' }),
    input: (b: any) => ({ ...b, color: text }),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AppealsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const primary = muiTheme.palette.primary.main;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [depFilter, setDepFilter] = useState<number | ''>('');
  const [regionFilter, setRegionFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [restoreTargetId, setRestoreTargetId] = useState<number | null>(null);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });
  const { isAdmin, canCreateAppeal, canDeleteAppeal, canViewAppealDetails } = usePermissions();
  const canDelete = canDeleteAppeal;
  const canCreate = canCreateAppeal;
  void user; // used for showDeleted toggle admin check via isAdmin below

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });
  const { data: statuses } = useQuery({ queryKey: ['apStatuses'], queryFn: getApStatuses });
  const { data: regions } = useQuery({ queryKey: ['regions'], queryFn: getRegions });

  // ── item fetching ────────────────────────────────────────────────────────

  const { data: appealsData, isLoading } = useQuery({
    queryKey: ['appeals', page, rowsPerPage, depFilter, regionFilter, statusFilter, search, showDeleted],
    queryFn: () => getAppeals({
      limit: rowsPerPage, offset: page * rowsPerPage,
      dep_id: depFilter || undefined, region_id: regionFilter || undefined,
      status: statusFilter || undefined, q: search || undefined,
      include_deleted: showDeleted
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAppeal(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appeals'] }); setDeleteTargetId(null); },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreAppeal(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appeals'] }); setRestoreTargetId(null); },
  });

  const items = appealsData?.items ?? [];
  const total = appealsData?.total ?? 0;

  // Per-appeal extra data (for current page) - REMOVED for optimization
  const selectSx = selectStyles(isDark, muiTheme.palette.primary.main);

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;

  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,31,54,0.07)';
  const rowHover = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(26,31,54,0.025)';
  const headBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const textPrimary = muiTheme.palette.text.primary;
  const textSecondary = muiTheme.palette.text.secondary;

  return (
    <Layout>
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }} className="animate-fade-in">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Müraciətlər
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: textSecondary, mt: 0.5, fontWeight: 500 }}>
              Sistemdəki bütün müraciətlərin siyahısı və idarəedilməsi
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Show Deleted toggle - admin only */}
            {isAdmin && (
              <Box onClick={() => { setShowDeleted(!showDeleted); setPage(0); }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2, px: 2, py: 1,
                  borderRadius: '12px', cursor: 'pointer', userSelect: 'none',
                  bgcolor: showDeleted ? 'error.main' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                  color: showDeleted ? '#fff' : textSecondary,
                  border: `1px solid ${showDeleted ? 'transparent' : borderColor}`,
                  transition: 'all 0.25s ease',
                  '&:hover': { bgcolor: showDeleted ? '#dc2626' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') }
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                  SİLİNƏNLƏRİ GÖSTƏR {items.some(i => i.is_deleted) && `(${items.filter(i => i.is_deleted).length})`}
                </Typography>
                <Box sx={{
                  width: 34, height: 18, borderRadius: '10px', bgcolor: showDeleted ? 'rgba(255,255,255,0.3)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                  position: 'relative', transition: 'all 0.2s'
                }}>
                  <Box sx={{
                    width: 14, height: 14, borderRadius: '50%', bgcolor: '#fff',
                    position: 'absolute', top: 2, left: showDeleted ? 18 : 2, transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)'
                  }} />
                </Box>
              </Box>
            )}
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/appeals/new')}
                sx={{
                  px: 3.5, py: 1.3, fontSize: '0.88rem', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${primary} 0%, ${primary}cc 100%)`,
                  boxShadow: `0 6px 22px ${primary}40`,
                  '&:hover': { background: `linear-gradient(135deg, ${primary}ee 0%, ${primary} 100%)`, boxShadow: `0 10px 28px ${primary}55`, transform: 'translateY(-2px)' },
                  transition: 'all 0.25s ease',
                }}
              >
                Yeni Müraciət
              </Button>
            )}
          </Box>
        </Box>


        {/* ── Filters ──────────────────────────────────────────────────── */}
        <Paper elevation={0} className="glass-card"
          sx={{ borderRadius: '16px', p: 2, mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: textSecondary }}>
            <FilterListIcon fontSize="small" />
            <Typography sx={{ fontSize: '0.77rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filterlər</Typography>
          </Box>
          <TextField
            placeholder="Axtarış — №, məzmun, vətəndaş…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
                setPage(0);
              }
            }}
            size="small"
            sx={{
              flexGrow: 1, minWidth: 220,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                borderRadius: '10px', fontSize: 13,
                '& fieldset': { borderColor },
                '&:hover fieldset': { borderColor: primary },
                '&.Mui-focused fieldset': { borderColor: primary, borderWidth: 1.5 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearch(searchInput);
                      setPage(0);
                    }}
                    sx={{ p: 0.5, color: textSecondary, '&:hover': { color: primary } }}
                  >
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Box sx={{ minWidth: 200 }}>
            <Select options={(departments || []).map(d => ({ value: d.id, label: d.department }))}
              value={(departments || []).map(d => ({ value: d.id, label: d.department })).find(o => o.value === depFilter) || null}
              onChange={(e: any) => { setDepFilter(e?.value || ''); setPage(0); }}
              styles={selectSx} menuPortalTarget={document.body} placeholder="İdarə seçin…" isClearable />
          </Box>
          <Box sx={{ minWidth: 160 }}>
            <Select options={(regions || []).map(r => ({ value: r.id, label: r.region }))}
              value={(regions || []).map(r => ({ value: r.id, label: r.region })).find(o => o.value === regionFilter) || null}
              onChange={(e: any) => { setRegionFilter(e?.value || ''); setPage(0); }}
              styles={selectSx} menuPortalTarget={document.body} placeholder="Region…" isClearable />
          </Box>
          <Box sx={{ minWidth: 150 }}>
            <Select options={(statuses || []).map(s => ({ value: s.id, label: s.status }))}
              value={(statuses || []).map(s => ({ value: s.id, label: s.status })).find(o => o.value === statusFilter) || null}
              onChange={(e: any) => { setStatusFilter(e?.value || ''); setPage(0); }}
              styles={selectSx} menuPortalTarget={document.body} placeholder="Status…" isClearable />
          </Box>
        </Paper>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <Paper elevation={0} className="glass-card" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: headBg }}>
                  {[
                    { label: '№', w: 50, center: true },
                    { label: 'Qeydalınma nömrəsi', w: 150 },
                    { label: 'Qeydalınma tarixi', w: 120 },
                    { label: 'Müraciət edənin SAA', w: 220 },
                    { label: 'Telefon nömrəsi', w: 160 },
                    { label: 'İcra müddəti (tarix)', w: 140 },
                    { label: 'İcraçı(lar)', w: 200 },
                    ...(canDelete ? [{ label: '', w: 54, center: true }] : []),
                  ].map((col, i) => (
                    <TableCell key={i} sx={{
                      width: col.w, color: textSecondary, fontWeight: 700, fontSize: '0.7rem',
                      textTransform: 'uppercase', letterSpacing: '0.07em', py: 1.6,
                      borderBottom: `1px solid ${borderColor}`, textAlign: (col as any).center ? 'center' : 'left',
                      whiteSpace: 'nowrap', bgcolor: 'transparent',
                    }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canDelete ? 9 : 8} sx={{ borderBottom: 'none', py: 10 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <InboxIcon sx={{ fontSize: 52, color: textSecondary, opacity: 0.3 }} />
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: textSecondary, opacity: 0.6 }}>
                          Heç bir müraciət tapılmadı
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : items.map((appeal, idx) => {
                  const initial = appeal.person ? appeal.person.charAt(0).toUpperCase() : null;
                  const phoneSource = appeal.phone;
                  const phoneList = phoneSource
                    ? phoneSource.split(',').map((p: string) => p.trim()).filter(Boolean)
                    : [];

                  const execData = appeal.executors || [];
                  const primaryExecutors = execData.filter((e: any) => e.is_primary);
                  const allNames = (primaryExecutors.length > 0 ? primaryExecutors : execData)
                    .map((e: any) => e.executor_name || e.executor)
                    .filter(Boolean);
                  const executorsDisplay = allNames.join(', ');

                  return (
                    <TableRow key={appeal.id} hover={!appeal.control}
                      onClick={() => canViewAppealDetails && navigate(`/appeals/${appeal.id}`)}
                      sx={{
                        cursor: 'pointer',
                        borderBottom: `1px solid ${borderColor}`,
                        '&:last-child': { borderBottom: 'none' },
                        bgcolor: appeal.is_deleted ? (isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)') : (appeal.control ? 'rgba(255, 235, 59, 0.12)' : 'transparent'),
                        opacity: appeal.is_deleted ? 0.9 : 1,
                        '&:hover': { bgcolor: appeal.is_deleted ? (isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.1)') : (appeal.control ? 'rgba(255, 235, 59, 0.18)' : rowHover) },
                        '& td': { py: 1.6, fontSize: '0.83rem', borderBottom: 'none', textDecoration: appeal.is_deleted ? 'line-through' : 'none' },
                      }}
                    >
                      {/* # */}
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.73rem', fontWeight: 700, color: textSecondary }}>
                          {page * rowsPerPage + idx + 1}
                        </Typography>
                      </TableCell>

                      {/* Qeydalınma nömrəsi */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {appeal.is_deleted && (
                            <Box sx={{
                              px: 0.8, py: 0.2, borderRadius: '4px', bgcolor: 'error.main', color: '#fff',
                              fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.02em'
                            }}>
                              SİLİNİB
                            </Box>
                          )}
                          {appeal.reg_num ? (
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: appeal.is_deleted ? 'error.main' : primary }}>
                              {appeal.reg_num}
                            </Typography>
                          ) : (
                            <Typography sx={{ color: textSecondary, opacity: 0.35, fontSize: '0.82rem' }}>–</Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Qeydalınma tarixi */}
                      <TableCell>
                        {appeal.reg_date ? (
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary }}>
                            {formatDateToDDMMYYYY(appeal.reg_date)}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: textSecondary, opacity: 0.35, fontSize: '0.82rem' }}>–</Typography>
                        )}
                      </TableCell>

                      {/* Müraciət edənin SAA */}
                      <TableCell>
                        {initial ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ width: 30, height: 30, borderRadius: '9px', background: `linear-gradient(135deg, ${primary} 0%, ${primary}99 100%)`, color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {initial}
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: textPrimary }}>{appeal.person}</Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ color: textSecondary, opacity: 0.35, fontSize: '0.82rem' }}>–</Typography>
                        )}
                      </TableCell>

                      {/* Telefon nömrəsi */}
                      <TableCell>
                        {phoneList.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                            {phoneList.map((p: string, i: number) => (
                              <Typography
                                key={i}
                                sx={{ fontSize: '0.82rem', color: textSecondary, fontWeight: 500, lineHeight: 1.2 }}
                              >
                                {p}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Typography sx={{ color: textSecondary, opacity: 0.35, fontSize: '0.82rem' }}>–</Typography>
                        )}
                      </TableCell>

                      {/* İcra müddəti (tarix) */}
                      <TableCell>
                        {appeal.exp_date ? (
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary }}>
                            {formatDateToDDMMYYYY(appeal.exp_date)}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: textSecondary, opacity: 0.35, fontSize: '0.82rem' }}>–</Typography>
                        )}
                      </TableCell>

                      {/* İcraçı(lar) */}
                      <TableCell>
                        {executorsDisplay ? (
                          <Typography sx={{ fontSize: '0.8rem', color: textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                            {executorsDisplay}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: '0.8rem', color: textSecondary, opacity: 0.35 }}>
                            –
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      {canDelete && (
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {appeal.is_deleted ? (
                              <Tooltip title="Geri qaytar" arrow placement="left">
                                <IconButton size="small" onClick={() => setRestoreTargetId(appeal.id)}
                                  sx={{
                                    width: 30, height: 30, color: '#10b981', bgcolor: 'rgba(16,185,129,0.08)', borderRadius: '8px',
                                    '&:hover': { bgcolor: 'rgba(16,185,129,0.16)', transform: 'scale(1.08)' }, transition: 'all 0.18s'
                                  }}>
                                  <HourglassTopIcon sx={{ fontSize: 15, transform: 'rotate(180deg)' }} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Sil" arrow placement="left">
                                <IconButton size="small" onClick={() => setDeleteTargetId(appeal.id)}
                                  sx={{
                                    width: 30, height: 30, color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)', borderRadius: '8px',
                                    '&:hover': { bgcolor: 'rgba(239,68,68,0.16)', transform: 'scale(1.08)' }, transition: 'all 0.18s'
                                  }}>
                                  <DeleteIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ borderTop: `1px solid ${borderColor}` }}>
            <TablePagination component="div" count={total} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[25, 50, 100]}
              labelRowsPerPage="Səhifəyə:"
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem', fontWeight: 600, color: textSecondary },
                '& .MuiTablePagination-select': { color: textPrimary },
                '& .MuiIconButton-root': { color: textSecondary },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* ── Delete confirm dialog ─────────────────────────────────────── */}
      <Dialog open={deleteTargetId !== null} onClose={() => !deleteMutation.isPending && setDeleteTargetId(null)}
        maxWidth="xs" fullWidth
        PaperProps={{ elevation: 0, sx: { bgcolor: isDark ? '#1a2035' : '#ffffff', border: `1px solid ${borderColor}`, borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ pt: 3, px: 3, fontWeight: 800, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DeleteIcon sx={{ color: 'error.main', fontSize: 19 }} />
          </Box>
          Müraciəti Sil
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <DialogContentText sx={{ fontSize: '0.875rem', color: textSecondary, lineHeight: 1.75 }}>
            Bu müraciəti silmək istədiyinizə əminsinizmi?<br />
            <Box component="span" sx={{ fontWeight: 700, color: 'warning.main' }}>Qeyd: </Box>
            Müraciət yalnız arxivlənəcək, tamamilə silinməyəcəkdir.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteTargetId(null)} disabled={deleteMutation.isPending}
            sx={{ borderRadius: '10px', fontWeight: 700, borderColor: borderColor, color: textSecondary, '&:hover': { borderColor: textSecondary } }}>
            Ləğv et
          </Button>
          <Button variant="contained" color="error"
            onClick={() => deleteTargetId !== null && deleteMutation.mutate(deleteTargetId)}
            disabled={deleteMutation.isPending} startIcon={<DeleteIcon />}
            sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#ef4444', boxShadow: '0 4px 14px rgba(239,68,68,0.35)', '&:hover': { bgcolor: '#dc2626' } }}>
            {deleteMutation.isPending ? 'Silinir…' : 'Bəli, Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Restore confirm dialog ─────────────────────────────────────── */}
      <Dialog open={restoreTargetId !== null} onClose={() => !restoreMutation.isPending && setRestoreTargetId(null)}
        maxWidth="xs" fullWidth
        PaperProps={{ elevation: 0, sx: { bgcolor: isDark ? '#1a2035' : '#ffffff', border: `1px solid ${borderColor}`, borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ pt: 3, px: 3, fontWeight: 800, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HourglassTopIcon sx={{ color: 'success.main', fontSize: 19, transform: 'rotate(180deg)' }} />
          </Box>
          Müraciəti Geri Qaytar
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <DialogContentText sx={{ fontSize: '0.875rem', color: textSecondary, lineHeight: 1.75 }}>
            Bu müraciəti geri qaytarmaq istədiyinizə əminsinizmi?<br />
            Müraciət yenidən aktiv siyahıda görünəcəkdir.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setRestoreTargetId(null)} disabled={restoreMutation.isPending}
            sx={{ borderRadius: '10px', fontWeight: 700, borderColor: borderColor, color: textSecondary, '&:hover': { borderColor: textSecondary } }}>
            Ləğv et
          </Button>
          <Button variant="contained" color="success"
            onClick={() => restoreTargetId !== null && restoreMutation.mutate(restoreTargetId)}
            disabled={restoreMutation.isPending} startIcon={<HourglassTopIcon sx={{ transform: 'rotate(180deg)' }} />}
            sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#10b981', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', '&:hover': { bgcolor: '#059669' } }}>
            {restoreMutation.isPending ? 'Qaytarılır…' : 'Bəli, Qaytar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
