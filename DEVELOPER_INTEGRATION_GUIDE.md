# Developer Integration Guide - RBAC System

## For Backend Developers

### 1. Add Permission Checks to Endpoints

#### Simple Single Permission Check

```python
from fastapi import Depends, HTTPException
from app.api.deps import get_current_user
from app.models.user import User

@router.get("/appeals")
def list_appeals(current_user: User = Depends(get_current_user)):
    if not current_user.has_permission("view_appeals"):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # Allowed - continue with endpoint logic
    return service.list()
```

#### Using Dependency Injection (Better)

```python
def require_permission(permission_code: str):
    async def check_permission(current_user: User = Depends(get_current_user)):
        if not current_user.has_permission(permission_code):
            raise HTTPException(status_code=403, detail="Permission denied")
        return current_user
    return check_permission

# Usage - much cleaner!
@router.get("/appeals")
def list_appeals(current_user: User = Depends(require_permission("view_appeals"))):
    return service.list(current_user)
```

#### Multiple Permissions (Any)

```python
def require_any_permission(permission_codes: list[str]):
    async def check(current_user: User = Depends(get_current_user)):
        if not current_user.has_any_permission(permission_codes):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return check

# Usage
@router.post("/appeals")
def create_appeal(
    current_user: User = Depends(require_any_permission(["create_appeal", "edit_appeal"]))
):
    return service.create(current_user)
```

#### Multiple Permissions (All)

```python
def require_all_permissions(permission_codes: list[str]):
    async def check(current_user: User = Depends(get_current_user)):
        if not current_user.has_all_permissions(permission_codes):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return check

# Usage - user needs ALL these
@router.delete("/appeals/{appeal_id}")
def delete_appeal(
    appeal_id: int,
    current_user: User = Depends(require_all_permissions(["view_appeals", "delete_appeal"]))
):
    return service.delete(appeal_id, current_user)
```

### 2. User Methods - Quick Reference

```python
from app.models.user import User

# Get all permission codes
perms: set[str] = user.get_permissions()
# Returns: {'view_appeals', 'create_appeal', 'edit_user', ...}

# Check single permission
can_view = user.has_permission("view_appeals")  # Boolean

# Check any of multiple
can_edit_or_delete = user.has_any_permission(["edit_appeal", "delete_appeal"])  # Boolean

# Check all of multiple
can_manage = user.has_all_permissions(["create_user", "edit_user", "delete_user"])  # Boolean

# Legacy compatibility
is_admin = user.is_admin  # Still checks tab1 field
```

### 3. Creating New Permissions in Code

```python
from app.repositories.permission import PermissionRepository
from app.db.session import SessionLocal

db = SessionLocal()
repo = PermissionRepository(db)

# During feature development
perm = repo.create(
    code="moderate_appeals",
    name="Moderate Appeals",
    description="Can moderate and override appeal statuses",
    category="appeals"
)

db.close()
```

### 4. Assigning Permissions to Users Programmatically

```python
from app.services.permission import UserPermissionService
from app.repositories.permission import UserRoleRepository, UserPermissionRepository
from app.db.session import SessionLocal

db = SessionLocal()

# Create service
user_perm_service = UserPermissionService(
    UserRoleRepository(db),
    UserPermissionRepository(db)
)

# Assign role to user
user_perm_service.assign_role(user_id=123, role_id=2)  # Assign Appeals Manager role

# Grant individual permission
user_perm_service.grant_permission(user_id=123, permission_id=45, created_by=1)

# Deny permission (override role)
user_perm_service.deny_permission(user_id=123, permission_id=46, created_by=1)

db.close()
```

### 5. Querying User Permissions

```python
from app.models.user import User
from app.db.session import SessionLocal

db = SessionLocal()
user = db.query(User).filter(User.id == 123).first()

# Get all permission codes
all_perms = user.get_permissions()

# Get assigned roles
role_ids = [ur.role_id for ur in user.user_roles]
roles = [ur.role for ur in user.user_roles]

# Get individual permission overrides
for override in user.user_permissions:
    if override.grant_type == "grant":
        print(f"Granted: {override.permission.code}")
    elif override.grant_type == "deny":
        print(f"Denied: {override.permission.code}")

db.close()
```

### 6. Full Endpoint Example

