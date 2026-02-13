import apiClient from './client';

export interface AppealType {
    id: number;
    name: string;
}

export const getAppealTypes = async (): Promise<AppealType[]> => {
    const response = await apiClient.get('/appeal_types');
    return response.data;
};

export const createAppealType = async (data: { name: string }): Promise<AppealType> => {
    const response = await apiClient.post('/appeal_types', data);
    return response.data;
};

export const updateAppealType = async (id: number, data: { name: string }): Promise<AppealType> => {
    const response = await apiClient.put(`/appeal_types/${id}`, data);
    return response.data;
};

export const deleteAppealType = async (id: number): Promise<void> => {
    await apiClient.delete(`/appeal_types/${id}`);
};
