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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 0, cursor: 'pointer', fontWeight: 600, mr: 4 }}
            onClick={() => navigate('/dashboard')}
          >
            Müraciət Qeydiyyatı
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Ana səhifə
            </Button>
            <Button
              color="inherit"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/appeals')}
            >
              Müraciətlər
            </Button>
            {/* Vətəndaşlar ayrıca idarə olunmur, birbaşa müraciət formunda daxil edilir */}
            {user?.is_admin && (
              <>
                <Button
                  color="inherit"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  İstifadəçilər
                </Button>
                <Button
                  color="inherit"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/admin/parameters')}
                >
                  Parametrlər
                </Button>
              </>
            )}
          </Box>

          {user && (
            <>
              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                onClick={handleMenu}
              >
                {user.full_name}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user.org_unit?.name || 'Admin'}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                  Çıxış
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
