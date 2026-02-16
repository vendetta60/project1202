import { TextField, TextFieldProps } from '@mui/material';
import { formatDateToISO, convertDateForAPI, parseDateFromDDMMYYYY } from '../utils/dateUtils';

interface CustomDateInputProps extends Omit<TextFieldProps, 'type'> {
  value?: string;
  onChange?: (event: any) => void;
}

/**
 * Custom Date Input component that handles dd/mm/yyyy format
 * Internally uses HTML date input (YYYY-MM-DD) for better UX
 * But displays and accepts dd/mm/yyyy format
 */
export function CustomDateInput({ value, onChange, ...props }: CustomDateInputProps) {
  // Convert displayed value to ISO format for the input
  const displayValue = value ? formatDateToISO(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    if (!isoDate) {
      onChange?.({
        target: { name: e.target.name, value: '' }
      });
    } else {
      // Convert ISO date back to dd/mm/yyyy format
      const ddmmyyyy = convertDateForAPI(isoDate);
      onChange?.({
        target: { name: e.target.name, value: ddmmyyyy }
      });
    }
  };

  return (
    <TextField
      {...props}
      type="date"
      value={displayValue}
      onChange={handleChange}
    />
  );
}
