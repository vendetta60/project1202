import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from '@mui/material';

interface CustomLookupDialogProps {
    open: boolean;
    title: string;
    fieldLabel: string;
    onAdd: (value: string) => Promise<void>;
    onClose: () => void;
}

export function CustomLookupDialog({
    open,
    title,
    fieldLabel,
    onAdd,
    onClose,
}: CustomLookupDialogProps) {
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAdd = async () => {
        if (!value.trim()) {
            setError('Xahiş edirik məlumat daxil edin');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            await onAdd(value);
            setValue('');
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                setError('Bu məlumat artıq bazada mövcuddur');
            } else {
                setError('Xəta baş verdi. Xahiş edirik yenidən cəhd edin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setValue('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label={fieldLabel}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setError('');
                        }}
                        placeholder={fieldLabel}
                        error={!!error}
                        helperText={error}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>İmtina Et</Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    disabled={isLoading}
                    sx={{ bgcolor: '#3e4a21' }}
                >
                    {isLoading ? 'Əlavə Edilir...' : 'Əlavə Et'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
