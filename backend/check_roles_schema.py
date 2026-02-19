"""
Check and fix Roles table schema
"""
import sys
sys.path.insert(0, '.')

from app.db.session import engine
from sqlalchemy import text, inspect


def check_and_fix_roles_table():
    """Check existing Roles table and fix schema"""
    print("\n" + "="*60)
    print("Checking and Fixing Roles Table Schema")
    print("="*60 + "\n")
    
    try:
        with engine.connect() as connection:
            # Check existing columns
            inspector = inspect(engine)
            existing_columns = {col['name']: col for col in inspector.get_columns('Roles')}
            
            print("Existing columns in Roles table:")
            for col_name in existing_columns:
                col_info = existing_columns[col_name]
                print(f"  - {col_name}: {col_info['type']}")
            
            # If there's an unexpected 'permissions' column, handle it
            if 'permissions' in existing_columns:
                print("\n  ⚠️  Found legacy 'permissions' column, setting default value...")
                try:
                    connection.execute(text("UPDATE [Roles] SET permissions = '' WHERE permissions IS NULL"))
                    connection.commit()
                    print("  ✓ Updated legacy permissions column")
                except Exception as e:
                    print(f"  ! Note: {e}")
            
            print("\n✓ Schema check complete!\n")
            return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = check_and_fix_roles_table()
    sys.exit(0 if success else 1)
