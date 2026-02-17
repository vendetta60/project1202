# Soft Delete and Audit Logging Features

Mühüm dəyişikliklər tətbiq edildi:

## 🔍 Xüsusiyyətlər (Features)

### 1. **Soft Delete (Zərif Silmə)**
- Verilənlər bazadan fiziki olaraq silinmir
- Səbətdəki fayllar kimi arxivləşdirilib (etikatlanır `is_deleted = true`)
- Adminlər lazım gəldikdə qayıtarda gətirə bilərlər
- Frontulda silinmiş məlumatlar görünmür

### 2. **Audit Logging (Audit Jurnalı)**
- **Bütün əməliyyatlar qeydə alınır:**
  - ✅ CREATE - Məlumat yaradılması
  - ✅ UPDATE - Məlumatın dəyişdirilməsi  
  - ✅ DELETE - Məlumatın silinməsi
  
- **Hər logda saxlanılır:**
  - Kim etdi (User ID & Username)
  - Nə gururda oldu (Entity Type & ID)
  - Nə vaxt etdi (Timestamp)
  - Nə dəyişdi (Old & New Values)
  - IP adresi
  - Browser məlumatı

### 3. **User Tracking (İstifadəçi İzləmə)**
Hər məlumat üçün saxlanılır:
- `created_by` - Kimdir yaratdı
- `created_by_name` - Hansı istifadəçi yaratdı
- `created_at` - Nə vaxt yaratdı
- `updated_by` - Kimdir dəyişdirdi
- `updated_by_name` - Hansı istifadəçi dəyişdirdi
- `updated_at` - Nə vaxt dəyişdirdi

## 📊 Database Şeması

### Yeni Sütunlar (Appeals, Users, Contacts)
```
is_deleted          BOOLEAN    - Silinmə bayrağı
created_at         DATETIME    - Yaradılma vaxtı
created_by           INT       - Yaratıcı User ID
created_by_name    VARCHAR(100) - Yaratıcı Username
updated_at         DATETIME    - Son dəyişiklik vaxtı
updated_by           INT       - Dəyişən User ID
updated_by_name    VARCHAR(100) - Dəyişənin Username
```

### Yeni Cədvəl: AuditLogs
Bütün əməliyyatların tam logları:
```
id                  INT        - Log ID (Auto-increment)
entity_type        VARCHAR(50) - Appeal, User, Contact
entity_id           INT        - Təsirlənən record ID
action             VARCHAR(20) - CREATE, UPDATE, DELETE
description        VARCHAR(500) - Qısa təsvir
old_values          TEXT       - JSON (eski qiymətlər)
new_values          TEXT       - JSON (yeni qiymətlər)
created_by           INT        - Əməliyyat edən user
created_by_name    VARCHAR(100) - Əməliyyat edənin adı
created_at         DATETIME    - Əməliyyat vaxtı
ip_address         VARCHAR(45) - İP adresi
user_agent         VARCHAR(500) - Brauzer info
```

## 🔌 API Endpoint-ləri

### Silinmə (DELETE)
```
DELETE /api/v1/appeals/{appeal_id}
```
- Soft delete etdiyini qiymətləndir
- AuditLog yaradır
- Record direkt bazadan silinmir

**Response:**
```json
{
  "message": "Müraciət silindi",
  "id": 123
}
```

### Audit Logs Görüntüləmə (Admin Yalnız)
```
GET /api/v1/audit-logs
```
**Filters:**
- `entity_type` - Appeal, User, Contact
- `entity_id` - Spesifik record ID
- `created_by` - User ID
- `action` - CREATE, UPDATE, DELETE
- `limit` - Sıra sayı (default: 50)
- `offset` - Başlanğıc pozisiyası

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "entity_type": "Appeal",
      "entity_id": 123,
      "action": "CREATE",
      "description": "Müraciət yaradıldı - REF-2025-001",
      "old_values": null,
      "new_values": {"reg_num": "REF-2025-001", "person": "John Doe"},
      "created_by": 5,
      "created_by_name": "admin",
      "created_at": "2025-02-16T10:30:00",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Tam Tarixin Görüntüləmə (Admin Yalnız)
```
GET /api/v1/audit-logs/{entity_type}/{entity_id}
```
**Nümunə:**
```
GET /api/v1/audit-logs/Appeal/123
```

**Response:**
```json
{
  "entity_type": "Appeal",
  "entity_id": 123,
  "history": [
    {
      "id": 5,
      "action": "UPDATE",
      "description": "Müraciət dəyişdirildi - REF-2025-001",
      "old_values": {"status": 1},
      "new_values": {"status": 2},
      "created_by": 5,
      "created_by_name": "admin",
      "created_at": "2025-02-16T12:45:00"
    },
    {
      "id": 3,
      "action": "CREATE",
      "description": "Müraciət yaradıldı - REF-2025-001",
      "new_values": {"reg_num": "REF-2025-001"},
      "created_by": 5,
      "created_by_name": "admin",
      "created_at": "2025-02-16T10:30:00"
    }
  ],
  "total": 2
}
```

## 🚀 Quraşdırma (Setup)

### 1. Database-ə Migrasiya Tətbiq Et
```bash
python migrate_soft_delete.py
```

Və ya əl ilə SQL ayırlan:
```sql
-- Bax: SOFT_DELETE_MIGRATION.md
```

### 2. Backend-i Yenidən Başlat
```bash
uvicorn app.main:app --reload
```

## 👥 İcazələr (Permissions)

