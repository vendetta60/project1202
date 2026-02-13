import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
} from '@mui/material';

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
    confirmText = 'Təsdiq et',
    cancelText = 'Ləğv et',
    onConfirm,
    onCancel,
    severity = 'warning',
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={severity === 'error' ? 'error' : 'primary'}
                    autoFocus
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
