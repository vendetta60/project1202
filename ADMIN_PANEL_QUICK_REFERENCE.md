# Admin Panel Quick Reference Guide

## 🔐 Login Credentials (Default - CHANGE IMMEDIATELY!)

```
Username: admin
Password: admin123
```

⚠️ **Change these immediately after first login!**

---

## 🎯 Admin Panel Tabs

### Tab 1: Permissions 🔐
**View and manage individual permissions that control what actions users can perform.**

#### What is a Permission?
A single, specific action that can be performed in the system.
- Examples: `view_appeals`, `create_appeal`, `edit_user`, `manage_roles`

#### How to Use
1. **View all permissions**: Click "Permissions" tab to see all system permissions
2. **Create new permission**:
   - Click "Add Permission" button
   - Enter permission code (e.g., `archive_appeal`)
   - Enter name (e.g., "Archive Appeal")
   - Choose category (Appeals, Users, Reports, etc.)
   - Click "Create Permission"

#### When to Use
- Create custom permissions for new features
- Organize permissions by category for better management

---

### Tab 2: Roles 👥
**Create and manage roles (collections of permissions).**

#### What is a Role?
A predefined set of permissions that can be assigned to multiple users.
- System roles (built-in): System Admin, Appeals Manager, Report Analyst, Viewer
- Custom roles: Create your own based on job titles

#### How to Use
1. **View all roles**: See all system and custom roles
2. **Create new role**:
   - Click "Create Role" button
   - Enter role name (e.g., "Executor")
   - Enter description (e.g., "Can manage assigned appeals")
   - Click "Create Role"
3. **Assign permissions to role**:
   - Click "Edit Permissions" button on a role
   - Check/uncheck permissions to include
   - Click "Save Permissions"
4. **Delete role**: Only custom roles can be deleted

#### When to Use
- Create role for each organizational unit/job title
- Assign broad sets of permissions at once
- Ensure consistent permissions across team

#### Tips
- Use role names that match job titles
- System Admin has all permissions and cannot be modified
- Keep roles generic to avoid creating too many

---

### Tab 3: Templates 📦
**Create permission group templates for quick user setup.**

#### What is a Permission Template?
A pre-configured collection of permissions that can be quickly applied to users.
- Speed up onboarding of new users
- Standardize permission sets across organization
- Quick alternative to manually assigning roles

#### Built-in Templates
- **Appeals Manager Group**: For appeals management team
- **Report Generator Group**: For report creation team
- **User Administrator Group**: For user management
- **Citizen Support Group**: For citizen support staff

#### How to Use
1. **View templates**: See all available permission groups
2. **Create new template**:
   - Click "Create Template" button
   - Enter template name (e.g., "Supervisor")
   - Optional: Add description
   - Check permissions to include in template
   - Click "Create Template"
3. **Edit template**:
   - Click "Edit" on a template
   - Add/remove permissions
   - Click "Save Changes"
4. **Delete template**: Click "Edit" then "Delete Group"

#### When to Use
- Before assigning permissions to many users
- To group commonly-used permission combinations
- For organizational standardization

#### Difference from Roles
- **Roles**: Assign to users, then user gets all role permissions
- **Templates**: Quick way to grant multiple permissions at once
- **Recommendation**: Use roles for ongoing management, templates for batch operations

---

### Tab 4: User Permissions 👤
**Assign roles and permissions to individual users.**

#### How to Use

##### Step 1: Select a User
- Left panel shows all users
- Click on a user to select them
- User's current roles and permissions appear on the right

##### Step 2: Manage Roles
1. **Add a role**:
   - Click dropdown "Select a role to assign"
   - Choose role (e.g., "Appeals Manager")
   - Click "Assign" button
   
2. **Remove a role**:
   - Click × button on the role badge
   - Confirm removal

##### Step 3: Apply Permission Template
- Click on any template button (e.g., "Appeals Manager Group")
- All permissions from that template are granted to the user
- ⚠️ This replaces any previous individual permissions

##### Step 4: View Current Permissions
- See list of all permissions user currently has
- From both assigned roles and individual grants/denies

#### Examples

**Example 1: Create Appeals Manager**
1. Select user
2. Assign "Appeals Manager" role
3. OR Click "Appeals Manager Group" template
→ User can now manage appeals

**Example 2: Give Special Permission**
This is for exceptions. Example: Give a viewer user permission to export appeals
1. Select user
2. User already has "Viewer" role (read-only)
3. Need to give export capability
4. Use Admin Panel to individually grant `export_appeals` permission

