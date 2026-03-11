import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  useTheme as useMuiTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import logo from '../assets/logo.png';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import { useQueryClient } from '@tanstack/react-query';
import { changePassword } from '../api/auth';
import LockResetIcon from '@mui/icons-material/LockReset';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PaletteIcon from '@mui/icons-material/Palette';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import { useTheme } from '../context/ThemeContext';
import { PRESET_COLORS } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { getPublicMaintenanceStatus } from '../api/users';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

type NavItemConfig = {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  always?: boolean;
  show?: boolean;
};

const MENU_VISIBILITY_KEY = 'app_menu_visible_ids_v1';
const ADMIN_VISIBILITY_KEY = 'app_admin_visible_ids_v1';
const MAIN_COLLAPSE_KEY = 'app_menu_main_collapsed_v1';
const ADMIN_COLLAPSE_KEY = 'app_menu_admin_collapsed_v1';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [colorMenuEl, setColorMenuEl] = useState<null | HTMLElement>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { sidebarCollapsed, mode, toggleMode, primaryColor, setPrimaryColor } = useTheme();
  const muiTheme = useMuiTheme();
  const queryClient = useQueryClient();
  const {
    isAdmin, user, isSuperAdmin,
    canViewAppeals, canExportAppeals, canViewUsers,
  } = usePermissions();
  const [maintenanceSecondsLeft, setMaintenanceSecondsLeft] = useState<number | null>(null);
  const [menuSettingsOpen, setMenuSettingsOpen] = useState(false);

  const [visibleMenuIds, setVisibleMenuIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(MENU_VISIBILITY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [visibleAdminIds, setVisibleAdminIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(ADMIN_VISIBILITY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [mainSectionCollapsed, setMainSectionCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(MAIN_COLLAPSE_KEY) === '1';
  });

  const [adminSectionCollapsed, setAdminSectionCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(ADMIN_COLLAPSE_KEY) === '1';
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleColorMenuOpen = (e: React.MouseEvent<HTMLElement>) => setColorMenuEl(e.currentTarget);
  const handleColorMenuClose = () => setColorMenuEl(null);

  const handleLogout = () => {
    queryClient.clear();
    removeToken();
    window.location.href = '/login';
  };

  const openPasswordDialog = () => {
    setPasswordDialogOpen(true);
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordError('');
    setPasswordSuccess(false);
    handleClose();
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword.trim()) {
      setPasswordError('Cari şifrəni daxil edin');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Yeni şifrə ən azı 6 simvol olmalıdır');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Yeni şifrə və təsdiq üst-üstə düşmür');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Şifrə dəyişdirilə bilmədi');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getUserName = () => {
    if (!user) return '';
    if (user.surname && user.name) return `${user.surname} ${user.name}`;
    return user.username;
  };

  // Filter menu items based on permissions
  const allMenuItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'ANA SƏHİFƏ', path: '/dashboard', icon: <DashboardIcon />, always: true },
    { id: 'appeals', label: 'MÜRACİƏTLƏR', path: '/appeals', icon: <DescriptionIcon />, show: canViewAppeals },
    { id: 'reports', label: 'HESABATLAR', path: '/reports', icon: <AssessmentIcon />, show: canExportAppeals },
    { id: 'feedback', label: 'TƏKLİF VƏ İRADLAR', path: '/feedback', icon: <DescriptionIcon />, always: true },
  ];
  const permittedMenuItems = allMenuItems.filter(i => i.always || i.show);

  // Admin sidebar items
  const allAdminItems: NavItemConfig[] = [
    { id: 'admin-center', label: 'MERKEZİ İDARƏETMƏ', path: '/admin', icon: <SettingsIcon />, show: isAdmin },
    { id: 'admin-users', label: 'İSTİFADƏÇİLƏR', path: '/admin/users', icon: <PeopleIcon />, show: canViewUsers },
    { id: 'admin-logs', label: 'LOGLAR', path: '/admin/logs', icon: <HistoryIcon />, show: isAdmin },
    { id: 'admin-parameters', label: 'PARAMETRLƏR', path: '/admin/parameters', icon: <SettingsIcon />, show: isAdmin },
  ];
  const permittedAdminItems = allAdminItems.filter(i => i.show);

  const menuItems = permittedMenuItems.filter((item) => {
    if (visibleMenuIds.length === 0) return true;
    return visibleMenuIds.includes(item.id);
  });

  const adminItems = permittedAdminItems.filter((item) => {
    if (visibleAdminIds.length === 0) return true;
    return visibleAdminIds.includes(item.id);
  });
  const showAdminSection = adminItems.length > 0;

  const drawerWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const isDark = mode === 'dark';

  const handleToggleMenuVisibility = (id: string, section: 'main' | 'admin') => {
    if (section === 'main') {
      const baseIds = permittedMenuItems.map(i => i.id);
      const current = visibleMenuIds.length === 0 ? baseIds : visibleMenuIds;
      const targetItem = permittedMenuItems.find(i => i.id === id);
      if (targetItem?.always) {
        return;
      }
      const exists = current.includes(id);
      const next = exists ? current.filter(x => x !== id) : [...current, id];
      setVisibleMenuIds(next);
    } else {
      const baseIds = permittedAdminItems.map(i => i.id);
      const current = visibleAdminIds.length === 0 ? baseIds : visibleAdminIds;
      const exists = current.includes(id);
      const next = exists ? current.filter(x => x !== id) : [...current, id];
      setVisibleAdminIds(next);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MENU_VISIBILITY_KEY, JSON.stringify(visibleMenuIds));
    } catch {
      // ignore
    }
  }, [visibleMenuIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ADMIN_VISIBILITY_KEY, JSON.stringify(visibleAdminIds));
    } catch {
      // ignore
    }
  }, [visibleAdminIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MAIN_COLLAPSE_KEY, mainSectionCollapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [mainSectionCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ADMIN_COLLAPSE_KEY, adminSectionCollapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [adminSectionCollapsed]);

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  // Texniki rejim: hər səhifə dəyişikliyində statusu yoxla (real‑time yox, amma dərhal reaksiya).
  useEffect(() => {
    if (!user || isAdmin || isSuperAdmin) {
      setMaintenanceSecondsLeft(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const status = await getPublicMaintenanceStatus();
        if (cancelled) return;

        if (status.enabled && typeof status.seconds_until_logout === 'number') {
          if (status.seconds_until_logout <= 0) {
            queryClient.clear();
            removeToken();
            window.location.href = '/maintenance';
          } else {
            setMaintenanceSecondsLeft(status.seconds_until_logout);
          }
        } else {
          setMaintenanceSecondsLeft(null);
        }
      } catch {
        if (!cancelled) {
          setMaintenanceSecondsLeft(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, isSuperAdmin, queryClient, location.pathname]);

  // Texniki rejim taymeri: serverdən gələn saniyə dəyərini frontda hər saniyə azaldırıq.
  useEffect(() => {
    if (maintenanceSecondsLeft === null) return;

    if (maintenanceSecondsLeft <= 0) {
      if (user && !isAdmin && !isSuperAdmin) {
        queryClient.clear();
        removeToken();
        window.location.href = '/maintenance';
      }
      return;
    }

    const id = window.setInterval(() => {
      setMaintenanceSecondsLeft(prev => (prev === null ? prev : prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [maintenanceSecondsLeft, user, isAdmin, isSuperAdmin, queryClient]);

  // İlk giriş: parol dəyişməyənə qədər yalnız /change-password səhifəsinə icazə
  if (user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  const formatCountdown = (totalSeconds: number) => {
    const s = Math.max(0, totalSeconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const mm = m.toString().padStart(2, '0');
    const ss = sec.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const sidebarBg = isDark ? '#020617' : '#ffffff';
  const sidebarBorder = isDark ? 'rgba(15,23,42,0.9)' : 'rgba(203,213,225,0.9)';
  const sidebarText = isDark ? '#e5e7eb' : '#111827';
  const sidebarSecondaryText = isDark ? 'rgba(148,163,184,0.9)' : 'rgba(100,116,139,0.95)';
  const sidebarActiveBg = isDark ? 'rgba(148,163,184,0.16)' : `${primaryColor}1A`;
  const sidebarHoverBg = isDark ? 'rgba(148,163,184,0.12)' : '#f3f4f6';

  const appBarBg = isDark ? '#0b1120' : '#ffffff';
  const appBarColor = isDark ? '#f8fafc' : '#111827';
  const contentBg = isDark ? '#020617' : '#f3f4f6';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: contentBg }}>
      <Drawer
        variant="permanent"
        className="no-print"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: sidebarBg,
            borderRight: `1px solid ${sidebarBorder}`,
            color: sidebarText,
            pt: 2,
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Logo / Title + Toggle */}
        <Box sx={{ px: sidebarCollapsed ? 1 : 2, mb: 1.5, mt: 1, display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              overflow: 'hidden',
              width: '100%'
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src={logo}
              alt="Vətəndaş müraciətlərinin elektron qeydiyyatı"
              sx={{
                height: 36,
                width: 'auto',
                flexShrink: 0,
              }}
            />
            {!sidebarCollapsed && (
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    lineHeight: 1.2,
                    color: sidebarText,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase'
                  }}
                >
                  Vətəndaş müraciətlərinin<br />elektron qeydiyyatı
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />

        {/* Main navigation section header */}
        <Box
          sx={{
            px: sidebarCollapsed ? 1.5 : 2.5,
            mb: mainSectionCollapsed ? 0 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          }}
        >
          {!sidebarCollapsed && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                color: sidebarSecondaryText,
                letterSpacing: '0.5px',
              }}
            >
              Əsas menyu
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={() => setMainSectionCollapsed(prev => !prev)}
            sx={{ color: sidebarSecondaryText }}
          >
            {mainSectionCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
          </IconButton>
        </Box>

        {!mainSectionCollapsed && (
          <List sx={{ px: 1.5 }}>
            {menuItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '12px',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      color: sidebarText,
                      bgcolor: active ? sidebarActiveBg : 'transparent',
                      borderLeft: active && !sidebarCollapsed ? `3px solid ${primaryColor}` : '3px solid transparent',
                      opacity: active ? 1 : 0.9,
                      '&:hover': {
                        bgcolor: sidebarHoverBg,
                        opacity: 1,
                      },
                      transition: 'background-color 0.18s ease, border-color 0.18s ease',
                      py: 1.05,
                    }}
                  >
                    <ListItemIcon sx={{ color: active ? primaryColor : sidebarSecondaryText, minWidth: sidebarCollapsed ? 0 : 38, justifyContent: 'center', fontSize: 20 }}>
                      {item.icon}
                    </ListItemIcon>
                    {!sidebarCollapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.8rem',
                          fontWeight: active ? 800 : 600,
                          letterSpacing: '0.04em',
                          color: active ? sidebarText : sidebarSecondaryText,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}

        {showAdminSection && (
          <>
            <Divider sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.9)', my: 2 }} />
            <Box
              sx={{
                px: sidebarCollapsed ? 1.5 : 2.5,
                mt: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              }}
            >
              {!sidebarCollapsed && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: sidebarSecondaryText,
                    letterSpacing: '0.5px',
                  }}
                >
                  Admin
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => setAdminSectionCollapsed(prev => !prev)}
                sx={{ color: sidebarSecondaryText }}
              >
                {adminSectionCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
              </IconButton>
            </Box>
            {!adminSectionCollapsed && (
              <List sx={{ px: 1.5, mt: 1 }}>
                {adminItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: '12px',
                          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                          color: sidebarText,
                          bgcolor: active ? sidebarActiveBg : 'transparent',
                          borderLeft: active && !sidebarCollapsed ? `3px solid ${primaryColor}` : '3px solid transparent',
                          opacity: active ? 1 : 0.9,
                          '&:hover': {
                            bgcolor: sidebarHoverBg,
                            opacity: 1,
                          },
                          transition: 'background-color 0.18s ease, border-color 0.18s ease',
                          py: 1,
                        }}
                      >
                        <ListItemIcon sx={{ color: active ? primaryColor : sidebarSecondaryText, minWidth: sidebarCollapsed ? 0 : 38, justifyContent: 'center' }}>
                          {item.icon}
                        </ListItemIcon>
                        {!sidebarCollapsed && (
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: '0.78rem',
                              fontWeight: active ? 800 : 600,
                              letterSpacing: '0.04em',
                              color: active ? sidebarText : sidebarSecondaryText,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Theme: Dark/Light + Color + Menu settings */}
        <Box sx={{ px: sidebarCollapsed ? 1 : 2, py: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <Tooltip title={isDark ? 'Açıq rejim' : 'Qaranlıq rejim'}>
            <IconButton
              size="small"
              onClick={toggleMode}
              sx={{ color: isDark ? 'rgba(248,250,252,0.9)' : 'rgba(15,23,42,0.7)' }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Rəngi dəyiş">
            <IconButton
              size="small"
              onClick={handleColorMenuOpen}
              sx={{ color: isDark ? 'rgba(248,250,252,0.9)' : 'rgba(15,23,42,0.7)' }}
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Menyunu şəxsiləşdir">
            <IconButton
              size="small"
              onClick={() => setMenuSettingsOpen(true)}
              sx={{ color: isDark ? 'rgba(248,250,252,0.9)' : 'rgba(15,23,42,0.7)' }}
            >
              <TuneIcon />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={colorMenuEl} open={Boolean(colorMenuEl)} onClose={handleColorMenuClose} PaperProps={{ sx: { mt: 1.5, p: 1 } }}>
            <Typography variant="caption" sx={{ px: 1.5, fontWeight: 700, color: 'text.secondary' }}>RƏNG SEÇİMİ</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', p: 1, minWidth: 180 }}>
              {PRESET_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => { setPrimaryColor(c); handleColorMenuClose(); }}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: c,
                    border: primaryColor === c ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    '&:hover': {},
                    transition: 'transform 0.15s',
                  }}
                />
              ))}
            </Box>
          </Menu>
        </Box>

        {user && (
          <>
            <Divider sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.9)' }} />
            <Box sx={{ p: sidebarCollapsed ? 1.5 : 2.5 }}>
              <Button
                fullWidth
                color="inherit"
                startIcon={!sidebarCollapsed && (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: `2px solid ${isDark ? 'rgba(248,250,252,0.6)' : 'rgba(148,163,184,0.85)'}`,
                        boxShadow: isDark
                          ? '0 0 0 3px rgba(15,23,42,0.8)'
                          : '0 0 0 2px rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                    <AccountCircleIcon sx={{ fontSize: 20 }} />
                  </Box>
                )}
                onClick={handleMenu}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  minWidth: 0,
                  borderRadius: '10px',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' },
                }}
              >
                {sidebarCollapsed ? <AccountCircleIcon /> : getUserName()}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)',
                    border: '1px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <MenuItem disabled sx={{ py: 1.5 }}>
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 800 }}>SƏLAHİYYƏT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: muiTheme.palette.primary.main }}>{user.is_admin ? 'Adminstrator' : 'İstifadəçi'}</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={openPasswordDialog} sx={{ py: 1.5, fontWeight: 600 }}>
                  <LockResetIcon sx={{ mr: 1.5, fontSize: 18 }} />
                  Parolunu dəyiş
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main', fontWeight: 700 }}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} />
                  ÇIXIŞ
                </MenuItem>
              </Menu>
            </Box>
          </>
        )}

        <Dialog open={passwordDialogOpen} onClose={() => !passwordLoading && setPasswordDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Parolunu dəyiş</DialogTitle>
          <DialogContent>
            {passwordSuccess ? (
              <Alert severity="success" sx={{ mt: 1 }}>Şifrə uğurla dəyişdirildi</Alert>
            ) : (
              <>
                {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
                <TextField fullWidth label="Cari şifrə" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} margin="normal" size="small" autoComplete="current-password" />
                <TextField fullWidth label="Yeni şifrə" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} margin="normal" size="small" autoComplete="new-password" helperText="Ən azı 6 simvol" />
                <TextField fullWidth label="Yeni şifrəni təsdiq et" type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} margin="normal" size="small" autoComplete="new-password" />
              </>
            )}
          </DialogContent>
          {!passwordSuccess && (
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setPasswordDialogOpen(false)} disabled={passwordLoading}>Ləğv et</Button>
              <Button variant="contained" onClick={handleChangePassword} disabled={passwordLoading}>{passwordLoading ? 'Göndərilir...' : 'Dəyişdir'}</Button>
            </DialogActions>
          )}
        </Dialog>
        <Dialog
          open={menuSettingsOpen}
          onClose={() => setMenuSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Menyu tənzimləmələri</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Əsas menyu
            </Typography>
            {permittedMenuItems.map((item) => {
              const allIds = permittedMenuItems.map(i => i.id);
              const baseVisible = visibleMenuIds.length === 0 ? allIds : visibleMenuIds;
              const checked = item.always ? true : baseVisible.includes(item.id);
              return (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked}
                      onChange={() => handleToggleMenuVisibility(item.id, 'main')}
                      disabled={item.always}
                    />
                  }
                  label={item.label}
                />
              );
            })}

            {permittedAdminItems.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Admin menyusu
                </Typography>
                {permittedAdminItems.map((item) => {
                  const allIds = permittedAdminItems.map(i => i.id);
                  const baseVisible = visibleAdminIds.length === 0 ? allIds : visibleAdminIds;
                  const checked = baseVisible.includes(item.id);
                  return (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => handleToggleMenuVisibility(item.id, 'admin')}
                        />
                      }
                      label={item.label}
                    />
                  );
                })}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setMenuSettingsOpen(false)}>Bağla</Button>
          </DialogActions>
        </Dialog>
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: contentBg }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: appBarBg,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,31,54,0.07)'}`,
            backdropFilter: isDark ? 'blur(18px)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(18px)' : 'none',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: appBarColor, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
            </Typography>
            {maintenanceSecondsLeft !== null && maintenanceSecondsLeft > 0 && !isAdmin && !isSuperAdmin && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: 'rgba(248, 250, 252, 0.06)',
                  border: '1px solid rgba(248, 250, 252, 0.25)',
                  color: appBarColor,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Texniki təmir: {formatCountdown(maintenanceSecondsLeft)} sonra sistemdən çıxacaqsınız
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1 }}>{children}</Box>
          <Box
            className="no-print"
            sx={{
              mt: 2,
              pt: 1.5,
              borderTop: `1px solid ${isDark ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.4)'}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'text.secondary' }}>
              Bizimlə əlaqə: Telefon 10-195
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
             ©Program təminatı şöbəsi
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
