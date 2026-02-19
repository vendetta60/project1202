"""
Drop and recreate all permission-related tables
"""
import sys
sys.path.insert(0, '.')

from app.db.base import Base
from app.db.session import engine
from sqlalchemy import text

from app.models.permission import Permission, Role, RolePermission, UserRole, UserPermission, PermissionGroup, PermissionGroupItem


def drop_and_recreate():
    """Drop permission tables and recreate them"""
    print("\n" + "="*60)
    print("Dropping and Recreating RBAC Tables")
    print("="*60 + "\n")
    
    try:
        with engine.connect() as connection:
            # Drop tables in reverse order of dependencies
            tables_to_drop = [
                "PermissionGroupItems",
                "PermissionGroups", 
                "UserPermissions",
                "UserRoles",
                "RolePermissions",
                "Roles",
                "Permissions",
            ]
            
            for table in tables_to_drop:
                try:
                    connection.execute(text(f"DROP TABLE IF EXISTS [{table}]"))
                    print(f"  Dropped table: {table}")
                except Exception as e:
                    print(f"  Note: Could not drop {table} (may not exist): {e}")
            
            connection.commit()
        
        # Now recreate the tables
        print("\n Creating tables...")
        Permission.__table__.create(engine, checkfirst=True)
        Role.__table__.create(engine, checkfirst=True)
        RolePermission.__table__.create(engine, checkfirst=True)
        UserRole.__table__.create(engine, checkfirst=True)
        UserPermission.__table__.create(engine, checkfirst=True)
        PermissionGroup.__table__.create(engine, checkfirst=True)
        PermissionGroupItem.__table__.create(engine, checkfirst=True)
        
        print("  ✓ All RBAC tables recreated successfully!\n")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = drop_and_recreate()
    sys.exit(0 if success else 1)
