import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  onClick?: () => void;
}

export default function StatCard({ title, value, icon, color = '#1976d2', onClick }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className="animate-slide-up glass-card"
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: onClick ? 'translateY(-8px)' : 'none',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12) !important',
          '& .stat-icon-bg': {
            transform: 'scale(1.1) rotate(5deg)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          bgcolor: color,
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '1px' }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            className="stat-icon-bg"
            sx={{
              bgcolor: `${color}15`,
              color: color,
              p: 2,
              borderRadius: '16px',
              display: 'flex',
              transition: 'transform 0.3s ease',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Box sx={{ height: '4px', bgcolor: `${color}10`, borderRadius: 1, mt: 'auto' }}>
          <Box sx={{ width: '40%', height: '100%', bgcolor: color, borderRadius: 1, opacity: 0.5 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
