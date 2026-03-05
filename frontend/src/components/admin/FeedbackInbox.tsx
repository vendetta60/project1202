import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Chip,
} from '@mui/material';
import { getLogs, AuditLog } from '../../api/logs';

interface ParsedFeedback {
  category?: string;
  message?: string;
}

function parseFeedback(log: AuditLog): ParsedFeedback {
  try {
    if (!log.new_values) return {};
    const obj = JSON.parse(log.new_values);
    return {
      category: obj.category,
      message: obj.message,
    };
  } catch {
    return {};
  }
}

export function FeedbackInbox() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feedback-inbox', page, rowsPerPage],
    queryFn: () =>
      getLogs({
        entity_type: 'Feedback',
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      }),
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const items = data?.items ?? [];

  return (
    <div className="admin-section animate-fade-in">
      <div className="section-header">
        <h2>Təklif və İradlar</h2>
      </div>

      {isError && (
        <div className="alert alert-error">
          <span>⚠️</span> Təklif və iradlar yüklənə bilmədi.
        </div>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tarix</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>İstifadəçi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kateqoriya</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '60%' }}>Mesaj</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" fontWeight={600}>
                      Yüklənir...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" fontWeight={600}>
                      Hələlik heç bir təklif və ya irad daxil olmayıb.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((log) => {
                  const parsed = parseFeedback(log);
                  const date = new Date(log.created_at);
                  const dateText = date.toLocaleString('az-AZ', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const categoryLabel =
                    parsed.category === 'irad'
                      ? 'İrad'
                      : parsed.category === 'teklif'
                      ? 'Təklif'
                      : 'Digər';
                  const chipColor =
                    parsed.category === 'irad'
                      ? 'error'
                      : parsed.category === 'teklif'
                      ? 'success'
                      : 'default';

                  return (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{dateText}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {log.created_by_name || `ID: ${log.created_by}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={categoryLabel}
                          size="small"
                          color={chipColor as any}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.9rem' }}>{parsed.message || log.description}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Səhifə başına qeyd:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        />
      </Paper>
    </div>
  );
}

