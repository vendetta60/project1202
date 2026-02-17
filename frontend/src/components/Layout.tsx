import { AppBar, Toolbar, Typography, Button, Container, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/auth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
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

  // Helper to show name
  const getUserName = () => {
    if (!user) return '';
    if (user.surname && user.name) return `${user.surname} ${user.name}`;
    return user.username;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'transparent' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, #3e4a21 0%, #2c3e50 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                cursor: 'pointer',
                fontWeight: 900,
                mr: 6,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                background: 'linear-gradient(45deg, #ffffff 30%, #a68b44 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              onClick={() => navigate('/')}
            >
              Müraciət Qeydiyyatı
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {[
                { label: 'ANA SƏHİFƏ', path: '/', icon: <DashboardIcon fontSize="small" /> },
                { label: 'MÜRACİƏTLƏR', path: '/appeals', icon: <DescriptionIcon fontSize="small" /> },
                { label: 'HESABATLAR', path: '/reports', icon: <AssessmentIcon fontSize="small" /> },
              ].map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: '0.8rem',
                    letterSpacing: '0.5px',
                    fontWeight: 700,
                    opacity: 0.85,
                    borderBottom: '2px solid transparent',
                    borderRadius: 0,
                    '&:hover': {
                      opacity: 1,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      borderBottom: '2px solid #a68b44',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {user?.is_admin && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<PeopleIcon fontSize="small" />}
                    onClick={() => navigate('/admin/users')}
                    sx={{
                      px: 2,
                      py: 1,
                      fontSize: '0.8rem',
                      letterSpacing: '0.5px',
                      fontWeight: 700,
                      opacity: 0.85,
                      borderBottom: '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        borderBottom: '2px solid #a68b44',
                      },
                    }}
                  >
                    İSTİFADƏÇİLƏR
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<HistoryIcon fontSize="small" />}
                    onClick={() => navigate('/admin/logs')}
                    sx={{
                      px: 2,
                      py: 1,
                      fontSize: '0.8rem',
                      letterSpacing: '0.5px',
                      fontWeight: 700,
                      opacity: 0.85,
                      borderBottom: '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        borderBottom: '2px solid #a68b44',
                      },
                    }}
                  >
                    LOGLAR
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<SettingsIcon fontSize="small" />}
                    onClick={() => navigate('/admin/parameters')}
                    sx={{
                      px: 2,
                      py: 1,
                      fontSize: '0.8rem',
                      letterSpacing: '0.5px',
                      fontWeight: 700,
                      opacity: 0.85,
                      borderBottom: '2px solid transparent',
                      borderRadius: 0,
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        borderBottom: '2px solid #a68b44',
                      },
                    }}
                  >
                    PARAMETRLƏR
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                onClick={handleMenu}
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  px: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
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
                    minWidth: 180,
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
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  ÇIXIŞ
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
