import React, { useEffect, useState, FormEvent } from 'react';
import { userPermissionApi, roleApi, permissionGroupApi, permissionApi, usersApi, User } from '../../api/index';
import { usePermissions } from '../../hooks/usePermissions';

interface Permission {
  id: number;
  code: string;
  name: string;
  category?: string;
}
import './AdminPanel.css';

// Local interfaces for state management that are compatible with API types
// User is now imported from ../../api/index

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

interface PermissionGroup {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

interface UserPermissions {
  user_id: number;
  permission_codes: string[];
  role_ids: number[];
}

export function UserPermissionsManagement() {
  const { rank: currentRank } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [assigningRole, setAssigningRole] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    surname: '',
    name: '',
    role_ids: [] as number[],
    group_ids: [] as number[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, groupsRes, permissionsRes] = await Promise.all([
        usersApi.getUsers({ limit: 200, offset: 0 }),
        roleApi.listAll(),
        permissionGroupApi.listAll(true),
        permissionApi.listAll(),
      ]);
      setUsers(usersRes.items);
      setRoles(rolesRes.data);
      setGroups(groupsRes.data);
      setPermissions(permissionsRes.data);
      setError(null);
    } catch (err: any) {
      setError('Məlumatların yüklənməsi zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (err: any): string => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
    if (typeof detail === 'object' && detail !== null) {
      if (detail.msg) return detail.msg;
      return JSON.stringify(detail);
    }
    return 'Xəta baş verdi';
  };

  const handleSelectUser = async (user: User) => {
    try {
      setSelectedUser(user);
      const res = await userPermissionApi.getUserPermissions(user.id);
      setUserPermissions(res.data);
      setSuccess(null);
    } catch (err: any) {
      setError('İstifadəçi icazələrinin yüklənməsi zamanı xəta baş verdi');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !assigningRole) return;
    try {
      await userPermissionApi.assignRole(selectedUser.id, assigningRole);
      setAssigningRole(null);
      await handleSelectUser(selectedUser);
      setSuccess('Rol uğurla təyin edildi');
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleRevokeRole = async (roleId: number) => {
    if (!selectedUser || !confirm('Bu rolu silmək istədiyinizə əminsiniz?')) return;
    try {
      await userPermissionApi.revokeRole(selectedUser.id, roleId);
      await handleSelectUser(selectedUser);
      setSuccess('Rol ləğv edildi');
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleApplyGroup = async (groupId: number) => {
    if (!selectedUser) return;
    try {
      await permissionGroupApi.applyToUser(groupId, selectedUser.id);
      await handleSelectUser(selectedUser);
      setSuccess('Şablon qrup uğurla tətbiq edildi');
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleRemovePermissionFromUser = async (code: string) => {
    if (!selectedUser) return;
    const perm = permissions.find((p) => p.code === code);
    if (!perm) {
      setError('Bu icazə sistemi üzrə tapılmadı');
      return;
    }
    if (!confirm(`"${code}" icazəsini bu istifadəçidən silmək istədiyinizə əminsiniz?`)) return;
    try {
      // Deny permission so that hətta rollardan gəlsə belə bu istifadəçidə deaktiv olsun
      await userPermissionApi.denyPermission(selectedUser.id, perm.id);
      await handleSelectUser(selectedUser);
      setSuccess('İcazə istifadəçidən silindi');
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateUser = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (!newUser.username || !newUser.password) {
        setError('İstifadəçi adı və şifrə mütləqdir');
        return;
      }
      await usersApi.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({
        username: '',
        password: '',
        surname: '',
        name: '',
        role_ids: [],
        group_ids: []
      });
      setSuccess('İstifadəçi uğurla yaradıldı');
      await loadData();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div className="loading">Yüklənir...</div>;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>İstifadəçi İcazələrinin İdarə Edilməsi</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <span>➕</span> Yeni İstifadəçi
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
      {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

      <div className="user-management-layout">
        <div className="users-list">
          <div className="users-table">
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <div>
                    <strong>{user.surname} {user.name}</strong>
                    <small>{user.username}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="permissions-detail">
          {selectedUser && userPermissions ? (
            <div className="permissions-panel glass-card animate-slide-up">
              <div className="panel-header">
                <h3>{selectedUser.surname} {selectedUser.name} <small>({selectedUser.username})</small></h3>
              </div>

              <div className="permission-section">
                <h4>Təyin Olunmuş Rollar</h4>
                {userPermissions.role_ids.length === 0 ? (
                  <p className="text-muted">Heç bir rol təyin edilməyib</p>
                ) : (
                  <div className="role-list">
                    {userPermissions.role_ids.map((roleId) => {
                      const role = roles.find((r) => r.id === roleId);
                      return (
                        <div key={roleId} className="role-badge">
                          <span>{role?.name}</span>
                          <button
                            className="btn-close-badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevokeRole(roleId);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="form-group add-role-form">
                  <label>Yeni Rol Təyin Et</label>
                  <div className="input-group">
                    <select
                      value={assigningRole || ''}
                      onChange={(e) => setAssigningRole(Number(e.target.value) || null)}
                    >
                      <option value="">Rol seçin...</option>
                      {roles
                        .filter(role => {
                          if (currentRank >= 3) return true;
                          const blocked = ['admin', 'users', 'audit'];
                          return role.permissions.every(p => !p.category || !blocked.includes(p.category));
                        })
                        .map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAssignRole}
                      disabled={!assigningRole}
                    >
                      Təyin Et
                    </button>
                  </div>
                </div>
              </div>

              <div className="permission-section">
                <h4>Şablon Qrup Tətbiq Et</h4>
                <div className="groups-grid">
                  {groups
                    .filter(group => {
                      if (currentRank >= 3) return true;
                      const blocked = ['admin', 'users', 'audit'];
                      return group.permissions.every(p => !p.category || !blocked.includes(p.category));
                    })
                    .map((group) => (
                      <button
                        key={group.id}
                        className="btn btn-outline"
                        onClick={() => handleApplyGroup(group.id)}
                      >
                        <div className="group-btn-content">
                          <strong>{group.name}</strong>
                          {group.description && <small>{group.description}</small>}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="permission-section">
                <h4>Cari Aktiv İcazələr <span className="badge">{userPermissions.permission_codes.length}</span></h4>
                <div className="permissions-list">
                  {userPermissions.permission_codes.sort().map((code) => (
                    <div key={code} className="permission-item">
                      <code>{code}</code>
                      <button
                        type="button"
                        className="btn-close-badge"
                        onClick={() => handleRemovePermissionFromUser(code)}
                        title="Bu icazəni istifadəçidən sil"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <p>İcazələrə baxmaq və onları idarə etmək üçün sol tərəfdən istifadəçi seçin.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card wide-modal animate-slide-up">
            <div className="modal-header">
              <h3>Yeni İstifadəçi Yarat</h3>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="create-user-grid">
                <div className="modal-form-section">
                  <h4>Əsas Məlumatlar</h4>
                  <div className="form-group">
                    <label>İstifadəçi Adı (Username) *</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="e.g. jdoe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Şifrə *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ad</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Soyad</label>
                      <input
                        type="text"
                        value={newUser.surname}
                        onChange={e => setNewUser({ ...newUser, surname: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-form-section">
                  <h4>Rol və Qruplar</h4>
                  <div className="form-group">
                    <label>Rollar Təyin Et</label>
                    <div className="checkbox-list">
                      {roles
                        .filter(role => {
                          if (currentRank >= 3) return true;
                          const blocked = ['admin', 'users', 'audit'];
                          return role.permissions.every(p => !p.category || !blocked.includes(p.category));
                        })
                        .map(role => (
                          <label key={role.id} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={newUser.role_ids.includes(role.id)}
                              onChange={e => {
                                const ids = e.target.checked
                                  ? [...newUser.role_ids, role.id]
                                  : newUser.role_ids.filter(id => id !== role.id);
                                setNewUser({ ...newUser, role_ids: ids });
                              }}
                            />
                            <span>{role.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Şablon Qruplar Tətbiq Et</label>
                    <div className="checkbox-list">
                      {groups
                        .filter(group => {
                          if (currentRank >= 3) return true;
                          const blocked = ['admin', 'users', 'audit'];
                          return group.permissions.every(p => !p.category || !blocked.includes(p.category));
                        })
                        .map(group => (
                          <label key={group.id} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={newUser.group_ids.includes(group.id)}
                              onChange={e => {
                                const ids = e.target.checked
                                  ? [...newUser.group_ids, group.id]
                                  : newUser.group_ids.filter(id => id !== group.id);
                                setNewUser({ ...newUser, group_ids: ids });
                              }}
                            />
                            <span>{group.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Ləğv Et</button>
              <button className="btn btn-primary" onClick={handleCreateUser}>Yarat</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          font-size: 24px;
          background: var(--app-bg);
          color: var(--app-text);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .user-item.active .user-avatar {
          background: rgba(255,255,255,0.2);
          color: white;
        }
        .permissions-detail {
          min-height: 400px;
          display: flex;
        }
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--app-text-secondary);
          text-align: center;
          padding: 40px;
          background: var(--app-paper);
          border-radius: 12px;
          border: 2px dashed var(--app-border);
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .panel-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--app-border);
        }
        .panel-header h3 small {
          font-weight: 500;
          color: var(--app-text-secondary);
        }
        .group-btn-content {
          text-align: left;
        }
        .group-btn-content strong {
          display: block;
          margin-bottom: 4px;
        }
        .group-btn-content small {
          font-weight: 500;
          opacity: 0.8;
          display: block;
          line-height: 1.2;
          text-transform: none;
        }
        .add-role-form {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--app-border);
        }
        .wide-modal {
          max-width: 800px !important;
        }
        .create-user-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .modal-form-section h4 {
          margin: 0 0 20px 0;
          color: var(--app-primary);
          border-bottom: 2px solid var(--app-primary);
          padding-bottom: 8px;
          font-size: 16px;
          text-transform: uppercase;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
          padding: 12px;
          background: var(--app-paper);
          border: 1.5px solid var(--app-border);
          border-radius: 6px;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600 !important;
          font-size: 13px;
          text-transform: none !important;
          cursor: pointer;
          color: var(--app-text);
        }
        .checkbox-item input {
          width: 16px;
          height: 16px;
          accent-color: var(--app-primary);
        }
      `}</style>
    </div>
  );
}
