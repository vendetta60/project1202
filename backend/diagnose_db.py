from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add the current directory to sys.path so we can import app
sys.path.append(os.path.abspath(os.getcwd()))

from app.models.appeal import Appeal

engine = create_engine("sqlite:///app.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("Checking Appeals table...")
try:
    appeals = db.query(Appeal).all()
    print(f"Total appeals: {len(appeals)}")

    if appeals:
        print("\nFirst 10 appeals data:")
        print("ID | RegNum | RegDate | UserSectionID | InSection")
        for a in appeals[:10]:
            print(f"{a.id} | {a.reg_num} | {a.reg_date} | {a.user_section_id} | {a.InSection}")
        
        # Check current date range
        min_date = db.query(Appeal.reg_date).order_by(Appeal.reg_date).first()
        max_date = db.query(Appeal.reg_date).order_by(Appeal.reg_date.desc()).first()
        print(f"\nDate range in DB: {min_date[0] if min_date else 'N/A'} to {max_date[0] if max_date else 'N/A'}")
        
    else:
        print("No appeals found in DB!")
except Exception as e:
    print(f"Error: {e}")

db.close()