```python
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.models.user import User
from app.services.appeal import AppealService

router = APIRouter()

def require_permission(code: str):
    async def check(user: User = Depends(get_current_user)):
        if not user.has_permission(code):
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return check

@router.get("/appeals")
def list_appeals(
    current_user: User = Depends(require_permission("view_appeals")),
    skip: int = 0,
    limit: int = 50,
    service: AppealService = Depends(AppealService),
):
    """List appeals - requires view_appeals permission"""
    return service.list(skip=skip, limit=limit)

@router.post("/appeals")
def create_appeal(
    appeal: AppealCreate,
    current_user: User = Depends(require_permission("create_appeal")),
    service: AppealService = Depends(AppealService),
):
    """Create appeal - requires create_appeal permission"""
    return service.create(appeal, current_user)

@router.put("/appeals/{appeal_id}")
def update_appeal(
    appeal_id: int,
    appeal: AppealUpdate,
    current_user: User = Depends(require_permission("edit_appeal")),
    service: AppealService = Depends(AppealService),
):
    """Update appeal - requires edit_appeal permission"""
    return service.update(appeal_id, appeal, current_user)

@router.delete("/appeals/{appeal_id}")
def delete_appeal(
    appeal_id: int,
    current_user: User = Depends(require_permission("delete_appeal")),
    service: AppealService = Depends(AppealService),
):
    """Delete appeal - requires delete_appeal permission"""
    return service.delete(appeal_id, current_user)
```

---

## For Frontend Developers

### 1. Import Permissions API

```typescript
import {
  permissionApi,
  roleApi,
  permissionGroupApi,
  userPermissionApi
} from '@/api/permissions';
```

### 2. Check User Permissions in Components

```typescript
import { useEffect, useState } from 'react';
import { userPermissionApi } from '@/api/permissions';

function MyComponent() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuth().user;

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await userPermissionApi.getUserPermissions(user.id);
      setPermissions(response.data.permission_codes);
    } catch (error) {
      console.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {permissions.includes('view_appeals') && (
        <button onClick={handleViewAppeals}>View Appeals</button>
      )}
      {permissions.includes('create_appeal') && (
        <button onClick={handleCreateAppeal}>Create Appeal</button>
      )}
      {permissions.includes('edit_appeal') && (
        <button onClick={handleEditAppeal}>Edit Appeal</button>
      )}
    </div>
  );
}
```

### 3. Permission Guard Component

```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGuardProps {
  permission: string | string[];
  match?: 'any' | 'all'; // 'any' = at least one, 'all' = all required
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  match = 'any',
  children,
  fallback = null
}: PermissionGuardProps) {
  const { user } = useAuth();

  // Simple check (would be expanded based on stored permissions)
  if (Array.isArray(permission)) {
    if (match === 'all') {
      const hasAll = permission.every(p => user?.permissions?.includes(p));
      return hasAll ? <>{children}</> : <>{fallback}</>;
    } else {
      const hasAny = permission.some(p => user?.permissions?.includes(p));
      return hasAny ? <>{children}</> : <>{fallback}</>;
    }
  } else {
    const has = user?.permissions?.includes(permission);
    return has ? <>{children}</> : <>{fallback}</>;
  }
}

// Usage
<PermissionGuard permission="create_appeal">
  <button onClick={handleCreate}>Create Appeal</button>
</PermissionGuard>

<PermissionGuard 
  permission={["view_users", "edit_user"]}
  match="any"
>
  <UserManagement />
</PermissionGuard>
```

### 4. Admin Panel Usage

```typescript
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAuth } from '@/hooks/useAuth';

function AppLayout() {
  const { user } = useAuth();

  return (
    <div>
      {user?.permissions?.includes('access_admin_panel') && (
        <NavItem to="/admin" icon="settings">
          Admin
        </NavItem>
      )}
    </div>
  );
}

// Route protection
<Route path="/admin" element={<AdminPanel />} />
```

### 5. Assign Permissions to User

```typescript
import { userPermissionApi } from '@/api/permissions';

async function assignRoleToUser(userId: number, roleId: number) {
  try {
    await userPermissionApi.assignRole(userId, roleId);
    console.log('Role assigned successfully');
    // Refresh user data
    await refreshUserPermissions();
  } catch (error) {
    console.error('Failed to assign role:', error);
  }
}

async function grantPermission(userId: number, permissionId: number) {
  try {
    await userPermissionApi.grantPermission(userId, permissionId);
    console.log('Permission granted');
    // Refresh
    await refreshUserPermissions();
  } catch (error) {
    console.error('Failed to grant permission:', error);
  }
}
```

