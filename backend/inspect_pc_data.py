import sqlite3

conn = sqlite3.connect('app.db')
cursor = conn.cursor()

print("Data samples from Appeals (PC, PC_Tarixi, r_num, r_date):")
cursor.execute("SELECT id, PC, PC_Tarixi FROM Appeals WHERE PC IS NOT NULL LIMIT 5;")
rows = cursor.fetchall()
for r in rows:
    print(r)

conn.close()
