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
  full_name: string;
  is_admin: boolean;
  org_unit_id?: number;
  org_unit?: {
    id: number;
    name: string;
    code: string;
  };
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/me');
  return response.data;
};
