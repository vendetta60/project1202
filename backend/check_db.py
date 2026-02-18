import pyodbc
from app.core.config import settings

def check_schema():
    print(f"Connecting to: {settings.database_url}")
    # Extract connection string from sqlalchemy url
    # Assuming mssql+pyodbc://...
    conn_str = settings.database_url.replace("mssql+pyodbc://", "")
    # Note: this simple replacement might not work for all formats, 
    # but let's try direct pyodbc if we can or just use sqlalchemy.
    
    from sqlalchemy import create_engine, inspect
    engine = create_engine(settings.database_url)
    inspector = inspect(engine)
    columns = inspector.get_columns('Executors')
    with open('schema_output.txt', 'w', encoding='utf-8') as f:
        f.write("ALL COLUMNS in 'Executors' table:\n")
        for col in columns:
            f.write(f"| {col['name']} | {col['type']} | {col['nullable']} |\n")
    print("Output written to schema_output.txt")

if __name__ == "__main__":
    try:
        check_schema()
    except Exception as e:
        print(f"Error: {e}")
