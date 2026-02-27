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

export const exportForma4 = async (type: 'excel' | 'word' | 'pdf', params: ReportParams) => {
    // Filter out empty params
    const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );

    const response = await apiClient.get(`/reports/forma-4/${type}`, {
        params: filteredParams,
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const extension = type === 'excel' ? 'xlsx' : type === 'word' ? 'docx' : 'pdf';
    link.setAttribute('download', `forma_4_${new Date().toISOString().split('T')[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
