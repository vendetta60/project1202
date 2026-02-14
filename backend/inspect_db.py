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

# List all tables with columns
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME")
tables = [r[0] for r in cursor.fetchall()]

for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM [{table}]")
    count = cursor.fetchone()[0]
    print(f"\n--- {table} ({count} rows) ---")
    
    cursor.execute(f"""
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '{table}'
        ORDER BY ORDINAL_POSITION
    """)
    for col in cursor.fetchall():
        col_name, data_type, max_len, nullable = col
        type_str = data_type
        if max_len and max_len > 0:
            type_str += f"({max_len})"
        elif max_len == -1:
            type_str += "(MAX)"
        null_str = "NULL" if nullable == "YES" else "NOT NULL"
        print(f"  {col_name}: {type_str} {null_str}")

    # Primary keys
    cursor.execute(f"""
        SELECT c.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE c ON tc.CONSTRAINT_NAME = c.CONSTRAINT_NAME
        WHERE tc.TABLE_NAME = '{table}' AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    """)
    pks = [r[0] for r in cursor.fetchall()]
    if pks:
        print(f"  PK: {', '.join(pks)}")

conn.close()
