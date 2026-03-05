import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import Layout from '../components/Layout';
import { sendFeedback } from '../api/feedback';

export default function FeedbackPage() {
  const [category, setCategory] = useState<'teklif' | 'irad' | 'digər'>('teklif');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Zəhmət olmasa təklif və ya iradınızı yazın.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendFeedback({ message: message.trim(), category });
      setSuccess('Mesajınız uğurla göndərildi. Təşəkkür edirik!');
      setMessage('');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Mesaj göndərilərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 900, mx: 'auto' }} className="animate-fade-in">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FeedbackIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Təklif və İradlar
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
              Sistemin daha da yaxşılaşması üçün rəy və təkliflərinizi bizimlə bölüşün.
            </Typography>
          </Box>
        </Box>

        <Paper
          className="glass-card"
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
            Mesaj növü
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={category}
            onChange={(_, val) => {
              if (val) setCategory(val);
            }}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="teklif">Təklif</ToggleButton>
            <ToggleButton value="irad">İrad</ToggleButton>
            <ToggleButton value="digər">Digər</ToggleButton>
          </ToggleButtonGroup>

          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
            Mesajınız
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Buraya təklif və ya iradınızı yazın..."
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Göndərilir...' : 'Göndər'}
            </Button>
          </Box>
        </Paper>

        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          Qeyd: Təklif və iradlarınız yalnız sistem administratorları və super administratorlar
          tərəfindən görüləcək.
        </Typography>
      </Box>
    </Layout>
  );
}

