import apiClient from './client';

export interface ReportItem {
    id: number | null;
    name: string;
    count: number;
}

export interface ReportResponse {
    items: ReportItem[];
    total: number;
    group_by: string;
    start_date: string | null;
    end_date: string | null;
}

export interface ReportParams {
    group_by?: string;
    start_date?: string;
    end_date?: string;
}

export const getAppealReport = async (params: ReportParams): Promise<ReportResponse> => {
    const response = await apiClient.get('/reports/appeals', { params });
    return response.data;
};
