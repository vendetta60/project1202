import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export default function Forbidden() {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 3, md: 6 },
      }}
      className="page-enter"
    >
      <Paper elevation={0} className="glass-card" sx={{ p: { xs: 3, md: 5 }, borderRadius: '20px' }}>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-0.03em' }}>
          403
        </Typography>
        <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
          İcazə yoxdur
        </Typography>
        <Typography sx={{ mt: 1.2, color: 'text.secondary', fontWeight: 500, lineHeight: 1.8 }}>
          Bu səhifəyə daxil olmaq üçün icazəniz yoxdur.
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {authed ? (
            <Button variant="contained" onClick={() => navigate('/dashboard', { replace: true })} sx={{ borderRadius: '10px', fontWeight: 800 }}>
              Dashboard
            </Button>
          ) : (
            <Button variant="contained" onClick={() => navigate('/login', { replace: true })} sx={{ borderRadius: '10px', fontWeight: 800 }}>
              Login
            </Button>
          )}
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: '10px', fontWeight: 800 }}>
            Geri qayıt
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

