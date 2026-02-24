from fastapi.testclient import TestClient
import sys
import os

from app.main import app
from app.models.user import User
from app.api.deps import get_current_user

client = TestClient(app)

async def override_get_current_user():
    # tab1 = True makes the user an admin
    return User(id=1, username="admin", tab1=True, section_id=None)

app.dependency_overrides[get_current_user] = override_get_current_user

print("Querying /api/v1/appeals?include_deleted=true...")
response = client.get("/api/v1/appeals", params={"include_deleted": True})

if response.status_code != 200:
    print(f"Error: {response.status_code}")
    print(response.text)
    sys.exit(1)

data = response.json()
print(f"Total: {data.get('total')}")
items = data.get('items', [])
print(f"Items returned: {len(items)}")

deleted_items = [i for i in items if i.get('is_deleted')]
print(f"Deleted items in response: {len(deleted_items)}")

for i in deleted_items:
    print(f"ID: {i.get('id')}, IsDeleted: {i.get('is_deleted')}, RegNum: {i.get('reg_num')}")

app.dependency_overrides = {}
