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
    
    cursor.execute("SELECT count(*) FROM Appeals WHERE is_deleted = 1")
    count = cursor.fetchone()[0]
    print(f"Deleted appeals count: {count}")
    
    cursor.execute("SELECT TOP 5 id, reg_num, is_deleted FROM Appeals WHERE is_deleted = 1")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, RegNum: {row[1]}, IsDeleted: {row[2]}")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
