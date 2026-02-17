import apiClient from './client';

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  description?: string;
  old_values?: string;
  new_values?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetLogsParams {
  entity_type?: string;
  entity_id?: number;
  created_by?: number;
  action?: string;
  limit?: number;
  offset?: number;
}

export async function getLogs(params: GetLogsParams): Promise<AuditLogListResponse> {
  const response = await apiClient.get<AuditLogListResponse>('/audit-logs', {
    params: {
      limit: params.limit || 50,
      offset: params.offset || 0,
      ...(params.entity_type && { entity_type: params.entity_type }),
      ...(params.entity_id && { entity_id: params.entity_id }),
      ...(params.created_by && { created_by: params.created_by }),
      ...(params.action && { action: params.action }),
    },
  });
  return response.data;
}

export async function getEntityHistory(
  entityType: string,
  entityId: number
): Promise<any> {
  const response = await apiClient.get(`/audit-logs/${entityType}/${entityId}`);
  return response.data;
}
