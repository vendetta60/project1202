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
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PaletteIcon from '@mui/icons-material/Palette';
import { useTheme } from '../context/ThemeContext';
import { PRESET_COLORS } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

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
  const { sidebarCollapsed, toggleSidebar, mode, toggleMode, primaryColor, setPrimaryColor } = useTheme();
  const muiTheme = useMuiTheme();
  const queryClient = useQueryClient();
  const {
    isAdmin, user,
    canViewAppeals, canExportAppeals, canViewUsers,
  } = usePermissions();

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
  const allMenuItems = [
    { label: 'ANA SƏHİFƏ', path: '/', icon: <DashboardIcon />, always: true },
    { label: 'MÜRACİƏTLƏR', path: '/appeals', icon: <DescriptionIcon />, show: canViewAppeals },
    { label: 'HESABATLAR', path: '/reports', icon: <AssessmentIcon />, show: canExportAppeals },
  ];
  const menuItems = allMenuItems.filter(i => i.always || i.show);

  // Admin sidebar items
  const allAdminItems = [
    { label: 'MERKEZİ İDARƏETMƏ', path: '/admin', icon: <SettingsIcon />, show: isAdmin },
    { label: 'İSTİFADƏÇİLƏR', path: '/admin/users', icon: <PeopleIcon />, show: canViewUsers },
    { label: 'LOGLAR', path: '/admin/logs', icon: <HistoryIcon />, show: isAdmin },
    { label: 'PARAMETRLƏR', path: '/admin/parameters', icon: <SettingsIcon />, show: isAdmin },
  ];
  const adminItems = allAdminItems.filter(i => i.show);
  const showAdminSection = adminItems.length > 0;

  const drawerWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const isDark = mode === 'dark';

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);
  const sidebarBg = isDark
    ? 'linear-gradient(175deg, #131825 0%, #0f1320 60%, #12192e 100%)'
    : `linear-gradient(175deg, ${primaryColor} 0%, ${primaryColor}e8 55%, ${primaryColor}cc 100%)`;
  const appBarBg = isDark
    ? 'rgba(13,17,23,0.95)'
    : 'rgba(255,255,255,0.92)';
  const appBarColor = isDark ? '#e8ecf4' : '#1a1f36';
  const contentBg = isDark ? '#0d1117' : '#f0f2f8';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: contentBg }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: sidebarBg,
            borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            pt: 2,
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Logo / Title + Toggle */}
        <Box sx={{ px: sidebarCollapsed ? 1.5 : 2.5, mb: 2, display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', gap: 1 }}>
          {!sidebarCollapsed && (
            <Box sx={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => navigate('/')}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(45deg, #ffffff 30%, #a68b44 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '0.9rem',
                }}
              >
                Müraciət<br />Qeydiyyatı
              </Typography>
            </Box>
          )}
          <IconButton
            size="small"
            onClick={toggleSidebar}
            sx={{ color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}
            aria-label={sidebarCollapsed ? 'Menyunu aç' : 'Menyunu yığ'}
          >
            {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

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
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    bgcolor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                    boxShadow: active ? '0 2px 12px rgba(0,0,0,0.18)' : 'none',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.13)',
                      color: '#fff',
                    },
                    transition: 'all 0.2s ease',
                    py: 1.1,
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: sidebarCollapsed ? 0 : 38, justifyContent: 'center', fontSize: 20 }}>
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: active ? 800 : 600, letterSpacing: '0.4px' }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {showAdminSection && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
            {!sidebarCollapsed && (
              <Typography variant="caption" sx={{ px: 2.5, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>
                Admin
              </Typography>
            )}
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
                        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                        bgcolor: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.10)', color: '#fff' },
                        transition: 'all 0.2s ease',
                        py: 1,
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: sidebarCollapsed ? 0 : 38, justifyContent: 'center' }}>
                        {item.icon}
                      </ListItemIcon>
                      {!sidebarCollapsed && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: active ? 800 : 600, letterSpacing: '0.3px' }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Theme: Dark/Light + Color */}
        <Box sx={{ px: sidebarCollapsed ? 1 : 2, py: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <Tooltip title={isDark ? 'Açıq rejim' : 'Qaranlıq rejim'}>
            <IconButton size="small" onClick={toggleMode} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Rəngi dəyiş">
            <IconButton size="small" onClick={handleColorMenuOpen} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              <PaletteIcon />
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
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'transform 0.15s',
                  }}
                />
              ))}
            </Box>
          </Menu>
        </Box>

        {user && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ p: sidebarCollapsed ? 1.5 : 2.5 }}>
              <Button
                fullWidth
                color="inherit"
                startIcon={!sidebarCollapsed && <AccountCircleIcon />}
                onClick={handleMenu}
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  minWidth: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
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
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: contentBg }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: appBarBg,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,31,54,0.08)'}`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: appBarColor, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
              Müraciət Qeydiyyat Sistemi
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
