import apiClient from './client';

export interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions: string[];
    is_system: boolean;
}

export interface RoleCreate {
    name: string;
    description?: string;
    permissions: string[];
}

export interface RoleUpdate {
    name?: string;
    description?: string;
    permissions?: string[];
}

export const getRoles = async (): Promise<Role[]> => {
    const response = await apiClient.get('/roles');
    return response.data;
};

export const getRole = async (id: number): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
};

export const createRole = async (data: RoleCreate): Promise<Role> => {
    const response = await apiClient.post('/roles', data);
    return response.data;
};

export const updateRole = async (id: number, data: RoleUpdate): Promise<Role> => {
    const response = await apiClient.patch(`/roles/${id}`, data);
    return response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
};

export const getPermissions = async (): Promise<Record<string, string[]>> => {
    const response = await apiClient.get('/roles/permissions');
    return response.data;
};
