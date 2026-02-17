import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=555-PTSAKTB-Z\\SQLEXPRESS;"
    "DATABASE=APPEALS;"
    "UID=sa;"
    "PWD=199696Mq;"
    "TrustServerCertificate=yes"
)

def add_audit_columns(conn, table_name):
    """Add missing audit columns to a table"""
    cursor = conn.cursor()
    print(f"\nProcessing {table_name} table...")
    
    # Check what columns already exist
    cursor.execute(f"""
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '{table_name}'
    """)
    existing_cols = set(r[0] for r in cursor.fetchall())
    print(f"Existing columns: {len(existing_cols)}")
    
    # Add missing columns one by one
    missing_cols = [
        ('is_deleted', "BIT NOT NULL DEFAULT 0"),
        ('created_at', "DATETIME DEFAULT GETUTCDATE()"),
        ('created_by', "INT"),
        ('created_by_name', "VARCHAR(100)"),
        ('updated_at', "DATETIME"),
        ('updated_by', "INT"),
        ('updated_by_name', "VARCHAR(100)"),
    ]
    
    added_count = 0
    for col_name, col_def in missing_cols:
        if col_name not in existing_cols:
            sql = f"ALTER TABLE [{table_name}] ADD {col_name} {col_def}"
            print(f"  Adding {col_name}...", end=" ")
            try:
                cursor.execute(sql)
                conn.commit()
                print("✓")
                added_count += 1
            except Exception as e:
                print(f"✗ Error: {e}")
                conn.rollback()
        else:
            print(f"  {col_name} already exists")
    
    print(f"  Added {added_count} columns")
    cursor.close()
    return added_count

try:
    conn = pyodbc.connect(conn_str)
    
    total_added = 0
    for table in ['Appeals', 'Contacts']:
        total_added += add_audit_columns(conn, table)
    
    print(f"\n{'='*50}")
    print(f"Total columns added: {total_added}")
    print(f"{'='*50}")
    print("✓ Schema migration complete!")
    
    conn.close()
except Exception as e:
    print(f"✗ Migration failed: {e}")
