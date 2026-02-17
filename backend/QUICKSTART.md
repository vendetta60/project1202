# Quick Start: Deploy Soft Delete & Audit Logging

**Tez quraşdırma fərdi düşüncəsi**

## ⚡ 5 Minute Setup

### Step 1: Apply Database Migration (2 min)

```bash
cd backend
python migrate_soft_delete.py
```

**Və ya əl ilə SQL (MSSQL):**

```bash
# Bax: SOFT_DELETE_MIGRATION.md
# SQL-ləri direct DB-yə çalıştır
```

### Step 2: Restart Backend (1 min)

```bash
# Mövcud prosesi dayandır (Ctrl+C)
# Əvvəlcə venv-i aktivləşdir
cd backend
.\.venv\Scripts\activate

# Yenidən başlat
python -m uvicorn app.main:app --reload
```

### Step 3: Test (2 min)

```bash
# 1. Login et
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "PASSWORD"}'

# Token qeyd et (access_token)
export TOKEN="your_token_here"

# 2. Müraciət yarat
curl -X POST http://localhost:8000/api/v1/appeals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reg_num": "TEST-001",
    "person": "Ahmet Quliyev",
    "content": "Test müraciəti",
    "status": 1
  }'

# 3. ID-ni qeyd et (1 olacaq ehtimal)
export APPEAL_ID=1

# 4. Logları kontrol et
curl http://localhost:8000/api/v1/audit-logs \
  -H "Authorization: Bearer $TOKEN"

# 5. Müraciəti sil
curl -X DELETE http://localhost:8000/api/v1/appeals/$APPEAL_ID \
  -H "Authorization: Bearer $TOKEN"

# 6. Silinmə loqu kontrol et
curl http://localhost:8000/api/v1/audit-logs?action=DELETE \
  -H "Authorization: Bearer $TOKEN"

# 7. Tam tarixçə gör
curl http://localhost:8000/api/v1/audit-logs/Appeal/$APPEAL_ID \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ Verify Deployment

Aşağıdakılar işləməlidir:

- [x] Backend başlayır (güman olmayan hatası yoxdur)
- [x] Müraciət yaratma işləyir
- [x] Müraciət dəyişmə işləyir
- [x] Müraciət silmə işləyir
- [x] Silinmiş müraciət list-də görünmür
- [x] AuditLogs tablası var
- [x] Admin audit logları görə bilir

## 🔗 Useful Commands

```bash
# Database status (SQLite example)
sqlite3 backend/app.db "SELECT COUNT(*) as total FROM AuditLogs;"

# Check soft-deleted records
sqlite3 backend/app.db "SELECT id, reg_num, is_deleted FROM Appeals WHERE is_deleted = 1;"

# View audit logs
sqlite3 backend/app.db "SELECT id, action, entity_type, created_at FROM AuditLogs ORDER BY created_at DESC LIMIT 10;"
```

## 📚 Documentation

**Daha çox məlumat istəsən:**

1. [SOFT_DELETE_AUDIT_README.md](./SOFT_DELETE_AUDIT_README.md) - **Tam Ətraflı Sənəd**
2. [SOFT_DELETE_MIGRATION.md](./SOFT_DELETE_MIGRATION.md) - **SQL Migrasiya**
3. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - **Texniki Qeydlər**

## ❌ Troubleshooting

### Problem: `ModuleNotFoundError: No module named 'app.models.audit_log'`
**Solution:**
```bash
# Bax: app/models/__init__.py
# Emin ol ki audit_log import var:
from app.models.audit_log import AuditLog
```

### Problem: `Database error: no such table: AuditLogs`
**Solution:**
```bash
cd backend
python migrate_soft_delete.py
# Və ya manual SQL çalıştır
```

### Problem: `Audit logs not created`
**Solution:**
1. Check: `app/api/deps.py` - AuditService injected?
2. Check: `app/services/appeal.py` - audit service passed?
3. Restart backend

### Problem: `Cannot view audit logs (403 Forbidden)`
**Solution:**
- User must be admin
- Check: `current_user.is_admin` is true
- Only admin users can access `/api/v1/audit-logs`

## 🎯 Next Steps

**Gözən sonra etməli olduğun:**

1. ✅ Database migrasiyası
2. ✅ Backend restart
3. ✅ Testing
4. ✅ Frontend update (optional - already works!)
5. 📋 Document changes for team
6. 📊 Monitor audit logs for patterns

## 📊 Monitoring

**Admin panel yoxlaması:**

```bash
# How many deletions today?
curl http://localhost:8000/api/v1/audit-logs?action=DELETE \
  -H "Authorization: Bearer ADMIN_TOKEN" | jq '.total'

# Who modified what?
curl 'http://localhost:8000/api/v1/audit-logs?created_by=5' \
  -H "Authorization: Bearer ADMIN_TOKEN" | jq '.'

# Complete history of record 123
curl http://localhost:8000/api/v1/audit-logs/Appeal/123 \
  -H "Authorization: Bearer ADMIN_TOKEN" | jq '.'
```

## 🚀 Production Checklist

- [ ] Database backed up
- [ ] Migration script tested
- [ ] Test appeals created
- [ ] Test appeals deleted
- [ ] Soft delete verified
- [ ] Audit logs created
- [ ] Admin can view logs
- [ ] Regular users cannot view logs
- [ ] Performance acceptable
- [ ] No error logs
- [ ] Team notified

## 💡 Key Points

✨ **Yeni xüsusiyyətlər:**

1. Soft delete - Data həmişə qalır
2. Audit logs - Bütün dəyişikliklər qeydə alınır
3. User tracking - Kim nə etdi?
4. Admin dashboard - Tam kontrol

🔒 **Security:**
- Audit logs silinə bilməz
- Only admins can view
- Immutable history

⚡ **Performance:**
- is_deleted indexed
- Queries fast
- No breaking changes

## 📞 Questions?

Check documentation or contact your team!

---

**Status:** Ready to Deploy ✅  
**Last Updated:** 2025-02-16  
**Version:** 1.0
