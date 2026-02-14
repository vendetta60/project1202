import traceback
from app.db.session import SessionLocal
from app.api.deps import get_appeal_service
from app.repositories.user import UserRepository
from app.services.appeal import AppealService
from app.repositories.appeal import AppealRepository

def debug_service():
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        admin_user = user_repo.get_by_username("admin")
        if not admin_user:
            print("Admin user not found")
            return
            
        appeal_repo = AppealRepository(db)
        service = AppealService(appeal_repo)
        
        print(f"Calling service.list for user: {admin_user.username}")
        items = service.list(current_user=admin_user, limit=10)
        print(f"Service returned {len(items)} items")
        
        for item in items:
            print(f"Item ID: {item.id}, Person: {item.person}")
            
    except Exception as e:
        print("Error in service layer:")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_service()
