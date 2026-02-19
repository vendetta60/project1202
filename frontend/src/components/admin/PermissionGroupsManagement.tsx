import React, { useEffect, useState } from 'react';
import { permissionGroupApi, permissionApi } from '../../api/permissions';
import './AdminPanel.css';

interface Permission {
  id: number;
  code: string;
  name: string;
  category?: string;
}

interface PermissionGroup {
  id: number;
  name: string;
  description?: string;
  is_template: boolean;
  is_active: boolean;
  permissions?: Permission[];
}

export function PermissionGroupsManagement() {
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<PermissionGroup | null>(null);
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
      const [groupsRes, permsRes] = await Promise.all([
        permissionGroupApi.listAll(false),
        permissionApi.listAll(),
      ]);
      setGroups(groupsRes.data);
      setPermissions(permsRes.data);
      setError(null);
    } catch (err: any) {
      setError('Məlumatların yüklənməsi zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await permissionGroupApi.create({
        name: formData.name,
        description: formData.description,
        is_template: true,
        permission_ids: selectedPermissions,
      });
      setFormData({ name: '', description: '' });
      setSelectedPermissions([]);
      setShowForm(false);
      setSuccess('Yeni şablon qrup yaradıldı');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Qrup yaradıla bilmədi');
    }
  };

  const handleSelectGroup = (group: PermissionGroup) => {
    setSelectedGroup(group);
    setSelectedPermissions(group.permissions?.map((p) => p.id) || []);
    setSuccess(null);
  };

  const handleTogglePermission = (permId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveGroup = async () => {
    if (!selectedGroup) return;
    try {
      await permissionGroupApi.update(selectedGroup.id, {
        permission_ids: selectedPermissions,
      });
      setSelectedGroup(null);
      setSuccess(`${selectedGroup.name} qrupu yeniləndi`);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Dəyişikliklər yadda saxlanıla bilmədi');
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Bu şablonu silmək istədiyinizə əminsiniz?')) return;
    try {
      await permissionGroupApi.delete(groupId);
      setSuccess('Şablon silindi');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Silinmə zamanı xəta baş verdi');
    }
  };

  if (loading) return <div className="loading">Yüklənir...</div>;

  return (
    <div className="admin-section animate-fade-in">
      <div className="section-header">
        <h2>Şablon Qrupların İdarə Edilməsi</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setSelectedPermissions([]); }}>
          {showForm ? 'Ləğv Et' : '➕ Yeni Şablon'}
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
      {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

      {showForm && (
        <div className="form-card glass-card animate-slide-up">
          <form onSubmit={handleCreateGroup}>
            <div className="form-grid">
              <div className="form-main">
                <div className="form-group">
                  <label>Şablonun Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="məs., Standart İdarəçi"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Təsvir</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Bu şablonun təyinatı..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="form-side">
                <label>İcazələri Seçin</label>
                <div className="permissions-selection-grid">
                  {permissions.map((perm) => (
                    <label key={perm.id} className={`permission-item-card ${selectedPermissions.includes(perm.id) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                      />
                      <div className="perm-info">
                        <strong>{perm.name}</strong>
                        <code>{perm.code}</code>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions mt-4">
              <button type="submit" className="btn btn-success">
                Şablonu Yarat
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedGroup && (
        <div className="modal-overlay" onClick={() => setSelectedGroup(null)}>
          <div className="modal-content glass-card wide-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedGroup.name} - Redaktə Et</h3>
              <button className="btn-close" onClick={() => setSelectedGroup(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="permissions-selection-grid">
                {permissions.map((perm) => (
                  <label key={perm.id} className={`permission-item-card ${selectedPermissions.includes(perm.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handleTogglePermission(perm.id)}
                    />
                    <div className="perm-info">
                      <strong>{perm.name}</strong>
                      <code>{perm.code}</code>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteGroup(selectedGroup.id);
                  setSelectedGroup(null);
                }}
              >
                Sil
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedGroup(null)}>
                Ləğv Et
              </button>
              <button className="btn btn-success" onClick={handleSaveGroup}>
                Yadda Saxla
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Şablon Adı</th>
              <th>Təsvir</th>
              <th>İcazə Sayı</th>
              <th>Növ</th>
              <th>Status</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Heç bir şablon tapılmadı
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.id}>
                  <td>
                    <strong>{group.name}</strong>
                  </td>
                  <td>{group.description}</td>
                  <td>
                    <span className="badge">{group.permissions?.length || 0}</span>
                  </td>
                  <td>{group.is_template ? 'Şablon' : 'Fərdi'}</td>
                  <td>
                    {group.is_active ? (
                      <span className="text-success">● Aktiv</span>
                    ) : (
                      <span className="text-muted">○ Deaktiv</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleSelectGroup(group)}
                    >
                      ⚙️ Redaktə Et
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 32px;
        }
        .permissions-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
          background: rgba(0,0,0,0.02);
          border-radius: 8px;
        }
        .permission-item-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .permission-item-card.selected {
          border-color: #3e4a21;
          background: rgba(62, 74, 33, 0.05);
          box-shadow: 0 2px 4px rgba(62, 74, 33, 0.1);
        }
        .permission-item-card input {
          width: 18px;
          height: 18px;
          accent-color: #3e4a21;
        }
        .perm-info {
          display: flex;
          flex-direction: column;
        }
        .perm-info strong {
          font-size: 13px;
          color: #1a1f16;
        }
        .perm-info code {
          font-size: 11px;
          color: #64748b;
        }
        .mt-4 { margin-top: 1rem; }
        .text-success { color: #2d5a27; font-weight: bold; }
        .wide-modal { max-width: 1000px !important; }
        .form-actions { display: flex; justify-content: flex-end; }
      `}</style>
    </div>
  );
}
