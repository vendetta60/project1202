import client from './client';

export interface ReportIndex {
    id: number;
    name: string;
}

export interface AppealIndex {
    id: number;
    name: string;
}

export const getReportIndexes = async (): Promise<ReportIndex[]> => {
    const response = await client.get('/lookups/report_indexes');
    return response.data;
};

export const getAppealIndexes = async (): Promise<AppealIndex[]> => {
    const response = await client.get('/lookups/appeal_indexes');
    return response.data;
};
