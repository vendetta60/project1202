import apiClient from './client';

export interface LookupItem {
    id: number;
    IsDeleted?: boolean;
}

export interface AccountIndex extends LookupItem {
    account_index: string;
    account_order?: number;
}

export interface ApIndex extends LookupItem {
    ap_index_id: number;
    ap_index: string;
}

export interface ApStatus extends LookupItem {
    status: string;
}

export interface ContentType extends LookupItem {
    content_type: string;
}

export interface ChiefInstruction extends LookupItem {
    instructions: string;
    section_id?: number;
}

export interface InSection extends LookupItem {
    section: string;
}

export interface Section extends LookupItem {
    section: string;
}

export interface UserSection extends LookupItem {
    user_section: string;
    section_index?: number;
}

export interface WhoControl extends LookupItem {
    chief: string;
    section_id?: number;
}

export interface Department extends LookupItem {
    department: string;
    sign?: string;
}

export interface DepOfficial extends LookupItem {
    dep_id?: number;
    official: string;
}

export interface Region extends LookupItem {
    region: string;
}

export interface Organ extends LookupItem {
    Orqan: string;
    Nov?: number;
    isDeleted?: boolean; // Note: casing difference in backend model
}

export interface Direction extends LookupItem {
    direction: string;
    section_id?: number;
}

export interface ExecutorList extends LookupItem {
    direction_id?: number;
    executor: string;
}

export interface Movzu extends LookupItem {
    Movzu: string;
}

// API Functions

export const getAccountIndexes = () => apiClient.get<AccountIndex[]>('/lookups/account-indexes').then(r => r.data);
export const getApIndexes = () => apiClient.get<ApIndex[]>('/lookups/ap-indexes').then(r => r.data);
export const getApStatuses = () => apiClient.get<ApStatus[]>('/lookups/ap-statuses').then(r => r.data);
export const getContentTypes = () => apiClient.get<ContentType[]>('/lookups/content-types').then(r => r.data);
export const getChiefInstructions = () => apiClient.get<ChiefInstruction[]>('/lookups/chief-instructions').then(r => r.data);
export const getChiefInstructionsBySection = (sectionId: number) => apiClient.get<ChiefInstruction[]>(`/lookups/chief-instructions/by-section/${sectionId}`).then(r => r.data);
export const getInSections = () => apiClient.get<InSection[]>('/lookups/in-sections').then(r => r.data);
export const getSections = () => apiClient.get<Section[]>('/lookups/sections').then(r => r.data);
export const getUserSections = () => apiClient.get<UserSection[]>('/lookups/user-sections').then(r => r.data);
export const getWhoControls = () => apiClient.get<WhoControl[]>('/lookups/who-controls').then(r => r.data);
export const getDepartments = () => apiClient.get<Department[]>('/lookups/departments').then(r => r.data);
export const getDepOfficials = () => apiClient.get<DepOfficial[]>('/lookups/dep-officials').then(r => r.data);
export const getDepOfficialsByDep = (depId: number) => apiClient.get<DepOfficial[]>(`/lookups/dep-officials/by-dep/${depId}`).then(r => r.data);
export const getRegions = () => apiClient.get<Region[]>('/lookups/regions').then(r => r.data);
export const getOrgans = () => apiClient.get<Organ[]>('/lookups/organs').then(r => r.data);
export const getDirections = () => apiClient.get<Direction[]>('/lookups/directions').then(r => r.data);
export const getExecutorList = () => apiClient.get<ExecutorList[]>('/lookups/executor-list').then(r => r.data);
export const getMovzular = () => apiClient.get<Movzu[]>('/lookups/movzular').then(r => r.data);
