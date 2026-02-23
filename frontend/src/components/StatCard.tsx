import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  onClick?: () => void;
  trend?: string;
}

export default function StatCard({ title, value, icon, color = '#1976d2', onClick, trend }: StatCardProps) {
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
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: onClick ? 'translateY(-8px)' : 'none',
          boxShadow: `0 20px 40px ${color}15 !important`,
          borderColor: color,
          '& .stat-icon-bg': {
            transform: 'scale(1.1) rotate(5deg)',
            bgcolor: `${color}25`,
          },
          '& .stat-bg-decoration': {
            opacity: 0.1,
            transform: 'scale(1.2)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '100%',
          background: `linear-gradient(to bottom, ${color}, ${color}dd)`,
          zIndex: 2,
        }
      }}
    >
      {/* Decorative background element */}
      <Box
        className="stat-bg-decoration"
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          fontSize: '120px',
          opacity: 0.03,
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {icon}
      </Box>

      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 800,
                color: 'text.secondary',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                opacity: 0.7
              }}
            >
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', mt: 1, letterSpacing: '-1px' }}>
              {value}
            </Typography>
            {trend && (
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, mt: 1, display: 'block' }}>
                {trend}
              </Typography>
            )}
          </Box>
          <Box
            className="stat-icon-bg"
            sx={{
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              color: color,
              p: 2.5,
              borderRadius: '20px',
              display: 'flex',
              transition: 'all 0.3s ease',
              boxShadow: `0 10px 20px ${color}10`,
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ height: '6px', bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(to right, ${color}30, ${color})`,
                borderRadius: 3,
                opacity: 0.6,
                transform: 'translateX(-60%)', // Just for visual flair
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
