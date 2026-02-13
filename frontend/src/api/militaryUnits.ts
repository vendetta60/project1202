import apiClient from './client';

export interface MilitaryUnit {
  id: number;
  name: string;
}

export const getMilitaryUnits = async (): Promise<MilitaryUnit[]> => {
  const response = await apiClient.get('/military_units');
  return response.data;
};

export const createMilitaryUnit = async (data: { name: string }): Promise<MilitaryUnit> => {
  const response = await apiClient.post('/military_units', data);
  return response.data;
};

export const updateMilitaryUnit = async (id: number, data: { name: string }): Promise<MilitaryUnit> => {
  const response = await apiClient.put(`/military_units/${id}`, data);
  return response.data;
};

export const deleteMilitaryUnit = async (id: number): Promise<void> => {
  await apiClient.delete(`/military_units/${id}`);
};
