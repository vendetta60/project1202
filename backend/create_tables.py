"""
Create all database tables
Run this before init_rbac.py to create the schema
"""
import sys
sys.path.insert(0, '.')

from app.db.base import Base
from app.db.session import engine

# Import all models to register them with Base
from app.models import (
    User, Appeal, Department, DepOfficial,
    Direction, ExecutorList, Executor,
    AccountIndex, ApIndex, ApStatus, ContentType,
    ChiefInstruction, InSection, Section, UserSection,
    WhoControl, Movzu, Holiday,
    Region, Organ, Contact, Citizen, AuditLog,
    Permission, Role, RolePermission, UserRole, UserPermission,
    PermissionGroup, PermissionGroupItem
)


def create_tables():
    """Create all tables in the database"""
    print("\n" + "="*60)
    print("Creating Database Tables")
    print("="*60 + "\n")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ All tables created successfully!\n")
        print("Database schema is ready for RBAC initialization.")
        return True
    except Exception as e:
        print(f"\n❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = create_tables()
    sys.exit(0 if success else 1)
