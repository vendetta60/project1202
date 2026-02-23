import React, { useEffect, useState } from 'react';
import { permissionApi } from '../../api/permissions';
import './AdminPanel.css';

interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
}

export function PermissionsManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await permissionApi.listAll();
      setPermissions(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'İcazələr yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await permissionApi.create({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        category: formData.category
      });
      setFormData({ code: '', name: '', description: '', category: '' });
      setShowForm(false);
      setSuccess('Yeni icazə uğurla yaradıldı');
      await loadPermissions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'İcazə yaradıla bilmədi');
    }
  };

  if (loading) return <div className="loading">Yüklənir...</div>;

  return (
    <div className="admin-section animate-fade-in">
      <div className="section-header">
        <h2>Sistem İcazələrinin İdarə Edilməsi</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Ləğv Et' : '➕ Yeni İcazə'}
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
      {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

      {showForm && (
        <div className="form-card glass-card animate-slide-up">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>İcazə Kodu (Permission Code) *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="məs., view_appeals"
                  required
                />
              </div>
              <div className="form-group">
                <label>İcazənin Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="məs., Müraciətlərə Baxış"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Təsvir</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Bu icazə nəyə imkan verir?"
                rows={2}
              />
            </div>
            <div className="form-group">
              <label>Kateqoriya</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Kateqoriya seçin</option>
                <option value="appeals">Müraciətlər</option>
                <option value="users">İstifadəçilər</option>
                <option value="reports">Hesabatlar</option>
                <option value="audit">Audit</option>
                <option value="citizens">Vətəndaşlar</option>
                <option value="admin">Administrasiya</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button type="submit" className="btn btn-success">
                İcazəni Yarat
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kod</th>
              <th>Ad</th>
              <th>Kateqoriya</th>
              <th>Təsvir</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  Heç bir icazə tapılmadı
                </td>
              </tr>
            ) : (
              permissions.sort((a, b) => (a.category || '').localeCompare(b.category || '')).map((perm) => (
                <tr key={perm.id}>
                  <td>
                    <code>{perm.code}</code>
                  </td>
                  <td><strong>{perm.name}</strong></td>
                  <td>
                    <span className="badge">{perm.category || 'Təyin edilməyib'}</span>
                  </td>
                  <td>{perm.description}</td>
                  <td>
                    {perm.is_active ? (
                      <span className="text-success">● Aktiv</span>
                    ) : (
                      <span className="text-muted">○ Deaktiv</span>
                    )}
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
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .text-success { color: #2d5a27; font-weight: bold; }
        .mt-4 { margin-top: 1rem; }
        .form-actions { display: flex; justify-content: flex-end; }
      `}</style>
    </div>
  );
}
