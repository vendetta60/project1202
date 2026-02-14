import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_appeals():
    # Login
    print("Logging in...")
    login_data = {"username": "admin", "password": "adminpassword"} # I hope password is correct from previous turns or default
    # Wait, in the previous turn summary, it said "restoring default admin user".
    # Let me try 'admin' / 'admin' or 'admin' / '123456'
    
    # Try different common passwords if unknown
    passwords = ["admin", "123456", "adminpassword", "admin123"]
    token = None
    
    for pwd in passwords:
        resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": pwd})
        if resp.status_code == 200:
            token = resp.json().get("access_token")
            print(f"Login successful with password: {pwd}")
            break
            
    if not token:
        # Check if there is a 'me' endpoint or if I can bypass auth for debugging (not really)
        print("Login failed. Cannot test API.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # Fetch me
    me_resp = requests.get(f"{BASE_URL}/me", headers=headers)
    print("\nCurrent User:", me_resp.json())
    
    # Fetch appeals
    print("\nFetching appeals...")
    resp = requests.get(f"{BASE_URL}/appeals", headers=headers, params={"limit": 10})
    print("Status:", resp.status_code)
    if resp.status_code == 200:
        data = resp.json()
        print("Total reported by API:", data.get("total"))
        print("Items count:", len(data.get("items", [])))
        if data.get("items"):
            print("First item ID:", data["items"][0].get("id"))
    else:
        print("Error:", resp.text)

if __name__ == "__main__":
    test_appeals()
