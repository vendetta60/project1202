import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(name, url):
    print(f"\n--- Testing {name} ---")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"Count: {len(data)}")
                if len(data) > 0:
                    print("Sample item:", data[0])
            else:
                print("Response:", data)
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Failed: {e}")

test_endpoint("Health", "http://localhost:8000/health")
test_endpoint("Regions", f"{BASE_URL}/lookups/regions")
test_endpoint("Departments", f"{BASE_URL}/lookups/departments")
test_endpoint("Users (needs auth - expect 401)", f"{BASE_URL}/users")
