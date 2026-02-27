import sqlite3

conn = sqlite3.connect('app.db')
cursor = conn.cursor()

print("Columns in Appeals table:")
cursor.execute("PRAGMA table_info(Appeals);")
columns = cursor.fetchall()
for col in columns:
    print(col)

conn.close()
