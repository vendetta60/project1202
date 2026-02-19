# Role-Based Access Control (RBAC) System

## Overview

The system now includes a comprehensive Role-Based Access Control (RBAC) system that allows fine-grained permission management. Users can be assigned roles, and roles contain sets of permissions. Additionally, individual user permissions can be granted or denied to override role-based permissions.

## Key Components

### 1. **Permissions**
Individual actions that can be performed in the system.

**Examples:**
- `view_appeals` - View appeal list
- `create_appeal` - Create new appeal
- `edit_user` - Edit user details
- `manage_roles` - Create, edit, delete roles
- `access_admin_panel` - Access system administration panel

**Categories:**
- `appeals` - Appeal-related operations
- `users` - User management
- `reports` - Report generation and viewing
- `audit` - Audit log access
- `citizens` - Citizen management
- `admin` - System administration

### 2. **Roles**
Predefined sets of permissions that can be assigned to users.

**System Roles (Cannot be deleted):**
- **System Admin** - Full system access (all permissions)
- **Appeals Manager** - Can manage appeals, view details, assign to executors
- **Report Analyst** - Can view appeals and generate reports
- **Viewer** - Read-only access to appeals and reports

**Custom Roles:**
Users with `manage_roles` permission can create custom roles.

### 3. **Permission Groups (Templates)**
Pre-configured collections of permissions that can be quickly applied to users.

**Built-in Templates:**
- **Appeals Manager Group** - Permissions for appeals management team
- **Report Generator Group** - Permissions for report generation
- **User Administrator Group** - Permissions for user management
- **Citizen Support Group** - Permissions for citizen support staff

### 4. **User Permissions**
Individual user-level permission overrides on top of role-based permissions.

**Types:**
- **Grant** - Explicitly grant a permission to a user
- **Deny** - Explicitly deny a permission to a user (overrides role permissions)

## Access Hierarchy

```
Role Permissions (base)
         ↓
User Grants/Denies (overrides)
         ↓
Final User Permissions
```

## Default Admin User

A default admin user is created during initialization:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** System Admin
- **⚠️ IMPORTANT:** Change this password immediately after first login!

## Database Schema

### Tables

1. **Permissions**
   - id (PK)
   - code (unique)
   - name
   - description
   - category
   - is_active
   - created_at

2. **Roles**
   - id (PK)
   - name (unique)
   - description
   - is_system
   - is_active
   - created_at

3. **RolePermissions** (Junction Table)
   - role_id (FK)
   - permission_id (FK)

4. **UserRoles** (Junction Table)
   - user_id (FK)
   - role_id (FK)

5. **UserPermissions** (Individual Overrides)
   - user_id (FK)
   - permission_id (FK)
   - grant_type ('grant' or 'deny')
   - created_by
   - created_at

6. **PermissionGroups** (Templates)
   - id (PK)
   - name
   - description
   - is_template
   - is_active
   - created_at

7. **PermissionGroupItems** (Junction Table)
   - group_id (FK)
   - permission_id (FK)

## API Endpoints

### Permissions Management
```
GET /api/v1/permissions/list - List all permissions
GET /api/v1/permissions/categories/{category} - Get permissions by category
POST /api/v1/permissions/create - Create new permission
```

### Roles Management
```
GET /api/v1/permissions/roles/list - List all roles
GET /api/v1/permissions/roles/{role_id} - Get role with permissions
POST /api/v1/permissions/roles/create - Create new role
PUT /api/v1/permissions/roles/{role_id} - Update role
DELETE /api/v1/permissions/roles/{role_id} - Delete role
POST /api/v1/permissions/roles/{role_id}/permissions/{permission_id} - Add permission
DELETE /api/v1/permissions/roles/{role_id}/permissions/{permission_id} - Remove permission
POST /api/v1/permissions/roles/{role_id}/permissions/set - Set all permissions (bulk)
```

### Permission Groups
```
GET /api/v1/permissions/groups/list - List groups
GET /api/v1/permissions/groups/{group_id} - Get group details
POST /api/v1/permissions/groups/create - Create group
PUT /api/v1/permissions/groups/{group_id} - Update group
DELETE /api/v1/permissions/groups/{group_id} - Delete group
POST /api/v1/permissions/groups/{group_id}/apply-to-user/{user_id} - Apply group to user
```

### User Permissions
```
GET /api/v1/permissions/users/{user_id}/permissions - Get user's all permissions
POST /api/v1/permissions/users/{user_id}/roles/{role_id} - Assign role to user
DELETE /api/v1/permissions/users/{user_id}/roles/{role_id} - Revoke role from user
POST /api/v1/permissions/users/{user_id}/permissions/{permission_id}/grant - Grant permission
POST /api/v1/permissions/users/{user_id}/permissions/{permission_id}/deny - Deny permission
DELETE /api/v1/permissions/users/{user_id}/permissions/{permission_id}/override - Remove override
```

## Admin Panel

The frontend includes a comprehensive Admin Panel accessible only to users with `access_admin_panel` permission.

### Tabs

