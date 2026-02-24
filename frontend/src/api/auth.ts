import apiClient from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  surname?: string;
  name?: string;
  full_name?: string; // computed
  section_id?: number;
  section_name?: string;
  is_admin: boolean;
  is_active: boolean;

  // Tab permissions
  tab1?: boolean; // Admin
  tab2?: boolean;
  tab3?: boolean;
  tab4?: boolean;
  tab5?: boolean;

  // RBAC permission codes
  permissions?: string[];
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/me');
  return response.data;
};

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export const changePassword = async (data: ChangePasswordRequest): Promise<{ message: string }> => {
  const response = await apiClient.post('/me/change-password', data);
  return response.data;
};
