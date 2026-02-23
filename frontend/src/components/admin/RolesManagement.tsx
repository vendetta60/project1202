import React, { useEffect, useState } from 'react';
import { roleApi, permissionApi } from '../../api/permissions';
import './AdminPanel.css';

interface Permission {
  id: number;
  code: string;
  name: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  permissions?: Permission[];
}

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        roleApi.listAll(),
        permissionApi.listAll(),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
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

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roleApi.create({
        name: formData.name,
        description: formData.description,
      });
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setSuccess('Yeni rol uğurla yaradıldı');
      await loadData();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    setSuccess(null);
  };

  const handleTogglePermission = (permId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      // selectedRole.id is already a number
      await roleApi.setPermissions(Number(selectedRole.id), selectedPermissions.map(id => Number(id)));
      setSelectedRole(null);
      setSuccess(`${selectedRole.name} rolu üçün icazələr yeniləndi`);
      await loadData();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Bu rolu tamamilə silmək istədiyinizə əminsiniz?')) return;
    try {
      await roleApi.delete(roleId);
      setSuccess('Rol silindi');
      await loadData();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div className="loading">Yüklənir...</div>;

  return (
    <div className="admin-section animate-fade-in">
      <div className="section-header">
        <h2>Rolların İdarə Edilməsi</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Ləğv Et' : '➕ Yeni Rol'}
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
      {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

      {showForm && (
        <div className="form-card glass-card animate-slide-up">
          <form onSubmit={handleCreateRole}>
            <div className="form-group">
              <label>Rolun Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="məs., Şöbə Müdiri"
                required
              />
            </div>
            <div className="form-group">
              <label>Təsvir (Description)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Bu rolun əsas funksiyaları nələrdir?"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Yarat
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedRole && (
        <div className="modal-overlay" onClick={() => setSelectedRole(null)}>
          <div className="modal-content glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedRole.name} - İcazələrin Redaktəsi</h3>
              <button className="btn-close" onClick={() => setSelectedRole(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-4">Bu rol üçün aktiv icazələri seçin:</p>
              <div className="permissions-grid">
                {permissions.map((perm) => (
                  <label key={perm.id} className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handleTogglePermission(perm.id)}
                      disabled={selectedRole.is_system}
                    />
                    <div className="permission-meta">
                      <span className="permission-name">{perm.name}</span>
                      <span className="permission-code">{perm.code}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRole(null)}>
                Ləğv Et
              </button>
              {!selectedRole.is_system && (
                <button className="btn btn-success" onClick={handleSaveRolePermissions}>
                  Yadda Saxla
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rolun Adı</th>
              <th>Təsvir</th>
              <th>İcazə Sayı</th>
              <th>Növ</th>
              <th>Status</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Heç bir rol tapılmadı
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.name}</strong>
                  </td>
                  <td>{role.description}</td>
                  <td>
                    <span className={`badge ${role.is_system ? 'badge-system' : ''}`}>
                      {role.permissions?.length || 0} icazə
                    </span>
                  </td>
                  <td>{role.is_system ? 'Sistem' : 'Fərdi'}</td>
                  <td>
                    {role.is_active ? (
                      <span className="text-success">● Aktiv</span>
                    ) : (
                      <span className="text-muted">○ Deaktiv</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleSelectRole(role)}
                        title="İcazələri Redaktə Et"
                      >
                        ⚙️ İcazələr
                      </button>
                      {!role.is_system && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteRole(role.id)}
                          title="Sil"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .mb-4 { margin-bottom: 1rem; }
        .table-actions {
          display: flex;
          gap: 8px;
        }
        .text-success { color: #2d5a27; font-weight: bold; }
        .form-actions {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
