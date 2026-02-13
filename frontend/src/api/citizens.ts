import apiClient from './client';

export interface Citizen {
  id: number;
  first_name: string;
  last_name: string;
  fin: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface CitizensResponse {
  items: Citizen[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCitizenRequest {
  first_name: string;
  last_name: string;
  fin: string;
  phone?: string;
  address?: string;
}

export const getCitizens = async (params: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<CitizensResponse> => {
  const response = await apiClient.get('/citizens', { params });
  return response.data;
};

export const getCitizen = async (id: number): Promise<Citizen> => {
  const response = await apiClient.get(`/citizens/${id}`);
  return response.data;
};

export const createCitizen = async (data: CreateCitizenRequest): Promise<Citizen> => {
  const response = await apiClient.post('/citizens', data);
  return response.data;
};

export const updateCitizen = async (id: number, data: CreateCitizenRequest): Promise<Citizen> => {
  const response = await apiClient.patch(`/citizens/${id}`, data);
  return response.data;
};
