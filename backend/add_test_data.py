"""
Script to add test data to the database
"""
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.role import Role
from app.models.org_unit import OrgUnit
from app.models.citizen import Citizen
from app.models.appeal import Appeal, AppealStatus
from app.models.executor import Executor
from app.core.security import hash_password
from datetime import datetime, timedelta
import random
import secrets


def add_test_data():
    # Recreate tables to ensure schema matches models
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Get existing roles
        roles = db.query(Role).all()
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        operator_role = db.query(Role).filter(Role.name == "Operator").first()
        viewer_role = db.query(Role).filter(Role.name == "Viewer").first()
        
        # Get or create org units
        org_units = db.query(OrgUnit).all()
        if not org_units:
            org_units = [
                OrgUnit(name="Bakı Şəhər İdarəsi"),
                OrgUnit(name="Sumqayıt Şəhər İdarəsi"),
                OrgUnit(name="Gəncə Şəhər İdarəsi"),
            ]
            for ou in org_units:
                db.add(ou)
            db.commit()
            for ou in org_units:
                db.refresh(ou)
        
        # Create test users
        users_data = [
            {
                "username": "operator1",
                "password": "operator123",
                "full_name": "Əli Məmmədov",
                "org_unit_id": org_units[0].id,
                "roles": [operator_role] if operator_role else [],
                "is_admin": False,
            },
            {
                "username": "operator2",
                "password": "operator123",
                "full_name": "Leyla Həsənova",
                "org_unit_id": org_units[1].id if len(org_units) > 1 else org_units[0].id,
                "roles": [operator_role] if operator_role else [],
                "is_admin": False,
            },
            {
                "username": "viewer1",
                "password": "viewer123",
                "full_name": "Rəşad Əliyev",
                "org_unit_id": org_units[0].id,
                "roles": [viewer_role] if viewer_role else [],
                "is_admin": False,
            },
            {
                "username": "admin2",
                "password": "admin123",
                "full_name": "Nigar Quliyeva",
                "org_unit_id": org_units[2].id if len(org_units) > 2 else org_units[0].id,
                "roles": [admin_role] if admin_role else [],
                "is_admin": True,
            },
            {
                "username": "admin",
                "password": "admin123",
                "full_name": "Sistem Administratoru",
                "org_unit_id": org_units[0].id,
                "roles": [admin_role] if admin_role else [],
                "is_admin": True,
            },
        ]
        
        created_users = {}
        for user_data in users_data:
            username = user_data["username"]
            existing = db.query(User).filter(User.username == username).first()
            if not existing:
                roles = user_data.pop("roles")
                user = User(
                    **{k: v for k, v in user_data.items() if k != "password"},
                    password_hash=hash_password(user_data["password"]),
                    is_active=True,
                )
                user.roles = roles
                db.add(user)
                db.commit()
                db.refresh(user)
                created_users[username] = user
                print(f"Created user: {user.username}")
            else:
                created_users[username] = existing
        
        # Create child departments (şöbələr) under each org unit if none exist yet
        child_exists = db.query(OrgUnit).filter(OrgUnit.parent_id.isnot(None)).first()
        if not child_exists:
            dept_names = ["Qəbul şöbəsi", "Müraciətlər şöbəsi"]
            for parent in org_units:
                for name in dept_names:
                    db.add(OrgUnit(name=f"{parent.name} - {name}", parent_id=parent.id))
            db.commit()

        # Refresh org units including children
        org_units = db.query(OrgUnit).all()

        # Create test citizens
        op1 = created_users.get("operator1")
        op2 = created_users.get("operator2")

        citizens_data = [
            {
                "fin": "1ABC234",
                "first_name": "Vüqar",
                "last_name": "Məmmədov",
                "father_name": "Əli",
                "phone": "+994501234567",
                "address": "Bakı şəhəri, Nəsimi rayonu",
            },
            {
                "fin": "2XYZ567",
                "first_name": "Gülnar",
                "last_name": "Həsənova",
                "father_name": "Rəşid",
                "phone": "+994552345678",
                "address": "Sumqayıt şəhəri, 5-ci mikrorayon",
            },
            {
                "fin": "3DEF890",
                "first_name": "Elçin",
                "last_name": "Quliyev",
                "father_name": "Mübariz",
                "phone": "+994703456789",
                "address": "Gəncə şəhəri, Nizami rayonu",
            },
            {
                "fin": "4GHI123",
                "first_name": "Səbinə",
                "last_name": "Əliyeva",
                "father_name": "Kamran",
                "phone": "+994514567890",
                "address": "Bakı şəhəri, Yasamal rayonu",
            },
            {
                "fin": "5JKL456",
                "first_name": "Rəşid",
                "last_name": "Məhərrəmov",
                "father_name": "Tofiq",
                "phone": "+994555678901",
                "address": "Bakı şəhəri, Səbail rayonu",
            },
        ]
        
        created_citizens = []
        for citizen_data in citizens_data:
            existing = db.query(Citizen).filter(Citizen.fin == citizen_data["fin"]).first()
            if not existing:
                citizen = Citizen(**citizen_data)
                db.add(citizen)
                db.commit()
                db.refresh(citizen)
                created_citizens.append(citizen)
        
        # Create executors for each child department
        child_units = db.query(OrgUnit).filter(OrgUnit.parent_id.isnot(None)).all()
        for unit in child_units:
            for name in ["Növbətçi", "Məsul şəxs"]:
                executor = Executor(full_name=f"{unit.name} - {name}", org_unit_id=unit.id)
                db.add(executor)
        db.commit()

        # Create test appeals
        if created_citizens:
            appeal_subjects = [
                "Su təchizatı problemi",
                "Yol təmiri tələbi",
                "Elektrik kəsilməsi",
                "Zibil daşınması problemi",
                "Park sahəsinin təmiri",
                "İşıqlandırma problemi",
                "Kanalizasiya problemi",
                "Binada təmir işləri",
            ]
            
            appeal_contents = [
                "Məhəlləmizdə artıq 3 gündür ki, su təchizatında problem var. Xahiş edirəm tezliklə həll olunsun.",
                "Küçəmizdəki yolun vəziyyəti çox pisdir. Təmir olunmasını xahiş edirəm.",
                "Evimizə elektrik enerjisi fasilələrlə verilir. Problemin aradan qaldırılmasını xahiş edirəm.",
                "Zibil daşınması qeyri-müntəzəm həyata keçirilir. Daha tez-tez zibil daşınmasını xahiş edirəm.",
                "Məhəlləmizdəki park sahəsinin təmirə ehtiyacı var.",
                "Küçə işıqlandırması işləmir. Təmir olunmasını xahiş edirəm.",
                "Kanalizasiya sistemi düzgün işləmir. Tezliklə baxılmasını xahiş edirəm.",
                "Binamızda təmir işləri aparılmalıdır.",
            ]
            
            for i in range(15):
                citizen = random.choice(created_citizens)
                # Randomly pick a creator (operator1 or operator2) if available
                possible_creators = [u for u in [op1, op2] if u is not None]
                creator = random.choice(possible_creators) if possible_creators else None
                creator_id = creator.id if creator else None

                # Assign org unit based on creator, or random org unit if no creator
                if creator is not None:
                    org_unit_id = creator.org_unit_id
                else:
                    org_unit_id = random.choice(org_units).id

                reg_no = f"A{datetime.utcnow():%Y%m%d%H%M%S}-{secrets.token_hex(3)}"
                
                appeal = Appeal(
                    reg_no=reg_no,
                    citizen_id=citizen.id,
                    org_unit_id=org_unit_id,
                    subject=random.choice(appeal_subjects),
                    description=random.choice(appeal_contents),
                    status=random.choice(list(AppealStatus)),
                    created_at=datetime.now() - timedelta(days=random.randint(1, 30)),
                    created_by_user_id=creator_id
                )
                db.add(appeal)
            
            db.commit()
            print("Created 15 test appeals")
        
        print("\nTest data added successfully!")
        
    except Exception as e:
        # Avoid Windows console encoding issues with Azerbaijani characters.
        msg = str(e).encode("ascii", "ignore").decode("ascii")
        print(f"Error adding test data: {msg}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_test_data()
