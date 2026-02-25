import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=555-PTSAKTB-Z\\SQLEXPRESS;"
    "DATABASE=APPEALS;"
    "UID=sa;"
    "PWD=199696Mq;"
    "TrustServerCertificate=yes"
)

try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("Updating NULL is_deleted values to 0...")
    cursor.execute("UPDATE Appeals SET is_deleted = 0 WHERE is_deleted IS NULL")
    count = cursor.rowcount
    conn.commit()
    print(f"Updated {count} records.")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
