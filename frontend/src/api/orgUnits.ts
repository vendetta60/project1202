import apiClient from './client';

export interface OrgUnit {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  description?: string;
  created_at: string;
}

export const getOrgUnits = async (): Promise<OrgUnit[]> => {
  const response = await apiClient.get('/org-units');
  return response.data;
};
