from app.db.session import SessionLocal
from app.models.user import User
from app.repositories.appeal import AppealRepository
from app.repositories.citizen import CitizenRepository
from app.repositories.org_unit import OrgUnitRepository
from app.services.appeal import AppealService
from app.services.citizen import CitizenService

def verify_filtering():
    db = SessionLocal()
    try:
        # Get users
        op1 = db.query(User).filter(User.username == "operator1").first()
        op2 = db.query(User).filter(User.username == "operator2").first()
        admin = db.query(User).filter(User.username == "admin2").first()
        
        if not op1 or not op2 or not admin:
            print("❌ Users not found! Run add_test_data.py first.")
            return

        print(f"User IDs: op1={op1.id}, op2={op2.id}, admin={admin.id}")

        # Setup services
        appeal_repo = AppealRepository(db)
        citizen_repo = CitizenRepository(db)
        org_unit_repo = OrgUnitRepository(db)
        
        appeal_service = AppealService(appeal_repo, citizen_repo, org_unit_repo)
        citizen_service = CitizenService(citizen_repo)
        
        # Verify Citizen Filtering
        print("\n--- Verifying Citizen Filtering ---")
        
        op1_citizens = citizen_service.list(current_user=op1, q=None, limit=100, offset=0)
        print(f"Operator 1 citizen count: {len(op1_citizens)}")
        for c in op1_citizens:
            if c.created_by_user_id != op1.id:
                print(f"❌ Alert! Operator 1 sees citizen {c.id} created by {c.created_by_user_id}")
            else:
                pass # print(f"✅ Citizen {c.id} owned by op1")
                
        op2_citizens = citizen_service.list(current_user=op2, q=None, limit=100, offset=0)
        print(f"Operator 2 citizen count: {len(op2_citizens)}")
        for c in op2_citizens:
            if c.created_by_user_id != op2.id:
                print(f"❌ Alert! Operator 2 sees citizen {c.id} created by {c.created_by_user_id}")

        admin_citizens = citizen_service.list(current_user=admin, q=None, limit=100, offset=0)
        print(f"Admin citizen count: {len(admin_citizens)}")
        
        # Verify Appeal Filtering
        print("\n--- Verifying Appeal Filtering ---")
        
        op1_appeals = appeal_service.list(current_user=op1, org_unit_id=None, citizen_id=None, reg_no=None, limit=100, offset=0)
        print(f"Operator 1 appeal count: {len(op1_appeals)}")
        for a in op1_appeals:
            if a.created_by_user_id != op1.id:
                print(f"❌ Alert! Operator 1 sees appeal {a.id} created by {a.created_by_user_id}")

        op2_appeals = appeal_service.list(current_user=op2, org_unit_id=None, citizen_id=None, reg_no=None, limit=100, offset=0)
        print(f"Operator 2 appeal count: {len(op2_appeals)}")
        for a in op2_appeals:
            if a.created_by_user_id != op2.id:
                print(f"❌ Alert! Operator 2 sees appeal {a.id} created by {a.created_by_user_id}")

        admin_appeals = appeal_service.list(current_user=admin, org_unit_id=None, citizen_id=None, reg_no=None, limit=100, offset=0)
        print(f"Admin appeal count: {len(admin_appeals)}")
        
        # Verify total counts
        if len(op1_citizens) + len(op2_citizens) <= len(admin_citizens):
             print("\n✅ Citizen filtering logic seems correct (Admin sees >= sum of users)")
        else:
             print("\n❌ Logic error in citizen filtering?")

        if len(op1_appeals) + len(op2_appeals) <= len(admin_appeals):
             print("✅ Appeal filtering logic seems correct (Admin sees >= sum of users)")
        else:
             print("❌ Logic error in appeal filtering?")

    finally:
        db.close()

if __name__ == "__main__":
    verify_filtering()
