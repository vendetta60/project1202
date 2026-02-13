import apiClient from './client';

export interface Executor {
  id: number;
  full_name: string;
  org_unit_id: number;
}

export const getExecutors = async (params: {
  org_unit_id: number;
}): Promise<Executor[]> => {
  const response = await apiClient.get('/executors', { params });
  return response.data;
};

export const createExecutor = async (data: {
  full_name: string;
  org_unit_id: number;
}): Promise<Executor> => {
  const response = await apiClient.post('/executors', data);
  return response.data;
};

