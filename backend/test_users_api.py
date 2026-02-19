#!/usr/bin/env python
"""Test the /users API endpoint directly"""

import requests
import json
from app.db.session import SessionLocal
from app.core.security import hash_password
import jwt
from app.core.config import settings
from datetime import datetime, timedelta

def test_users_api():
    # First, get admin user and create a token
    db = SessionLocal()
    try:
        from app.models.user import User
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            print("❌ Admin user not found")
            return
        
        print(f"✅ Admin user found: {admin.username}")
        print(f"   is_admin: {admin.is_admin}")
        
        # Create JWT token with proper expiration
        token_payload = {
            "sub": admin.username,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        token = jwt.encode(token_payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        
        print(f"✅ JWT token created")
        
        # Test the API
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print("\n📝 Testing GET /users endpoint...")
        response = requests.get("http://localhost:8000/api/v1/users", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"Response:")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            print(f"\n✅ API working correctly!")
        else:
            print(f"\n❌ API returned {response.status_code}")
            print(f"Details: {response.text}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_users_api()
