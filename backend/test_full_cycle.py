from fastapi.testclient import TestClient
import sys
import os

from app.main import app
from app.models.user import User
from app.api.deps import get_current_user

client = TestClient(app)

async def override_get_current_user():
    # User must have a section_id to create appeals in this app
    return User(id=1, username="admin", tab1=True, section_id=1, surname="Admin", name="System")

app.dependency_overrides[get_current_user] = override_get_current_user

print("1. Creating test appeal...")
create_res = client.post("/api/v1/appeals", json={
    "person": "TEST_USER_999",
    "content": "TEST_CONTENT_999",
    "dep_id": 1,
    "status": 1
})

if create_res.status_code != 200:
    print(f"   ❌ Create failed ({create_res.status_code}): {create_res.text}")
    sys.exit(1)

appeal = create_res.json()
appeal_id = appeal['id']
print(f"   Created ID: {appeal_id}")

print(f"2. Deleting appeal {appeal_id}...")
del_res = client.delete(f"/api/v1/appeals/{appeal_id}")
print(f"   Delete Status: {del_res.status_code}")

print("3. Querying /api/v1/appeals?include_deleted=true...")
# We use a high limit to make sure it's on the first page
list_res = client.get("/api/v1/appeals", params={"include_deleted": True, "limit": 100})
data = list_res.json()
items = data.get('items', [])

found = next((i for i in items if i['id'] == appeal_id), None)
if found:
    print(f"   ✅ FOUND in list! ID: {found['id']}, IsDeleted: {found['is_deleted']}")
else:
    print(f"   ❌ NOT FOUND in list! Total returned: {len(items)}")
    print(f"   Total in DB: {data.get('total')}")
    # Inspect all items is_deleted flat
    deleted_count = sum(1 for i in items if i.get('is_deleted'))
    print(f"   Total deleted in response: {deleted_count}")

app.dependency_overrides = {}
