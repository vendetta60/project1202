# Database Migration Guide

## Current Status

✅ **Backend code is complete and error-free**
⚠️ **Database schema needs to be updated**

The server starts successfully but encounters a database error because the new columns and tables don't exist yet:
- Missing column: `users.email`
- Missing column: `users.last_login`  
- Missing table: `roles`
- Missing table: `user_roles`

## Quick Fix Options

### Option 1: Manual SQL Migration (Fastest)

Run these SQL commands on your SQLite database:

```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD COLUMN last_login DATETIME;

-- Create roles table
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON NOT NULL DEFAULT '[]',
    is_system BOOLEAN NOT NULL DEFAULT 0
);

-- Create user_roles association table
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX ix_roles_name ON roles(name);
CREATE INDEX ix_user_roles_user_id ON user_roles(user_id);
CREATE INDEX ix_user_roles_role_id ON user_roles(role_id);
```

### Option 2: Use Alembic (Recommended for Production)

1. **Initialize Alembic**:
```bash
cd backend
alembic init alembic
```

2. **Configure Alembic** (`alembic.ini`):
```ini
sqlalchemy.url = sqlite:///./app.db
```

3. **Update `alembic/env.py`**:
```python
from app.models import Base
target_metadata = Base.metadata
```

4. **Generate Migration**:
```bash
alembic revision --autogenerate -m "Add roles and user enhancements"
```

5. **Run Migration**:
```bash
alembic upgrade head
```

### Option 3: Delete and Recreate Database (Development Only)

⚠️ **WARNING: This will delete all existing data!**

```bash
cd backend
rm app.db  # Delete existing database
python -c "from app.db.session import engine; from app.models import Base; Base.metadata.create_all(engine)"
```

Then restart the server - it will automatically create the default roles via bootstrap.

### Option 4: Add New Fields to Appeals Table

Run these SQL commands to add the new fields to the `appeals` table:

```sql
ALTER TABLE appeals ADD COLUMN registration_number VARCHAR(50) UNIQUE;
ALTER TABLE appeals ADD COLUMN registration_date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE appeals ADD COLUMN execution_deadline DATETIME;
ALTER TABLE appeals ADD COLUMN originating_military_unit VARCHAR(255);
ALTER TABLE appeals ADD COLUMN leader_decision VARCHAR(255);
ALTER TABLE appeals ADD COLUMN other_military_unit_number VARCHAR(100);
ALTER TABLE appeals ADD COLUMN other_institution_date DATETIME;
ALTER TABLE appeals ADD COLUMN incoming_appeal_number VARCHAR(100);
ALTER TABLE appeals ADD COLUMN incoming_appeal_date DATETIME;
ALTER TABLE appeals ADD COLUMN originating_institution VARCHAR(255);
ALTER TABLE appeals ADD COLUMN appeal_submitter VARCHAR(255);
ALTER TABLE appeals ADD COLUMN submitter_full_name VARCHAR(255);
ALTER TABLE appeals ADD COLUMN address VARCHAR(255);
ALTER TABLE appeals ADD COLUMN appeal_review_status VARCHAR(255);
ALTER TABLE appeals ADD COLUMN page_count INTEGER;
ALTER TABLE appeals ADD COLUMN email VARCHAR(255);
ALTER TABLE appeals ADD COLUMN phone_number VARCHAR(50);
ALTER TABLE appeals ADD COLUMN is_repeat_appeal BOOLEAN DEFAULT 0;
ALTER TABLE appeals ADD COLUMN reviewed_by VARCHAR(255);
ALTER TABLE appeals ADD COLUMN is_under_supervision BOOLEAN DEFAULT 0;
ALTER TABLE appeals ADD COLUMN short_content TEXT;
ALTER TABLE appeals ADD COLUMN appeal_type VARCHAR(100);
ALTER TABLE appeals ADD COLUMN report_index VARCHAR(100);
ALTER TABLE appeals ADD COLUMN appeal_index VARCHAR(100);
```

After running the above commands, restart the backend server and verify the changes.

## After Migration

Once you've applied the migration using any of the above options:

1. **Restart the backend server**:
```bash
uvicorn app.main:app --reload
```

2. **Verify the bootstrap worked**:
   - Check the console output for "✅ Created system role" messages
   - The default roles (Super Admin, Admin, Operator, Viewer) should be created
   - The bootstrap admin user should be assigned the Super Admin role

3. **Test the API**:
   - Navigate to `http://localhost:8000/docs`
   - Login with your admin credentials
   - Test the `/api/v1/roles` endpoint to see the default roles
   - Test the `/api/v1/users` endpoint to see user management

4. **Start the frontend**:
```bash
cd frontend
npm run dev
```

5. **Test the admin panel**:
   - Login as admin
   - Navigate to "İstifadəçilər" (Users) in the menu
   - Test creating, editing, and assigning roles to users

ALTER TABLE appeals ADD COLUMN submitter_saa VARCHAR(100);
-- Create military_units table
CREATE TABLE IF NOT EXISTS military_units (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   name VARCHAR(255) NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS ix_military_units_name ON military_units(name);

### If you see "no such column" errors:
- The migration hasn't been applied yet
- Use one of the options above to update the database schema

### If roles aren't created:
- Check the console output for bootstrap messages
- The bootstrap runs automatically on server startup
- If no roles exist, they will be created
- If system roles exist, they will be updated with latest permissions

### If you can't assign roles:
- Make sure the roles table exists and has data
- Check that the user_roles association table exists
- Verify the foreign key constraints are in place
