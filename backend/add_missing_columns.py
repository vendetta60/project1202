"""
Add missing columns to Roles table
"""
import sys
sys.path.insert(0, '.')

from app.db.session import engine
from sqlalchemy import text


def add_missing_columns():
    """Add missing columns to Roles table"""
    print("\n" + "="*60)
    print("Adding Missing Columns to Roles Table")
    print("="*60 + "\n")
    
    try:
        with engine.connect() as connection:
            # Check if columns exist and add them if they don't
            columns_to_add = [
                ("created_at", "ALTER TABLE [Roles] ADD created_at DATETIME DEFAULT GETUTCDATE()"),
                ("is_active", "ALTER TABLE [Roles] ADD is_active BIT DEFAULT 1"),
            ]
            
            for col_name, alter_statement in columns_to_add:
                try:
                    # Check if column exists
                    check_query = text(f"""
                        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = 'Roles' AND COLUMN_NAME = '{col_name}'
                    """)
                    result = connection.execute(check_query).scalar()
                    
                    if result == 0:
                        connection.execute(text(alter_statement))
                        print(f"  ✓ Added column: {col_name}")
                    else:
                        print(f"  - Column {col_name} already exists")
                except Exception as e:
                    print(f"  ! Could not add {col_name}: {e}")
            
            connection.commit()
        
        print("\n✓ Columns updated successfully!\n")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = add_missing_columns()
    sys.exit(0 if success else 1)
