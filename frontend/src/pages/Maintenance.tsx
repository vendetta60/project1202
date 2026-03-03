import { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getPublicMaintenanceStatus } from '../api/users';

export default function Maintenance() {
  const navigate = useNavigate();

  // Texniki rejim söndürülən kimi avtomatik login səhifəsinə at
  useEffect(() => {
    let interval: number | undefined;

    const checkStatus = async () => {
      try {
        const status = await getPublicMaintenanceStatus();
        if (!status.enabled) {
          navigate('/login', { replace: true });
        }
      } catch {
        // status alınmasa, sakitcə davam et
      }
    };

    // ilk açılışda da yoxla
    void checkStatus();
    interval = window.setInterval(checkStatus, 5000);

    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f172a',
        color: '#e5e7eb',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 480 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em' }}
        >
          Texniki təmir işləri aparılır
        </Typography>
        <Typography sx={{ mb: 4, color: 'rgba(148,163,184,0.9)' }}>
          Sistemdə hazırda yeniləmə və texniki xidmət işləri görülür. Xahiş edirik
          bir müddət sonra yenidən yoxlayasınız.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
        >
          Giriş səhifəsinə qayıt
        </Button>
      </Box>
    </Box>
  );
}

