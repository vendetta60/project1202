import React, { useState } from 'react';
import { PermissionsManagement } from './PermissionsManagement';
import { RolesManagement } from './RolesManagement';
import { PermissionGroupsManagement } from './PermissionGroupsManagement';
import { UserPermissionsManagement } from './UserPermissionsManagement';
import { FeedbackInbox } from './FeedbackInbox';
import './AdminPanel.css';

type AdminTab = 'permissions' | 'roles' | 'groups' | 'users' | 'feedback';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users'); // Default to users for easier onboarding

  return (
    <div className="admin-panel-container animate-fade-in">
      <div className="admin-header glass-card">
        <div className="header-icon">🪖</div>
        <div>
          <h1>Mərkəzi İdarəetmə Paneli</h1>
          <p>Sistem icazələri, rollar, şablon qrupları və istifadəçi girişlərinin idarə edilməsi</p>
        </div>
      </div>

      <div className="admin-tabs-container">
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-icon">👤</span>
            İstifadəçi İcazələri
          </button>
          <button
            className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <span className="tab-icon">💬</span>
            Təklif və İradlar
          </button>
          <button
            className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <span className="tab-icon">👥</span>
            Rollar (Qruplar)
          </button>
          <button
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <span className="tab-icon">📦</span>
            Şablon Qruplar
          </button>
          <button
            className={`tab-button ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            <span className="tab-icon">🔐</span>
            İcazələr
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'permissions' && <PermissionsManagement />}
        {activeTab === 'roles' && <RolesManagement />}
        {activeTab === 'groups' && <PermissionGroupsManagement />}
        {activeTab === 'users' && <UserPermissionsManagement />}
        {activeTab === 'feedback' && <FeedbackInbox />}
      </div>

      <style>{`
        .admin-panel-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 20px;
        }

        .admin-header {
          margin-bottom: 40px;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          border-left: 6px solid var(--app-primary);
        }

        .header-icon {
          font-size: 48px;
          background: var(--app-primary);
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .admin-header h1 {
          margin: 0 0 4px 0;
          font-size: 32px;
          font-weight: 800;
          color: var(--app-text);
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }

        .admin-header p {
          margin: 0;
          color: var(--app-text-secondary);
          font-size: 16px;
          font-weight: 500;
        }

        .admin-tabs-container {
          margin-bottom: 32px;
          border-bottom: 2px solid var(--app-border);
        }

        .admin-tabs {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }

        .admin-tabs::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          padding: 14px 24px;
          background: transparent;
          border: none;
          border-bottom: 4px solid transparent;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          color: var(--app-text-secondary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        body[data-theme="dark"] .tab-button {
          color: rgba(248, 250, 252, 0.75);
        }

        .tab-button:hover {
          color: var(--app-primary);
          background: var(--app-border);
        }

        body[data-theme="dark"] .tab-button:hover {
          color: var(--app-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .tab-button.active {
          color: var(--app-primary);
          border-bottom-color: var(--app-primary);
          background: var(--app-border);
        }

        body[data-theme="dark"] .tab-button.active {
          color: white;
          border-bottom-color: var(--app-primary);
          background: var(--app-primary);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-bottom-width: 4px;
        }

        .tab-icon {
          font-size: 18px;
        }

        .admin-content {
          animation: slideUp 0.4s ease-out;
        }

        @media (max-width: 768px) {
          .admin-panel-container {
            padding: 20px 16px;
          }

          .admin-header {
            flex-direction: column;
            text-align: center;
            padding: 24px;
            gap: 16px;
          }

          .admin-header h1 {
            font-size: 24px;
          }

          .tab-button {
            padding: 12px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
