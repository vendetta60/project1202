from sqlalchemy import create_engine, text
from app.core.config import settings

def expand_contact_column():
    print(f"Connecting to: {settings.database_url}")
    engine = create_engine(settings.database_url)
    
    with engine.connect() as connection:
        # Check current column length
        print("Checking Contacts table schema...")
        result = connection.execute(text("""
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Contacts' AND COLUMN_NAME = 'contact'
        """))
        for row in result:
            print(f"Found column: {row.COLUMN_NAME}, type: {row.DATA_TYPE}, length: {row.CHARACTER_MAXIMUM_LENGTH}")

        print("Expanding 'contact' column to NVARCHAR(255)...")
        try:
            connection.execute(text("ALTER TABLE Contacts ALTER COLUMN contact NVARCHAR(255)"))
            connection.commit()
            print("Successfully expanded the column.")
        except Exception as e:
            print(f"Error expanding column: {e}")
            # If fail, maybe try VARCHAR
            try:
                print("Trying ALTER COLUMN contact VARCHAR(255)...")
                connection.execute(text("ALTER TABLE Contacts ALTER COLUMN contact VARCHAR(255)"))
                connection.commit()
                print("Successfully expanded the column with VARCHAR.")
            except Exception as e2:
                print(f"Failed again: {e2}")

if __name__ == "__main__":
    expand_contact_column()
