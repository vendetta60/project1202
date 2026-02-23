#!/usr/bin/env python3
"""
Quick API test script for RBAC endpoints
Run after starting backend server:
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

# Admin credentials
ADMIN_TOKEN = None

def log(msg: str, color: str = ""):
    """Print colored log messages"""
    colors = {
        "green": "\033[92m",
        "red": "\033[91m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "reset": "\033[0m"
    }
    prefix = colors.get(color, "")
    suffix = colors["reset"]
    print(f"{prefix}[TEST]{suffix} {msg}")

def login():
    """Authenticate and get token"""
    global ADMIN_TOKEN
    log("Logging in as admin...", "blue")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    
    if response.status_code == 200:
        data = response.json()
        ADMIN_TOKEN = data["access_token"]
        log(f"✓ Login successful, token: {ADMIN_TOKEN[:20]}...", "green")
        return True
    else:
        log(f"✗ Login failed: {response.status_code}", "red")
        print(f"  Response: {response.text}")
        return False

def get_headers():
    """Get headers with auth token"""
    return {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }

def test_get_permissions():
    """Test listing permissions"""
    log("Testing: GET /permissions/list", "blue")
    
    response = requests.get(
        f"{BASE_URL}/permissions/list",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        data = response.json()
        log(f"✓ Got {len(data)} permissions", "green")
        return True
    else:
        log(f"✗ Failed: {response.status_code}", "red")
        print(f"  Response: {response.text}")
        return False

def test_get_roles():
    """Test listing roles"""
    log("Testing: GET /permissions/roles/list", "blue")
    
    response = requests.get(
        f"{BASE_URL}/permissions/roles/list",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        data = response.json()
        log(f"✓ Got {len(data)} roles", "green")
        return True
    else:
        log(f"✗ Failed: {response.status_code}", "red")
        print(f"  Response: {response.text}")
        return False

def test_get_role_permissions():
    """Test getting role with permissions"""
    log("Testing: GET /permissions/roles/1 (first role)", "blue")
    
    response = requests.get(
        f"{BASE_URL}/permissions/roles/1",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        data = response.json()
        log(f"✓ Got role: {data.get('name')}", "green")
        return data
    else:
        log(f"✗ Failed: {response.status_code}", "red")
        print(f"  Response: {response.text}")
        return None

def test_set_role_permissions(role_id: int, permission_ids: list):
    """Test setting role permissions - THE FIX"""
    log(f"Testing: POST /permissions/roles/{role_id}/permissions/set", "blue")
    log(f"  Body: {json.dumps(permission_ids)} (raw array)", "yellow")
    
    response = requests.post(
        f"{BASE_URL}/permissions/roles/{role_id}/permissions/set",
        headers=get_headers(),
        json=permission_ids  # Send raw array
    )
    
    if response.status_code == 200:
        data = response.json()
        log(f"✓ Role permissions set successfully", "green")
        log(f"  Response: {json.dumps(data, indent=2)}", "green")
        return True
    else:
        log(f"✗ Failed: {response.status_code}", "red")
        print(f"  Response: {response.text}")
        if response.status_code == 422:
            log("  This is the 422 error! Check request body format", "red")
        return False

def test_create_permission(code: str, name: str):
    """Test creating permission"""
    log(f"Testing: POST /permissions/create", "blue")
    log(f"  Params: code={code}, name={name}", "yellow")
    
    params = {
        "code": code,
        "name": name,
        "description": "Test permission",
        "category": "test"
    }
    
    response = requests.post(
        f"{BASE_URL}/permissions/create",
        headers=get_headers(),
        params=params
    )
    
    if response.status_code == 200:
        data = response.json()
        log(f"✓ Permission created: {data.get('name')}", "green")
        return data["id"]
    else:
        log(f"✗ Failed: {response.status_code}", "red")
        print(f"  Response: {response.text}")
        return None

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("RBAC API TEST SUITE")
    print("="*60 + "\n")
    
    # Test 1: Login
    if not login():
        sys.exit(1)
    
    print("\n" + "-"*60)
    
    # Test 2: Get permissions
    if not test_get_permissions():
        sys.exit(1)
    
    print()
    
    # Test 3: Get roles
    if not test_get_roles():
        sys.exit(1)
    
    print()
    
    # Test 4: Get role with permissions
    role_data = test_get_role_permissions()
    if not role_data:
        sys.exit(1)
    
    print()
    
    # Test 5: THE CRITICAL FIX - Set role permissions
    log("="*60, "yellow")
    log("CRITICAL TEST: Setting role permissions (the 422 bug fix)", "yellow")
    log("="*60, "yellow")
    
    # Use first 5 permission IDs
    permission_ids = [1, 2, 3, 4, 5]
    if not test_set_role_permissions(1, permission_ids):
        print("\n" + "="*60)
        log("✗ CRITICAL TEST FAILED", "red")
        log("The role permission API is still broken!", "red")
        print("="*60 + "\n")
        sys.exit(1)
    
    print("\n" + "="*60)
    log("✓ ALL TESTS PASSED!", "green")
    log("Role permission API fix is working correctly!", "green")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"✗ Test error: {str(e)}", "red")
        import traceback
        traceback.print_exc()
        sys.exit(1)
