import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/auth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const getUserName = () => {
    if (!user) return '';
    if (user.surname && user.name) return `${user.surname} ${user.name}`;
    return user.username;
  };

  const menuItems = [
    { label: 'ANA SƏHİFƏ', path: '/', icon: <DashboardIcon /> },
    { label: 'MÜRACİƏTLƏR', path: '/appeals', icon: <DescriptionIcon /> },
    { label: 'VƏTƏNDAŞlar', path: '/citizens', icon: <PeopleAltIcon /> },
    { label: 'HESABATLAR', path: '/reports', icon: <AssessmentIcon /> },
  ];

  const adminItems = [
    { label: 'MERKEZİ İDARƏETMƏ', path: '/admin', icon: <SettingsIcon /> },
    { label: 'İSTİFADƏÇİLƏR', path: '/admin/users', icon: <PeopleIcon /> },
    { label: 'LOGLAR', path: '/admin/logs', icon: <HistoryIcon /> },
    { label: 'PARAMETRLƏR', path: '/admin/parameters', icon: <SettingsIcon /> },
  ];

  const SIDEBAR_WIDTH = 260;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #2d3a1a 0%, #3e4a21 100%)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            pt: 2,
          },
        }}
      >
        {/* Logo / Title */}
        <Box sx={{ px: 2.5, mb: 3, cursor: 'pointer' }} onClick={() => navigate('/')}>
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

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        {/* Main Menu */}
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  color: '#fff',
                  '&:hover': {
                    bgcolor: 'rgba(166, 139, 68, 0.2)',
                    color: '#a68b44',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Admin Section */}
        {user?.is_admin && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
            <Typography
              variant="caption"
              sx={{
                px: 2.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.5px',
              }}
            >
              Admin
            </Typography>
            <List sx={{ px: 1, mt: 1 }}>
              {adminItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      color: '#fff',
                      '&:hover': {
                        bgcolor: 'rgba(166, 139, 68, 0.2)',
                        color: '#a68b44',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Footer spacer */}
        <Box sx={{ flex: 1 }} />

        {/* User Info */}
        {user && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ p: 2.5 }}>
              <Button
                fullWidth
                color="inherit"
                startIcon={<AccountCircleIcon />}
                onClick={handleMenu}
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  justifyContent: 'flex-start',
                  mb: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {getUserName()}
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
                    border: '1px solid rgba(62, 74, 33, 0.1)',
                  }
                }}
              >
                <MenuItem disabled sx={{ py: 1.5 }}>
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 800 }}>
                      SƏLAHİYYƏT
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#3e4a21' }}>
                      {user.is_admin ? 'Adminstrator' : 'İstifadəçi'}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#d32f2f', fontWeight: 700 }}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} />
                  ÇIXIŞ
                </MenuItem>
              </Menu>
            </Box>
          </>
        )}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'linear-gradient(90deg, #3e4a21 0%, #2c3e50 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
              Müraciət Qeydiyyat Sistemi
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