### 6. Apply Permission Group to User

```typescript
import { permissionGroupApi } from '@/api/permissions';

async function applyTemplateGroup(userId: number, groupId: number) {
  try {
    await permissionGroupApi.applyToUser(groupId, userId);
    console.log('Template applied successfully');
    // All permissions from template now assigned to user
    await refreshUserPermissions();
  } catch (error) {
    console.error('Failed to apply template:', error);
  }
}
```

### 7. Protected Page Component

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '@/components/PermissionGuard';

export function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!user?.permissions?.includes('access_admin_panel')) {
      navigate('/');
    }
  }, [user]);

  return (
    <div className="admin-panel">
      <h1>System Administration</h1>

      <section className="permissions-section">
        <h2>Permissions</h2>
        <PermissionGuard permission="manage_permissions">
          <PermissionsManagement />
        </PermissionGuard>
      </section>

      <section className="roles-section">
        <h2>Roles</h2>
        <PermissionGuard permission="manage_roles">
          <RolesManagement />
        </PermissionGuard>
      </section>

      <section className="users-section">
        <h2>User Permissions</h2>
        <PermissionGuard permission="manage_user_permissions">
          <UserPermissionsManagement />
        </PermissionGuard>
      </section>
    </div>
  );
}
```

---

## Standard Permission Naming Conventions

### Action Verbs
- `view` - Read/Display data
- `create` - Create new item
- `edit` - Modify existing item
- `delete` - Remove item
- `export` - Export/Download data
- `manage` - Full control (CRUD)
- `approve` - Approval workflow
- `assign` - Assign to someone
- `complete` - Mark as complete

### Examples
```
Good:
✓ view_appeals
✓ create_appeal
✓ edit_user
✓ delete_user
✓ export_reports
✓ manage_roles
✓ approve_appeal
✓ assign_appeal

Bad:
✗ appeals_view (backwards)
✗ can_delete (verb unnecessary)
✗ Appeals.Delete (wrong format)
✗ view_all_appeals_in_system (too specific)
```

---

## Testing Permissions

### Unit Test Example

```python
def test_user_has_permission(create_user_with_role):
    user = create_user_with_role("Appeals Manager")
    
    assert user.has_permission("view_appeals")
    assert user.has_permission("create_appeal")
    assert not user.has_permission("manage_roles")

def test_individual_override(create_user_with_role):
    user = create_user_with_role("Viewer")
    
    # Grant permission override
    grant_permission(user, "export_appeal")
    
    # User should have it even though role doesn't
    assert user.has_permission("export_appeal")

def test_permission_deny(create_user_with_role):
    user = create_user_with_role("System Admin")
    
    # Deny specific permission
    deny_permission(user, "delete_appeal")
    
    # User shouldn't have it despite role having all
    assert not user.has_permission("delete_appeal")
```

---

## Debugging Permissions

### Check User's Current Permissions

```python
# Backend
user = db.query(User).filter(User.id == 123).first()
print("Permissions:", user.get_permissions())
print("Roles:", [r.role.name for r in user.user_roles])
print("Overrides:", [
    (o.permission.code, o.grant_type) 
    for o in user.user_permissions
])
```

```typescript
// Frontend
const response = await userPermissionApi.getUserPermissions(userId);
console.log('Permission Codes:', response.data.permission_codes);
console.log('Role IDs:', response.data.role_ids);
```

### Common Issues & Solutions

**Issue**: User has role but doesn't have permission
```python
# Check if permission exists in role
role = db.query(Role).filter(Role.id == role_id).first()
print("Role Permissions:", [p.code for p in role.role.role_permissions])
```

**Issue**: Permission denied despite role assignment
```python
# Check for individual denies
user = db.query(User).filter(User.id == user_id).first()
denies = [p for p in user.user_permissions if p.grant_type == "deny"]
print("Denied Permissions:", [d.permission.code for d in denies])
```

---

## Checklist for Implementation

- [ ] Import permission decorators into endpoint files
- [ ] Add permission checks to all data-access endpoints
- [ ] Create frontend permission helper components
- [ ] Hide/disable UI elements based on permissions
- [ ] Test with different user roles
- [ ] Document which endpoints require which permissions
- [ ] Update API documentation with permission requirements
- [ ] Train admins on permission management
- [ ] Set up audit logging for permission changes
- [ ] Regular permission audits (quarterly)

---

**Ready to implement RBAC in your code! 🚀**
