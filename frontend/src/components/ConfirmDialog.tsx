import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    severity?: 'info' | 'warning' | 'error';
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmText = 'Bəli, Sil',
    cancelText = 'Xeyr, İmtina Et',
    onConfirm,
    onCancel,
    severity = 'warning',
}: ConfirmDialogProps) {
    const isError = severity === 'error';
    const iconColor = isError ? '#d32f2f' : '#e65100';
    const iconBg = isError ? 'rgba(211,47,47,0.1)' : 'rgba(230,81,0,0.1)';

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, pt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 42, height: 42, borderRadius: '50%',
                        bgcolor: iconBg, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        {isError
                            ? <ErrorOutlineIcon sx={{ color: iconColor, fontSize: 24 }} />
                            : <WarningAmberIcon sx={{ color: iconColor, fontSize: 24 }} />
                        }
                    </Box>
                    <Box sx={{ fontWeight: 800, fontSize: '1rem', color: '#1f2937' }}>
                        {title}
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 0.5, pb: 1 }}>
                <DialogContentText sx={{ color: '#4b5563', fontWeight: 500, fontSize: '0.9rem', ml: '58px' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    sx={{
                        borderColor: 'rgba(0,0,0,0.15)', color: '#555',
                        fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 3,
                        '&:hover': { borderColor: '#aaa', bgcolor: 'rgba(0,0,0,0.03)' }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    autoFocus
                    sx={{
                        bgcolor: iconColor, fontWeight: 700, borderRadius: 2,
                        textTransform: 'none', px: 3, boxShadow: 'none',
                        '&:hover': {
                            bgcolor: isError ? '#b71c1c' : '#bf360c',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// Hook for using confirm dialog
export function useConfirmDialog() {
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        severity?: 'info' | 'warning' | 'error';
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const showConfirm = (
        title: string,
        message: string,
        onConfirm: () => void,
        severity?: 'info' | 'warning' | 'error'
    ) => {
        setDialogState({ open: true, title, message, onConfirm, severity });
    };

    const hideConfirm = () => {
        setDialogState((prev) => ({ ...prev, open: false }));
    };

    const handleConfirm = () => {
        dialogState.onConfirm();
        hideConfirm();
    };

    return {
        dialogState,
        showConfirm,
        hideConfirm,
        handleConfirm,
    };
}
