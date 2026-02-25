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
    
    cursor.execute("SELECT * FROM Appeals WHERE is_deleted = 1")
    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    
    print(f"Deleted appeals: {len(rows)}")
    for row in rows:
        data = dict(zip(columns, row))
        print(f"ID: {data['id']}, RegNum: {data.get('reg_num')}, IsDeleted: {data['is_deleted']}")
        print(f"  DepID: {data.get('dep_id')}, RegionID: {data.get('region_id')}, Status: {data.get('status')}, SecID: {data.get('user_section_id')}")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
