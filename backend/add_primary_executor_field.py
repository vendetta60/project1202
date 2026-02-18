"""
Migration to add is_primary field to Executors table
This allows marking one executor as the primary executor for an appeal.
"""

from sqlalchemy import text
from app.db.session import engine


def migrate():
    """Add is_primary field to Executors table"""
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME='Executors' AND COLUMN_NAME='is_primary'
            """))
            
            if result.fetchone():
                print("✓ Column 'is_primary' already exists")
                return
            
            # Add column
            conn.execute(text("""
                ALTER TABLE Executors
                ADD is_primary BIT DEFAULT 0
            """))
            
            # Add index
            conn.execute(text("""
                CREATE INDEX idx_executors_primary 
                ON Executors(appeal_id, is_primary)
            """))
            
            conn.commit()
            print("✓ Successfully added 'is_primary' field to Executors table")
        
    except Exception as e:
        print(f"✗ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    migrate()

