/**
 * Date utility functions for dd/mm/yyyy format
 */

/**
 * Convert ISO date (YYYY-MM-DD) to dd/mm/yyyy format
 */
export const formatDateToDDMMYYYY = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Convert dd/mm/yyyy format to ISO date (YYYY-MM-DD) for HTML input type="date"
 */
export const formatDateToISO = (ddmmyyyyString: string): string => {
  if (!ddmmyyyyString) return '';
  try {
    const parts = ddmmyyyyString.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

/**
 * Convert ISO date to dd/mm/yyyy for API submission
 */
export const convertDateForAPI = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

/**
 * Parse dd/mm/yyyy string and return Date object
 */
export const parseDateFromDDMMYYYY = (ddmmyyyyString: string): Date | null => {
  if (!ddmmyyyyString) return null;
  try {
    const parts = ddmmyyyyString.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  } catch {
    return null;
  }
};

/**
 * Format text input with automatic slash insertion for dd/mm/yyyy
 * E.g., typing "01012023" becomes "01/01/2023"
 */
export const formatDateInputText = (input: string): string => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');
  
  // Format as dd/mm/yyyy
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

/**
 * Validate dd/mm/yyyy date format
 */
export const isValidDDMMYYYYDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const parts = dateString.split('/');
  if (parts.length !== 3) return false;
  
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return false;
  
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;
  
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};
