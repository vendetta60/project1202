import apiClient from './client';

export interface Appeal {
  id: number;
  reg_no: string; // Backend uses reg_no, not reg_number
  subject: string;
  description?: string;
  summary?: string;
  appeal_type?: string;
  status: string;
  citizen_id: number;
  org_unit_id: number;
  executor_org_unit_id?: number | null;
  executor_id?: number | null;
  received_at: string;
  execution_date?: string | null;
  created_at: string;
  updated_at: string;
  report_index?: string | null;
  appeal_index?: string | null;
  page_count?: number | null;
  chairman_decision_number?: string | null;
  chairman_decision_date?: string | null;
  incoming_appeal_number?: string | null;
  incoming_appeal_date?: string | null;
  related_appeal_number?: string | null;
  related_appeal_date?: string | null;
  appeal_submitter_role?: string | null;
  citizen_email?: string | null;
  is_transferred?: boolean;
  registration_number?: string;
  registration_date?: string;
  execution_deadline?: string | null;
  originating_military_unit?: string | null;
  leader_decision?: string | null;
  other_military_unit_number?: string | null;
  other_institution_date?: string | null;
  originating_institution?: string | null;
  appeal_submitter?: string | null;
  submitter_full_name?: string | null;
  submitter_saa?: string | null;
  address?: string | null;
  appeal_review_status?: string | null;
  email?: string | null;
  phone_number?: string | null;
  is_repeat_appeal?: boolean;
  reviewed_by?: string | null;
  is_under_supervision?: boolean;
  short_content?: string | null;
  citizen?: {
    id: number;
    first_name: string;
    last_name: string;
    fin: string;
  };
  org_unit?: {
    id: number;
    name: string;
  };
  executor_org_unit?: {
    id: number;
    name: string;
  } | null;
  executor?: {
    id: number;
    full_name: string;
    org_unit_id: number;
  } | null;
}

export interface AppealsResponse {
  items: Appeal[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateAppealRequest {
  subject: string;
  description?: string;
  summary?: string;
  appeal_type?: string;
  citizen_first_name: string;
  citizen_last_name: string;
  citizen_father_name?: string;
  citizen_email?: string;
  org_unit_id: number;
  received_at?: string;
  execution_date?: string;
  report_index?: string;
  appeal_index?: string;
  page_count?: number;
  chairman_decision_number?: string;
  chairman_decision_date?: string;
  incoming_appeal_number?: string;
  incoming_appeal_date?: string;
  related_appeal_number?: string;
  related_appeal_date?: string;
  appeal_submitter_role?: string;
  is_transferred?: boolean;
  executor_org_unit_id?: number | null;
  executor_id?: number | null;
  registration_number: string;
  registration_date: string;
  execution_deadline?: string;
  originating_military_unit?: string;
  leader_decision?: string;
  other_military_unit_number?: string;
  other_institution_date?: string;
  originating_institution?: string;
  appeal_submitter?: string;
  submitter_full_name?: string;
  submitter_saa?: string;
  address?: string;
  appeal_review_status?: string;
  email?: string;
  phone_number?: string;
  is_repeat_appeal?: boolean;
  reviewed_by?: string;
  is_under_supervision?: boolean;
  short_content?: string;
}

export interface UpdateAppealRequest {
  subject?: string;
  description?: string;
  summary?: string;
  appeal_type?: string;
  status?: string;
  org_unit_id?: number;
  executor_org_unit_id?: number | null;
  executor_id?: number | null;
  received_at?: string;
  execution_date?: string;
  report_index?: string;
  appeal_index?: string;
  page_count?: number;
  chairman_decision_number?: string;
  chairman_decision_date?: string;
  incoming_appeal_number?: string;
  incoming_appeal_date?: string;
  related_appeal_number?: string;
  related_appeal_date?: string;
  appeal_submitter_role?: string;
  citizen_email?: string;
  is_transferred?: boolean;
  registration_number?: string;
  registration_date?: string;
  execution_deadline?: string;
  originating_military_unit?: string;
  leader_decision?: string;
  other_military_unit_number?: string;
  other_institution_date?: string;
  originating_institution?: string;
  appeal_submitter?: string;
  submitter_full_name?: string;
  submitter_saa?: string;
  address?: string;
  appeal_review_status?: string;
  email?: string;
  phone_number?: string;
  is_repeat_appeal?: boolean;
  reviewed_by?: string;
  is_under_supervision?: boolean;
  short_content?: string;
}

export const getAppeals = async (params: {
  org_unit_id?: number;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<AppealsResponse> => {
  const response = await apiClient.get('/appeals', { params });
  return response.data;
};

export const getAppeal = async (id: number): Promise<Appeal> => {
  const response = await apiClient.get(`/appeals/${id}`);
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
