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
export const getDirectionsBySection = (sectionId: number) => apiClient.get<Direction[]>(`/lookups/directions/by-section/${sectionId}`).then(r => r.data);
export const getExecutorList = () => apiClient.get<ExecutorList[]>('/lookups/executor-list').then(r => r.data);
export const getExecutorListByDirection = (directionId: number) => apiClient.get<ExecutorList[]>(`/lookups/executor-list/by-direction/${directionId}`).then(r => r.data);
export const getMovzular = () => apiClient.get<Movzu[]>('/lookups/movzular').then(r => r.data);

// ============ CREATE/UPDATE/DELETE FUNCTIONS ============

// Departments
export const createDepartment = (data: Partial<Department>) => apiClient.post<Department>('/lookups/departments', data).then(r => r.data);
export const updateDepartment = (id: number, data: Partial<Department>) => apiClient.put<Department>(`/lookups/departments/${id}`, data).then(r => r.data);
export const deleteDepartment = (id: number) => apiClient.delete(`/lookups/departments/${id}`).then(r => r.data);

// Regions
export const createRegion = (data: Partial<Region>) => apiClient.post<Region>('/lookups/regions', data).then(r => r.data);
export const updateRegion = (id: number, data: Partial<Region>) => apiClient.put<Region>(`/lookups/regions/${id}`, data).then(r => r.data);
export const deleteRegion = (id: number) => apiClient.delete(`/lookups/regions/${id}`).then(r => r.data);

// DepOfficials
export const createDepOfficial = (data: Partial<DepOfficial>) => apiClient.post<DepOfficial>('/lookups/dep-officials', data).then(r => r.data);
export const updateDepOfficial = (id: number, data: Partial<DepOfficial>) => apiClient.put<DepOfficial>(`/lookups/dep-officials/${id}`, data).then(r => r.data);
export const deleteDepOfficial = (id: number) => apiClient.delete(`/lookups/dep-officials/${id}`).then(r => r.data);

// ChiefInstructions
export const createChiefInstruction = (data: Partial<ChiefInstruction>) => apiClient.post<ChiefInstruction>('/lookups/chief-instructions', data).then(r => r.data);
export const updateChiefInstruction = (id: number, data: Partial<ChiefInstruction>) => apiClient.put<ChiefInstruction>(`/lookups/chief-instructions/${id}`, data).then(r => r.data);
export const deleteChiefInstruction = (id: number) => apiClient.delete(`/lookups/chief-instructions/${id}`).then(r => r.data);

// InSections
export const createInSection = (data: Partial<InSection>) => apiClient.post<InSection>('/lookups/in-sections', data).then(r => r.data);
export const updateInSection = (id: number, data: Partial<InSection>) => apiClient.put<InSection>(`/lookups/in-sections/${id}`, data).then(r => r.data);
export const deleteInSection = (id: number) => apiClient.delete(`/lookups/in-sections/${id}`).then(r => r.data);

// WhoControls
export const createWhoControl = (data: Partial<WhoControl>) => apiClient.post<WhoControl>('/lookups/who-controls', data).then(r => r.data);
export const updateWhoControl = (id: number, data: Partial<WhoControl>) => apiClient.put<WhoControl>(`/lookups/who-controls/${id}`, data).then(r => r.data);
export const deleteWhoControl = (id: number) => apiClient.delete(`/lookups/who-controls/${id}`).then(r => r.data);

// ApStatuses
export const createApStatus = (data: Partial<ApStatus>) => apiClient.post<ApStatus>('/lookups/ap-statuses', data).then(r => r.data);
export const updateApStatus = (id: number, data: Partial<ApStatus>) => apiClient.put<ApStatus>(`/lookups/ap-statuses/${id}`, data).then(r => r.data);
export const deleteApStatus = (id: number) => apiClient.delete(`/lookups/ap-statuses/${id}`).then(r => r.data);

// ExecutorList
export const createExecutor = (data: Partial<ExecutorList>) => apiClient.post<ExecutorList>('/lookups/executor-list', data).then(r => r.data);
export const updateExecutor = (id: number, data: Partial<ExecutorList>) => apiClient.put<ExecutorList>(`/lookups/executor-list/${id}`, data).then(r => r.data);
export const deleteExecutor = (id: number) => apiClient.delete(`/lookups/executor-list/${id}`).then(r => r.data);

// Executor assignments for appeals (from appeals endpoint)
export interface ExecutorAssignment extends LookupItem {
    appeal_id?: number;
    direction_id?: number;
    executor_id?: number;
    out_num?: string;
    out_date?: string;
    attach_num?: string;
    attach_paper_num?: string;
    r_prefix?: number;
    r_num?: string;
    r_date?: string;
    posted_sec?: string;
    active?: boolean;
    is_primary?: boolean;  // Əsas icraçı işarəsi
    PC?: string;
    PC_Tarixi?: string;
}

export const getAppealExecutors = (appealId: number) =>
    apiClient.get<ExecutorAssignment[]>(`/appeals/${appealId}/executors`).then(r => r.data);

export const addAppealExecutor = (appealId: number, data: Partial<ExecutorAssignment>) =>
    apiClient.post<ExecutorAssignment>(`/appeals/${appealId}/executors`, {
        ...data,
        appeal_id: appealId,
    }).then(r => r.data);

export const updateAppealExecutor = (appealId: number, executorId: number, data: Partial<ExecutorAssignment>) =>
    apiClient.put<ExecutorAssignment>(`/appeals/${appealId}/executors/${executorId}`, data).then(r => r.data);

export const removeAppealExecutor = (appealId: number, executorId: number) =>
    apiClient.delete(`/appeals/${appealId}/executors/${executorId}`).then(r => r.data);
