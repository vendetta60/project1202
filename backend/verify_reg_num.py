import sys
import os
from datetime import datetime

# Add the project root to sys.path
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.user import User
from app.models.appeal import Appeal
from app.models.department import Department
from app.models.lookup import UserSection, ApIndex
from app.schemas.appeal import AppealCreate
from app.services.appeal import AppealService
from app.repositories.appeal import AppealRepository

# Setup test database
DATABASE_URL = "sqlite:///./test_reg_num.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Create UserSections
    sec1 = UserSection(user_section="Section A", section_index=5)
    db.add(sec1)
    db.flush()
    
    # 2. Create Departments
    dep_e = Department(department="Dept E", sign="e")
    dep_abc = Department(department="Dept ABC", sign="ABC")
    db.add_all([dep_e, dep_abc])
    db.flush()
    
    # 3. Create User
    user = User(username="testuser", section_id=sec1.id, tab1=True) # tab1=admin
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(dep_e)
    db.refresh(dep_abc)
    return db, user, dep_e, dep_abc

def test_reg_num():
    db, user, dep_e, dep_abc = setup_db()
    repo = AppealRepository(db)
    service = AppealService(repo)
    
    print("\n--- Test Scenario 1: New Person, Dept sign 'e' ---")
    p1 = "Məmmədov Rauf"
    payload1 = AppealCreate(
        person=p1,
        dep_id=dep_e.id,
        ap_index_id=10,
        content="Test content 1",
        reg_date=datetime(2026, 3, 1)
    )
    a1 = service.create(user, payload1)
    print(f"Result: reg_num={a1.reg_num}, num={a1.num}")
    # Expected: 3-25-e/1-M-1-10/2026
    assert "3-25-e/1-M-1-10/2026" in a1.reg_num
    
    print("\n--- Test Scenario 2: Repeat Person, Same Year ---")
    payload2 = AppealCreate(
        person=p1,
        dep_id=dep_e.id,
        ap_index_id=10,
        content="Test content 2",
        reg_date=datetime(2026, 3, 2)
    )
    a2 = service.create(user, payload2)
    print(f"Result: reg_num={a2.reg_num}, num={a2.num}")
    # Expected: 3-25-e/1-M-1/2-10/2026
    assert "3-25-e/1-M-1/2-10/2026" in a2.reg_num
    assert a2.num == a1.num # Should stay same num based on SQL logic (max_num)
    
    print("\n--- Test Scenario 3: New Person, Dept sign 'ABC' ---")
    p2 = "Əliyev Vüqar"
    payload3 = AppealCreate(
        person=p2,
        dep_id=dep_abc.id,
        ap_index_id=5,
        content="Test content 3",
        reg_date=datetime(2026, 3, 3)
    )
    a3 = service.create(user, payload3)
    print(f"Result: reg_num={a3.reg_num}, num={a3.num}")
    # Expected: 3-25-5/1-ABC/Ə-2-5/2026 (index 5 from sec1)
    assert "3-25-5/1-ABC/Ə-2-5/2026" in a3.reg_num
    assert a3.num == 2
    
    print("\n--- All tests passed! ---")
    db.close()
    engine.dispose()
    try:
        if os.path.exists("./test_reg_num.db"):
            os.remove("./test_reg_num.db")
    except:
        pass

if __name__ == "__main__":
    try:
        test_reg_num()
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