1. **Permissions** - View and create permissions
2. **Roles** - Create roles and assign permissions to them
3. **Templates** - Create permission group templates
4. **User Permissions** - Assign roles and permissions to individual users

## Usage Examples

### 1. Check if User Has Permission (Backend)

```python
from app.models.user import User
from app.db.session import SessionLocal

db = SessionLocal()
user = db.query(User).filter(User.id == user_id).first()

# Check single permission
if user.has_permission("view_appeals"):
    # Allow action
    pass

# Check multiple permissions (any)
if user.has_any_permission(["view_appeals", "edit_appeal"]):
    # Allow action
    pass

# Check multiple permissions (all)
if user.has_all_permissions(["view_appeals", "edit_appeal"]):
    # Allow action
    pass
```

### 2. Create Permission Dependency Check (FastAPI Decorator)

```python
from fastapi import Depends, HTTPException
from app.api.deps import get_current_user
from app.models.user import User

def require_permission(permission_code: str):
    async def check_permission(current_user: User = Depends(get_current_user)):
        if not current_user.has_permission(permission_code):
            raise HTTPException(status_code=403, detail="Permission denied")
        return current_user
    return check_permission

# Usage in endpoint
@router.get("/appeals")
def list_appeals(current_user: User = Depends(require_permission("view_appeals"))):
    # User has view_appeals permission
    pass
```

### 3. Assign Role to User (Frontend)

```typescript
import { userPermissionApi } from '@/api/permissions';

// Assign role
await userPermissionApi.assignRole(userId, roleId);

// Revoke role
await userPermissionApi.revokeRole(userId, roleId);
```

### 4. Apply Permission Group to User

```typescript
import { permissionGroupApi } from '@/api/permissions';

// Apply all permissions from a template group
await permissionGroupApi.applyToUser(groupId, userId);
```

## Setup Instructions

### Backend Setup

1. **Create tables and initialize RBAC:**
   ```bash
   cd backend
   python create_tables.py  # Create all tables
   python init_rbac.py      # Initialize permissions, roles, groups
   ```

2. **Update existing endpoints to use permission checking:**
   ```python
   # Example: Update appeals endpoint
   @router.get("/appeals")
   def list_appeals(
       current_user: User = Depends(require_permission("view_appeals")),
       service: AppealService = Depends(get_appeal_service),
   ):
       return service.list()
   ```

### Frontend Setup

1. **Import and use Admin Panel:**
   ```typescript
   import { AdminPanel } from '@/components/admin/AdminPanel';
   
   // In your main App or routing
   <Route path="/admin" element={<AdminPanel />} />
   ```

2. **Protect admin routes:**
   ```typescript
   // Check user permissions before showing admin panel
   if (user.has_permission("access_admin_panel")) {
       // Show admin panel
   }
   ```

## Migration Guide (From Old System)

The old system used hardcoded tab/but permissions. The new RBAC system provides more flexibility:

### Old System:
```python
user.tab1 = True  # Admin access
user.tab2 = True  # Some other feature
```

### New System:
```python
# Assign entire role at once
user_permission_service.assign_role(user_id, admin_role_id)

# Or grant individual permissions
user_permission_service.grant_permission(user_id, view_appeals_perm_id)
user_permission_service.grant_permission(user_id, create_appeal_perm_id)
```

The old `is_admin` property still works and checks the `tab1` field for backward compatibility.

## Best Practices

1. **Use Roles for Common Scenarios**
   - Create roles for job titles/functions
   - Assign users to roles, not individual permissions

2. **Use Permission Groups as Templates**
   - Create templates for quickly onboarding new users
   - Standardize permission sets across the organization

3. **Use Individual Permissions Sparingly**
   - Only use individual permission grants/denies for exceptions
   - Document why individual overrides are needed

4. **Follow Principle of Least Privilege**
   - Grant users only the permissions they need
   - Regularly audit user permissions

5. **System Roles**
   - Don't modify system roles
   - Create custom roles if you need variations

6. **Audit Trail**
   - Track who grants/denies permissions
   - created_by field records permission override creator

## Security Considerations

1. **Default Admin Password**
   - Change `admin`/`admin123` immediately after setup
   - Use strong passwords for admin users

2. **Permission Checking**
   - Always check permissions on API endpoints
   - Don't rely on frontend checks alone

3. **Role Management**
   - Only admins can create/modify roles
   - Audit permission assignments regularly

4. **Data Access**
   - Apply permissions to all data access operations
   - Implement query-level filtering based on permissions

## Troubleshooting

### User Can't Access Admin Panel
- Check if user has `access_admin_panel` permission
- Verify user's role is active
- Check individual permission overrides

### Permission Not Working
- Verify permission code is correct (case-sensitive)
- Check if permission is active
- Review user's roles and individual overrides

### Role Won't Delete
- System roles cannot be deleted
- Check if role has `is_system=true`
- Reassign users to other roles before deleting

## Future Enhancements

Potential improvements:
- Permission inheritance from parent permissions
- Permission groups with conditional logic
- Attribute-based access control (ABAC)
- Dynamic permission validation
- Permission usage analytics and audit reports
