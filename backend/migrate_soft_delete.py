#!/usr/bin/env python
"""
Database migration script for soft delete and audit logging features
Run this script to update your database schema

Usage:
    python migrate_soft_delete.py
"""
import sys
from datetime import datetime

def apply_migration():
    """Apply database migrations"""
    try:
        from app.db.session import engine
        from app.db.base import Base
        from app.models.audit_log import AuditLog
        from app.models.appeal import Appeal
        from app.models.user import User
        from app.models.contact import Contact
        
        print("Starting database migration for soft delete and audit logging...")
        print(f"Timestamp: {datetime.now()}")
        print("-" * 60)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database schema updated successfully!")
        print("-" * 60)
        print("\nChanges applied:")
        print("  • Added audit fields to Appeals table")
        print("  • Added audit fields to Users table")
        print("  • Added audit fields to Contacts table")
        print("  • Created AuditLogs table")
        print("\nNew fields added to each table:")
        print("  • is_deleted (BOOLEAN) - Soft delete flag")
        print("  • created_at (DATETIME) - Creation timestamp")
        print("  • created_by (INT) - User ID who created")
        print("  • created_by_name (STRING) - Username who created")
        print("  • updated_at (DATETIME) - Last update timestamp")
        print("  • updated_by (INT) - User ID who updated")
        print("  • updated_by_name (STRING) - Username who updated")
        print("\nNew AuditLogs table fields:")
        print("  • id - Auto-incrementing primary key")
        print("  • entity_type - Type of entity (Appeal, User, Contact)")
        print("  • entity_id - ID of the affected record")
        print("  • action - Action type (CREATE, UPDATE, DELETE)")
        print("  • description - Human-readable description")
        print("  • old_values - JSON of old field values")
        print("  • new_values - JSON of new field values")
        print("  • created_by - User ID who performed action")
        print("  • created_by_name - Username who performed action")
        print("  • created_at - When action was performed")
        print("  • ip_address - IP address of requester")
        print("  • user_agent - Browser info")
        print("\nNew API endpoints (Admin only):")
        print("  • GET /api/v1/audit-logs - List all audit logs")
        print("  • GET /api/v1/audit-logs/{entity_type}/{entity_id} - View entity history")
        print("\nMigration completed! You can now use soft delete and audit logging.")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = apply_migration()
    sys.exit(0 if success else 1)
