#!/usr/bin/env python
"""Check if admin user exists and has proper admin status"""

from app.db.session import SessionLocal
from app.models.user import User

def check_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            print("❌ Admin user does not exist!")
            return
        
        print("✅ Admin user found:")
        print(f"   Username: {admin.username}")
        print(f"   Full Name: {admin.full_name or 'N/A'}")
        print(f"   tab1 (is_admin): {admin.tab1}")
        print(f"   is_admin property: {admin.is_admin}")
        
        # Check roles
        if admin.user_roles:
            print(f"   Roles assigned: {len(admin.user_roles)}")
            for ur in admin.user_roles:
                print(f"     - {ur.role.name}")
        else:
            print("   ⚠️  No roles assigned!")
        
        # Check permissions
        if admin.user_permissions:
            print(f"   Direct permissions: {len(admin.user_permissions)}")
        
        if not admin.is_admin:
            print("\n⚠️  WARNING: Admin user tab1 is False! User will not have admin access.")
            print("   Updating tab1 to True...")
            admin.tab1 = True
            db.commit()
            print("   ✅ tab1 updated to True")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_admin()