#### When to Use
- New employee joins
- Employee gets promoted/changes role
- Quick onboarding using templates
- Exception for specific users

---

## 📊 Permission Management Workflow

### Typical Workflow for New Employee

1. **Go to User Permissions tab** 👤
2. **Find and select employee**
3. **Choose assignment method**:
   - **Option A (Recommended)**: Click appropriate template
   - **Option B**: Assign role(s) manually
4. **Verify permissions** in the list
5. **Done!** - Employee now has access

### Example Scenarios

#### Scenario 1: New Appeals Officer
1. Tab 4 (User Permissions)
2. Select new employee
3. Click "Appeals Manager Group" template
4. ✓ Employee has all appeals permissions

#### Scenario 2: New Supervisor (Complex Role)
1. Tab 4 (User Permissions)
2. Select supervisor
3. Assign "Appeals Manager" role
4. Add individual "manage_user_roles" permission
5. Add individual "view_audit_logs" permission
6. ✓ Supervisor has custom permission set

#### Scenario 3: New Permission Type Needed
1. Tab 1 (Permissions)
2. Click "Add Permission"
3. Create new permission (e.g., "archive_appeal")
4. Tab 2 (Roles)
5. Edit "Appeals Manager" role
6. Check new permission
7. Save
8. ✓ All Appeals Managers now have new permission

---

## 🚨 Common Issues & Solutions

### "User Can't Access Admin panel"
**Cause**: User doesn't have `access_admin_panel` permission
**Solution**: 
1. Go to User Permissions tab
2. Select user
3. Need to give admin access role or permission
4. Or assign role that includes admin permission

### "User Lost All Permissions"
**Cause**: Roles were revoked or template overwrote permissions
**Solution**:
1. Go to User Permissions tab
2. Select user
3. Reapply roles or template
4. Add back any individual permissions

### "Can't Delete System Role"
**Cause**: System Admin, Appeals Manager, Report Analyst, Viewer are system roles
**Solution**:
- Create a new custom role instead
- Only custom roles can be deleted

### "Permission Changes Not Showing"
**Cause**: User needs to logout and login to refresh
**Solution**:
- Have user logout and login again
- Or clear browser cache

---

## 💡 Best Practices

### 1. Use Roles, Not Individual Permissions
✅ **Good**: Assign "Appeals Manager" role
❌ **Bad**: Manually grant 8 individual appeal permissions

### 2. Use Templates for Onboarding
✅ **Good**: Click "Appeals Manager Group" to set up new employee
❌ **Bad**: Manually assign each permission one by one

### 3. Name Roles Clearly
✅ **Good**: "Appeals Manager", "Report Analyst", "Supervisor"
❌ **Bad**: "Role1", "Special", "Mixed"

### 4. Document Custom Permissions
- Use clear names and descriptions
- Document why they were created
- Track who has them and why

### 5. Regular Audit
- Quarterly review of user permissions
- Remove permissions for people who left
- Check for over-privileged users

### 6. Principle of Least Privilege
- Give users minimum permissions needed
- Don't grant admin access unless necessary
- Use individual denies sparingly (only for exceptions)

---

## 🔒 Security Reminders

1. **Change Default Admin Password**
   - Immediately after first login
   - Use strong password (12+ chars, mixed case, numbers, symbols)

2. **Don't Share Admin Credentials**
   - Each admin should have own account
   - Enable audit logging

3. **Review User Access Regularly**
   - Who has access to what?
   - Are permissions still appropriate?
   - Who left but still has access?

4. **Document Permission Grants**
   - Why does user X have permission Y?
   - When was it granted?
   - By whom?

5. **Test Before Deploying**
   - New feature + new permission?
   - Check it works correctly
   - Test with different user roles

---

## ⌨️ Keyboard Tips

### Admin Panel
- Tab between fields with **Tab** key
- Enter to submit forms
- Escape to close modals

### Tables
- Scroll right on mobile to see more columns
- Click headers to sort (if implemented)
- Click rows to select

---

## 📞 Support

### For Admin Panel Issues
1. Check user has `access_admin_panel` permission
2. Refresh page or logout/login
3. Check browser console for errors
4. Contact IT support if problem persists

### For Permission Issues
1. Verify permission code is correct
2. Check user's roles
3. Look for individual permission denies
4. See User Permissions tab for current permissions

---

## 🎓 Learning Resources

- Full documentation: See `RBAC_SYSTEM.md`
- API reference: See API endpoints in documentation
- Code examples: See permission usage in backend code

---

**System Ready! Happy Administrating! 🚀**
