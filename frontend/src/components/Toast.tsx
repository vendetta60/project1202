import { useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

export function useToast() {
    const [toast, setToast] = useState<ToastState>({
        open: false,
        message: '',
        severity: 'info',
    });

    const showToast = (message: string, severity: AlertColor = 'info') => {
        setToast({ open: true, message, severity });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, open: false }));
    };

    const ToastComponent = () => (
        <Snackbar
            open={toast.open}
            autoHideDuration={6000}
            onClose={hideToast}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert onClose={hideToast} severity={toast.severity} variant="filled">
                {toast.message}
            </Alert>
        </Snackbar>
    );

    return {
        showToast,
        hideToast,
        ToastComponent,
    };
}
