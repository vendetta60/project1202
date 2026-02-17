import client from './client';

export interface Citizen {
    id: number;
    first_name: string;
    last_name: string;
    fin: string;
    phone?: string;
    address?: string;
}

export interface CreateCitizenRequest {
    first_name: string;
    last_name: string;
    fin: string;
    phone?: string;
    address?: string;
}

export const getCitizens = async (params: any) => {
    const response = await client.get('/citizens', { params });
    return response.data;
};

export const getCitizen = async (id: number) => {
    const response = await client.get(`/citizens/${id}`);
    return response.data;
};

export const updateCitizen = async (id: number, data: CreateCitizenRequest) => {
    const response = await client.patch(`/citizens/${id}`, data);
    return response.data;
};
