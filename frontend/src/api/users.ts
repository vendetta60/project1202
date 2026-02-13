import apiClient from './client';
import type { Role } from './roles';

export interface User {
    id: number;
    username: string;
    full_name: string | null;
    is_active: boolean;
    is_admin: boolean;
    org_unit_id: number | null;
    org_unit?: {
        id: number;
        name: string;
        code: string;
    };
    roles: Role[];
}

export interface UserCreate {
    username: string;
    password: string;
    full_name?: string;
    org_unit_id?: number;
    is_admin?: boolean;
}

export interface UserUpdate {
    full_name?: string;
    org_unit_id?: number;
    is_admin?: boolean;
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

export const updateUser = async (id: number, data: UserUpdate): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
};

export const toggleUserActive = async (id: number): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/toggle-active`);
    return response.data;
};

export const resetUserPassword = async (id: number, newPassword: string): Promise<User> => {
    const response = await apiClient.post(`/users/${id}/reset-password`, {
        new_password: newPassword,
    });
    return response.data;
};

export const assignUserRoles = async (userId: number, roleIds: number[]): Promise<User> => {
    const response = await apiClient.post(`/users/${userId}/roles`, {
        role_ids: roleIds,
    });
    return response.data;
};
