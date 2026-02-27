import { ExecutorAssignment } from './lookups';
import apiClient from './client';

export interface Appeal {
  id: number;
  num?: number;
  reg_num?: string;
  reg_date?: string; // datetime
  sec_in_ap_num?: string;
  in_ap_num?: string;
  sec_in_ap_date?: string; // datetime
  in_ap_date?: string; // datetime
  dep_id?: number;
  official_id?: number;
  region_id?: number;
  person?: string;
  email?: string;
  phone?: string;
  content?: string;
  content_type_id?: number;
  account_index_id?: number;
  ap_index_id?: number;
  paper_count?: string;
  exp_date?: string; // datetime
  who_control_id?: number;
  instructions_id?: number;
  status?: number | null;
  InSection?: number | null;
  IsExecuted?: boolean | null;
  repetition?: boolean | null;
  control?: boolean | null;
  user_section_id?: number | null;
  PC?: string | null;
  PC_Tarixi?: string | null; // datetime
  is_deleted?: boolean;
  executors?: ExecutorAssignment[];
}

export interface AppealsResponse {
  items: Appeal[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateAppealRequest extends Omit<Appeal, 'id'> { }
export interface UpdateAppealRequest extends Omit<Appeal, 'id'> { }

export const getAppeals = async (params: {
  dep_id?: number;
  region_id?: number;
  status?: number;
  q?: string;
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
}): Promise<AppealsResponse> => {
  const response = await apiClient.get('/appeals', { params });
  return response.data;
};

export const getAppeal = async (id: number): Promise<Appeal> => {
  const response = await apiClient.get(`/appeals/${id}`);
  return response.data;
};

export const checkDuplicateAppeal = async (person: string, year: number, section_id: number): Promise<{ exists: boolean; count: number }> => {
  const response = await apiClient.get('/appeals/check-duplicate', {
    params: { person, year, section_id }
  });
  return response.data;
};

export const createAppeal = async (data: CreateAppealRequest): Promise<Appeal> => {
  const response = await apiClient.post('/appeals', data);
  return response.data;
};

export const updateAppeal = async (id: number, data: UpdateAppealRequest): Promise<Appeal> => {
  const response = await apiClient.patch(`/appeals/${id}`, data);
  return response.data;
};

export const deleteAppeal = async (id: number): Promise<{ message: string; id: number }> => {
  const response = await apiClient.delete(`/appeals/${id}`);
  return response.data;
};

export const restoreAppeal = async (id: number): Promise<{ message: string; id: number }> => {
  const response = await apiClient.post(`/appeals/${id}/restore`);
  return response.data;
};

