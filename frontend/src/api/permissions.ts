import api from './client';

// ============ PERMISSIONS API ============

export const permissionApi = {
  listAll: () => api.get('/permissions/list'),
  getByCategory: (category: string) => api.get(`/permissions/categories/${category}`),
  create: (code: string, name: string, description?: string, category?: string) =>
    api.post('/permissions/create', { code, name, description, category }),
};

// ============ ROLES API ============

export const roleApi = {
  listAll: () => api.get('/permissions/roles/list'),
  get: (roleId: number) => api.get(`/permissions/roles/${roleId}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/permissions/roles/create', data),
  update: (roleId: number, data: { name?: string; description?: string; is_active?: boolean }) =>
    api.put(`/permissions/roles/${roleId}`, data),
  delete: (roleId: number) => api.delete(`/permissions/roles/${roleId}`),
  addPermission: (roleId: number, permissionId: number) =>
    api.post(`/permissions/roles/${roleId}/permissions/${permissionId}`, {}),
  removePermission: (roleId: number, permissionId: number) =>
    api.delete(`/permissions/roles/${roleId}/permissions/${permissionId}`),
  setPermissions: (roleId: number, permissionIds: number[]) =>
    api.post(`/permissions/roles/${roleId}/permissions/set`, permissionIds),
};

// ============ PERMISSION GROUPS API ============

export const permissionGroupApi = {
  listAll: (templateOnly: boolean = true) =>
    api.get('/permissions/groups/list', { params: { template_only: templateOnly } }),
  get: (groupId: number) => api.get(`/permissions/groups/${groupId}`),
  create: (data: {
    name: string;
    description?: string;
    is_template?: boolean;
    permission_ids?: number[];
  }) => api.post('/permissions/groups/create', data),
  update: (groupId: number, data: any) => api.put(`/permissions/groups/${groupId}`, data),
  delete: (groupId: number) => api.delete(`/permissions/groups/${groupId}`),
  applyToUser: (groupId: number, userId: number) =>
    api.post(`/permissions/groups/${groupId}/apply-to-user/${userId}`, {}),
};

// ============ USER PERMISSIONS API ============

export const userPermissionApi = {
  getUserPermissions: (userId: number) =>
    api.get(`/permissions/users/${userId}/permissions`),
  assignRole: (userId: number, roleId: number) =>
    api.post(`/permissions/users/${userId}/roles/${roleId}`, {}),
  revokeRole: (userId: number, roleId: number) =>
    api.delete(`/permissions/users/${userId}/roles/${roleId}`),
  grantPermission: (userId: number, permissionId: number) =>
    api.post(`/permissions/users/${userId}/permissions/${permissionId}/grant`, {}),
  denyPermission: (userId: number, permissionId: number) =>
    api.post(`/permissions/users/${userId}/permissions/${permissionId}/deny`, {}),
  revokePermissionOverride: (userId: number, permissionId: number) =>
    api.delete(`/permissions/users/${userId}/permissions/${permissionId}/override`),
};
