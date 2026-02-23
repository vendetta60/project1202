import apiClient from './client';
import type { User } from './auth';

// Re-export User from auth to keep it consistent
export type { User };

export interface UserCreate {
    username: string;
    password: string;
    surname?: string;
    name?: string;
    section_id?: number;
    role_ids?: number[];
    group_ids?: number[];
}

export interface UserListResponse {
    items: User[];
    total: number;
    limit: number;
    offset: number;
}

export interface UserSearchParams {
    q?: string;
    limit?: number;
    offset?: number;
}

export const getUsers = async (params?: UserSearchParams): Promise<UserListResponse> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
};

export const getUser = async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (data: UserCreate): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
};

export const resetUserPassword = async (userId: number, password: string): Promise<User> => {
    const response = await apiClient.post(`/users/${userId}/reset-password`, { new_password: password });
    return response.data;
};