### Admin İstifadəçilər
- ✅ Məlumat yarada bilər (CREATE)
- ✅ Məlumat dəyişə bilər (UPDATE)
- ✅ Məlumat silə bilər (DELETE - Soft)
- ✅ AuditLogs görə bilər
- ✅ Tam tarixçə görə bilər
- ✅ Silinmiş məlumatları qayıtara bilər (gələcəkdə)
- ❌ AuditLogs silinə bilməz (Immutable)

### Adi İstifadəçilər
- ✅ Məlumat yarada bilər
- ✅ Məlumat dəyişə bilər
- ✅ Məlumat silə bilər (Soft delete - data qorunur)
- ❌ AuditLogs görə bilməz
- ❌ Silinmiş məlumatları qayıtara bilməz

## 📝 Nümunə: Müraciətə Daxil Et

### 1. Müraciət Yarat
```bash
POST /api/v1/appeals
{
  "reg_num": "REF-2025-001",
  "person": "Ahmet İsmayıl",
  "content": "Forma doldurulması...",
  ...
}
```

**AuditLog otomatik yaranır:**
- action: CREATE
- created_by: 5 (Login edən user)
- created_by_name: "ahmet_user"
- new_values: Bütün məlumatlar

### 2. Müraciəti Dəyişdir
```bash
PATCH /api/v1/appeals/123
{
  "status": 2,
  "content": "Yeni məlumat..."
}
```

**AuditLog otomatik yaranır:**
- action: UPDATE
- updated_by: 5
- old_values: {"status": 1, "content": "Eski məlumat..."}
- new_values: {"status": 2, "content": "Yeni məlumat..."}

### 3. Müraciəti Sil
```bash
DELETE /api/v1/appeals/123
```

**AuditLog otomatik yaranır:**
- action: DELETE
- is_deleted: true (bazada)
- Frontda görünmür
- Məlumat silinmir, ancaq işarələnir

## 🔍 Admin: Logları İzlə

### Bütün Silmələri Gör
```bash
GET /api/v1/audit-logs?action=DELETE
```

### Spesifik Müraciət Tarixçəsi
```bash
GET /api/v1/audit-logs/Appeal/123
```

### Spesifik İstifadəçinin Bütün Əməliyyatları
```bash
GET /api/v1/audit-logs?created_by=5
```

## 🐛 Debugging

### Soft Delete Tipik Sorunları

**Sorun:** Silinmiş məlumat yenə də görünür
- **Həll:** Repository otomatik `is_deleted = false` filter etməlidir
- Kontrol et: `list()` metodunda filter var?

**Sorun:** AuditLog yaranmır
- **Həll:** AuditService əlavə edilmişdir
- Kontrol et: `get_audit_service` dependency injection işləyir?

**Sorun:** User info kayıq
- **Həll:** Service-ə `user_id` və `user_name` keçilmelidir
- Kontrol et: `created.service` çağırışında parametrlər var?

## 📚 Fayllar

### Yeni Fayllar
1. `backend/app/models/audit_log.py` - AuditLog model
2. `backend/app/repositories/audit_log.py` - Audit repository
3. `backend/app/services/audit.py` - Audit service
4. `backend/app/schemas/audit_log.py` - API schemas
5. `backend/app/api/v1/routers/audit.py` - Audit API endpoints
6. `backend/migrate_soft_delete.py` - Migration scripti
7. `backend/SOFT_DELETE_MIGRATION.md` - SQL migrasiya

### Dəyişdirilən Fayllar
1. `backend/app/models/appeal.py` - AuditMixin əlavə
2. `backend/app/models/user.py` - AuditMixin əlavə
3. `backend/app/models/contact.py` - AuditMixin əlavə
4. `backend/app/repositories/appeal.py` - Soft delete logic
5. `backend/app/services/appeal.py` - Audit logging
6. `backend/app/api/v1/routers/appeals.py` - Mövcud, delete hazır
7. `backend/app/api/deps.py` - Audit service dependency
8. `backend/app/schemas/appeal.py` - Audit fields əlavə

## ⚙️ Konfigürasiya

Dəyişdirmə lazım deyil! Bütün xüsusiyyətlər avtomatik işləyir.

Opsional: `app/core/config.py`-də audit məlumatlarının saxlanma müddəti kimi dəyərlər əlavə edə bilərsən.

## 🧪 Test

### Müraciət Silinməsini Test Et
```bash
# 1. Müraciət yarat
curl -X POST http://localhost:8000/api/v1/appeals \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reg_num": "TEST-001", "person": "John Doe"}'

# ID qeyd et (example: 123)

# 2. Logları kontrol et
curl http://localhost:8000/api/v1/audit-logs?action=CREATE \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Müraciəti sil
curl -X DELETE http://localhost:8000/api/v1/appeals/123 \
  -H "Authorization: Bearer TOKEN"

# 4. Silinmə logunu gör
curl http://localhost:8000/api/v1/audit-logs?action=DELETE \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 5. Tam tarixçəni gör
curl http://localhost:8000/api/v1/audit-logs/Appeal/123 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🚨 Mühüm Qeydlər

1. **Hard Delete Yoxdur** - `DELETE` endpoints indi soft delete edir
2. **Admin Logları Silə Bilməz** - Audit trails qorunmuş
3. **Performance** - `is_deleted` indekslı, sorğular sürətlidir
4. **GDPR Uyum** - Tam audit trail saxlanması

## Qəbul et!

Bu xüsusiyyətlər artıq formada işləyir. İstəsən, daha çox dəyişik əlavə edə biləm:

- ✅ Soft delete və audit logging
- ✅ Admin UI audit logs üçün  
- ✅ Restore funksionallığı
- ✅ Export audit logs CSV-ə (gələcəkdə)
