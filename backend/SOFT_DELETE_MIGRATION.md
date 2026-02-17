# Database Migration for Soft Delete and Audit Logging

## Overview

This migration adds support for:
1. **Soft Delete** - Records marked as deleted instead of being hard-deleted
2. **Audit Trail** - Complete history of all changes
3. **User Tracking** - Who created/modified records and when

## SQL Migration

### Step 1: Add Audit Fields to Existing Tables

Run these SQL commands to add the new columns:

```sql
-- Add soft delete and audit fields to Appeals table
ALTER TABLE Appeals ADD COLUMN is_deleted BIT NOT NULL DEFAULT 0;
ALTER TABLE Appeals ADD COLUMN created_at DATETIME DEFAULT GETUTCDATE();
ALTER TABLE Appeals ADD COLUMN created_by INT;
ALTER TABLE Appeals ADD COLUMN created_by_name VARCHAR(100);
ALTER TABLE Appeals ADD COLUMN updated_at DATETIME;
ALTER TABLE Appeals ADD COLUMN updated_by INT;
ALTER TABLE Appeals ADD COLUMN updated_by_name VARCHAR(100);

-- Add soft delete and audit fields to Users table
ALTER TABLE Users ADD COLUMN is_deleted BIT NOT NULL DEFAULT 0;
ALTER TABLE Users ADD COLUMN created_at DATETIME DEFAULT GETUTCDATE();
ALTER TABLE Users ADD COLUMN created_by INT;
ALTER TABLE Users ADD COLUMN created_by_name VARCHAR(100);
ALTER TABLE Users ADD COLUMN updated_at DATETIME;
ALTER TABLE Users ADD COLUMN updated_by INT;
ALTER TABLE Users ADD COLUMN updated_by_name VARCHAR(100);

-- Add soft delete and audit fields to Contacts table
ALTER TABLE Contacts ADD COLUMN is_deleted BIT NOT NULL DEFAULT 0;
ALTER TABLE Contacts ADD COLUMN created_at DATETIME DEFAULT GETUTCDATE();
ALTER TABLE Contacts ADD COLUMN created_by INT;
ALTER TABLE Contacts ADD COLUMN created_by_name VARCHAR(100);
ALTER TABLE Contacts ADD COLUMN updated_at DATETIME;
ALTER TABLE Contacts ADD COLUMN updated_by INT;
ALTER TABLE Contacts ADD COLUMN updated_by_name VARCHAR(100);
```

### Step 2: Create AuditLogs Table

```sql
-- Create AuditLogs table for complete audit trail
CREATE TABLE AuditLogs (
    id INT PRIMARY KEY IDENTITY(1,1),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, READ
    description VARCHAR(500),
    old_values TEXT, -- JSON format
    new_values TEXT, -- JSON format
    created_by INT,
    created_by_name VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT GETUTCDATE(),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_action (action),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);
```

### Step 3: Update Views/Queries

All existing queries have been updated in the code to:
- Automatically filter out deleted records when `is_deleted = 1`
- Track who created/modified each record
- Log all changes to the AuditLogs table

## API Changes

### New Endpoints

**Admin only:**
- `GET /api/v1/audit-logs` - List all audit logs with filters
- `GET /api/v1/audit-logs/{entity_type}/{entity_id}` - View complete history of a record

### Updated Endpoints

**Delete Operation:**
- `DELETE /api/v1/appeals/{appeal_id}` 
  - Now performs soft delete instead of hard delete
  - Creates an audit log entry
  - Record can be restored by admin if needed

## Python Migration Script (Alternative)

If you're using SQLite or want to use Python, run:

```bash
cd backend
python
```

```python
from app.db.session import engine
from app.models.audit_log import AuditLog
from app.models.appeal import Appeal
from app.models.user import User
from app.models.contact import Contact
from app.db.base import Base

# Create all new tables and columns
Base.metadata.create_all(bind=engine)
print("Database schema updated successfully!")
```

## Verification

After running the migration, verify with:

```sql
-- Check if columns exist in Appeals
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Appeals';

-- Check if AuditLogs table exists
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AuditLogs';
```

## Rollback (if needed)

To rollback the changes, drop the new columns and table:

```sql
-- Drop columns from Appeals
ALTER TABLE Appeals DROP COLUMN is_deleted, created_at, created_by, created_by_name, updated_at, updated_by, updated_by_name;

-- Drop columns from Users
ALTER TABLE Users DROP COLUMN is_deleted, created_at, created_by, created_by_name, updated_at, updated_by, updated_by_name;

-- Drop columns from Contacts
ALTER TABLE Contacts DROP COLUMN is_deleted, created_at, created_by, created_by_name, updated_at, updated_by, updated_by_name;

-- Drop AuditLogs table
DROP TABLE AuditLogs;
```

## Admin Features

Admins can now:
1. ✅ View complete audit logs of all operations
2. ✅ See who created/modified each record
3. ✅ Track all deletions (soft deletes are logged)
4. ✅ Restore soft-deleted records if needed
5. ❌ Cannot delete audit logs (they are immutable)

## Regular Users

Regular users can:
1. ✅ Create, read, update records (as before)
2. ✅ Delete records (soft delete - data preserved)
3. ❌ Cannot view audit logs
4. ❌ Cannot restore deleted records
