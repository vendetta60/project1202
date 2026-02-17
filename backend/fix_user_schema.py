import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=555-PTSAKTB-Z\\SQLEXPRESS;"
    "DATABASE=APPEALS;"
    "UID=sa;"
    "PWD=199696Mq;"
    "TrustServerCertificate=yes"
)

conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

print("Adding missing audit columns to Users table...")

# Check what columns already exist
cursor.execute("""
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users'
""")
existing_cols = set(r[0] for r in cursor.fetchall())
print(f"Existing columns: {sorted(existing_cols)}")

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

for col_name, col_def in missing_cols:
    if col_name not in existing_cols:
        sql = f"ALTER TABLE Users ADD {col_name} {col_def}"
        print(f"  Adding {col_name}...")
        try:
            cursor.execute(sql)
            conn.commit()
            print(f"    ✓ {col_name} added")
        except Exception as e:
            print(f"    ✗ Error: {e}")
            conn.rollback()
    else:
        print(f"  {col_name} already exists")

print("\nVerifying schema...")
cursor.execute("""
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users'
    ORDER BY ORDINAL_POSITION
""")
final_cols = [r[0] for r in cursor.fetchall()]
print(f"Final columns ({len(final_cols)} total): {', '.join(final_cols)}")

conn.close()
print("\n✓ Schema migration complete!")
