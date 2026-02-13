import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.response?.data?.message;

    if (message) return message;

    switch (status) {
      case 401:
        return 'Giriş tələb olunur';
      case 403:
        return 'Bu əməliyyat üçün icazəniz yoxdur';
      case 404:
        return 'Məlumat tapılmadı';
      case 409:
        return 'Bu məlumat artıq mövcuddur';
      case 500:
        return 'Serverdə xəta baş verdi';
      default:
        if (!error.response) {
          return 'İnternet bağlantısını yoxlayın';
        }
        return 'Xəta baş verdi';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Naməlum xəta';
};
