# API Arayışı — Backend və Frontend

Bütün API-lar **prefix:** ` /api/v1` altındadır.  
**Autentifikasiya:** Token tələb edən endpoint-lər üçün header: `Authorization: Bearer <access_token>`.

---

## 1. Auth (Giriş / Token)

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **POST** | `/auth/login` | Giriş | Body: `{ "username": "string", "password": "string" }` | `{ "access_token", "refresh_token", "token_type": "bearer", "must_change_password": bool }` |
| **POST** | `/auth/refresh` | Token yenilə | Body: `{ "refresh_token": "string" }` | `{ "access_token", "refresh_token", "token_type", "must_change_password" }` |

**Login cavabı:** `must_change_password: true` olarsa istifadəçi ilk dəfə parol dəyişməlidir (frontend `/change-password`-a yönləndirir).

---

## 2. Me (Cari istifadəçi)

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/me` | Cari istifadəçi məlumatı | — | `UserOut`: id, surname, name, username, full_name, section_id, section_name, is_admin, is_super_admin, is_active, is_blocked, must_change_password, rank, **permissions** (string[]) |
| **POST** | `/me/change-password` | Öz parolunu dəyiş | Body: `{ "current_password": "string", "new_password": "string" }` | `{ "message": "Şifrə uğurla dəyişdirildi" }` |

**Auth:** Hər ikisi token tələb edir.

---

## 3. Users (İstifadəçilər)

**Auth:** Token + uyğun permission (view_users, create_user, delete_user, block_user, reset_user_password və s.).

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/users` | İstifadəçi siyahısı | Query: `q`, `limit` (default 50), `offset` (default 0) | `{ "items": UserOut[], "total", "limit", "offset" }` |
| **GET** | `/users/{user_id}` | Tək istifadəçi | — | `UserOut` |
| **POST** | `/users` | Yeni istifadəçi | Body: `UserCreate` (username, password, surname, name, section_id, role_ids, group_ids, is_admin, is_super_admin) | `UserOut` |
| **DELETE** | `/users/{user_id}` | İstifadəçini sil (hard delete) | — | 204 No Content |
| **POST** | `/users/{user_id}/toggle-block` | Blokla / blokdan çıxar | — | `UserOut` |
| **POST** | `/users/{user_id}/reset-password` | İstifadəçi parolunu sıfırla (admin) | Body: `{ "new_password": "string" }` | `UserOut` |
| **POST** | `/users/maintenance/start` | Texniki rejimi başlat | — | 204 (yalnız admin/superadmin) |
| **POST** | `/users/maintenance/stop` | Texniki rejimi dayandır | — | 204 (yalnız admin/superadmin) |
| **GET** | `/users/maintenance/status` | Texniki rejim statusu (auth lazım) | — | `{ "enabled", "message", "seconds_until_logout" }` |
| **GET** | `/users/maintenance/public-status` | Texniki rejim statusu (authsız) | — | Eyni strukturlu obyekt |

---

## 4. Permissions (Səlahiyyətlər / Rollar / Qruplar)

**Auth:** Admin (və ya uyğun permission).

### 4.1 Permissions (səlahiyyətlər)

| Method | Path | İzah | Cavab |
|--------|------|------|--------|
| **GET** | `/permissions/list` | Bütün səlahiyyətlər | `PermissionOut[]` (id, code, name, description, category, is_active) |
| **GET** | `/permissions/categories/{category}` | Kateqoriyaya görə | `PermissionOut[]` |
| **POST** | `/permissions/create` | Yeni səlahiyyət | Body: code, name, description?, category? → `PermissionOut` |

### 4.2 Roles (rollar)

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/permissions/roles/list` | Bütün rollar | — | `RoleOut[]` |
| **GET** | `/permissions/roles/{role_id}` | Tək rol | — | `RoleOut` |
| **POST** | `/permissions/roles/create` | Yeni rol | Body: name, description? | `RoleOut` |
| **PUT** | `/permissions/roles/{role_id}` | Rol redaktə | Body: name?, description?, is_active? | `RoleOut` |
| **DELETE** | `/permissions/roles/{role_id}` | Rol sil | — | `{ "status", "message" }` |
| **POST** | `/permissions/roles/{role_id}/permissions/set` | Rolun səlahiyyətlərini əvəz et | Body: `{ "permission_ids": [int] }` | `RoleOut` |
| **POST** | `/permissions/roles/{role_id}/permissions/{permission_id}` | Role səlahiyyət əlavə et | — | `RoleOut` |
| **DELETE** | `/permissions/roles/{role_id}/permissions/{permission_id}` | Roldan səlahiyyət çıxar | — | `RoleOut` |

### 4.3 Permission groups (qruplar)

| Method | Path | İzah | Cavab |
|--------|------|------|--------|
| **GET** | `/permissions/groups/list` | Qruplar (template_only=true) | `PermissionGroupOut[]` |
| **GET** | `/permissions/groups/{group_id}` | Tək qrup | `PermissionGroupOut` |
| **POST** | `/permissions/groups/create` | Yeni qrup | Body: name, description?, permission_ids? → `PermissionGroupOut` |
| **PUT** | `/permissions/groups/{group_id}` | Qrup redaktə | Body: name?, description?, permission_ids? | `PermissionGroupOut` |
| **DELETE** | `/permissions/groups/{group_id}` | Qrup sil | — | `{ "status", "message" }` |
| **POST** | `/permissions/groups/{group_id}/apply-to-user/{user_id}` | Qrupu istifadəçiyə tətbiq et | — | `{ "status", "message" }` |

### 4.4 İstifadəçi səlahiyyətləri

| Method | Path | İzah | Cavab |
|--------|------|------|--------|
| **GET** | `/permissions/users/{user_id}/permissions` | İstifadəçinin səlahiyyət/rol siyahısı | `{ "user_id", "permission_codes": string[], "role_ids": int[] }` |
| **POST** | `/permissions/users/{user_id}/roles/{role_id}` | İstifadəçiyə rol ver | — | `{ "status", "message" }` |
| **DELETE** | `/permissions/users/{user_id}/roles/{role_id}` | İstifadəçidən rol götür | — | `{ "status", "message" }` |
| **POST** | `/permissions/users/{user_id}/permissions/{permission_id}/grant` | İstifadəçiyə səlahiyyət ver | — | `{ "status", "message" }` |
| **POST** | `/permissions/users/{user_id}/permissions/{permission_id}/deny` | İstifadəçidən səlahiyyəti inkar et | — | `{ "status", "message" }` |
| **DELETE** | `/permissions/users/{user_id}/permissions/{permission_id}/override` | İstifadəçi üzərindəki override-ı ləğv et | — | `{ "status", "message" }` |

---

## 5. Appeals (Müraciətlər)

**Auth:** Token (və icazəyə görə filtrasiya).

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/appeals` | Müraciət siyahısı | Query: `dep_id`, `region_id`, `status`, `q`, `limit`, `offset`, `include_deleted` | `{ "items": AppealOut[], "total", "limit", "offset" }` |
| **GET** | `/appeals/{appeal_id}` | Tək müraciət | — | `AppealOut` (executors daxil) |
| **POST** | `/appeals` | Yeni müraciət | Body: `AppealCreate` (num, reg_num, reg_date, dep_id, official_id, region_id, person, email, content, content_type_id, status, user_section_id, …) | `AppealOut` |
| **PATCH** | `/appeals/{appeal_id}` | Müraciət redaktə | Body: `AppealUpdate` (eyni sahələr, hamısı optional) | `AppealOut` |
| **DELETE** | `/appeals/{appeal_id}` | Müraciəti soft-delete et | — | Silinmiş obyekt / success |
| **POST** | `/appeals/{appeal_id}/restore` | Soft-deleted müraciəti bərpa et | — | `AppealOut` |
| **GET** | `/appeals/check-duplicate` | Təkrarlanan müraciət yoxla | Query: `person`, `year`, `section_id` | `{ "duplicate": bool, … }` |

### 5.1 Müraciət icraçıları (executors)

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/appeals/{appeal_id}/executors` | Müraciətin icraçıları | — | `ExecutorOut[]` |
| **POST** | `/appeals/{appeal_id}/executors` | İcraçı əlavə et | Body: `ExecutorCreate` (executor_id, direction_id, is_primary, out_num, out_date, attach_num, …) | `ExecutorOut` |
| **PUT** | `/appeals/{appeal_id}/executors/{executor_id}` | İcraçı redaktə | Body: `ExecutorUpdate` (out_num, out_date, is_primary, …) | `ExecutorOut` |
| **DELETE** | `/appeals/{appeal_id}/executors/{executor_id}` | İcraçını sil | — | `{ "success": true }` |

**AppealOut** sahələri (qısa): id, num, reg_num, reg_date, dep_id, official_id, region_id, person, email, phone, content, content_type_id, status, user_section_id, is_deleted, created_at, created_by, created_by_name, updated_at, updated_by, updated_by_name, **executors**.

---

## 6. Lookups (Arayış cədvəlləri)

**Auth:** Token (əksər endpoint-lər). Bütün GET-lər eyni formatda: **siyahı** qaytarır (array).

### 6.1 Yalnız oxuma (GET)

| Path | Cavab |
|------|--------|
| `/lookups/account-indexes` | `AccountIndexOut[]` |
| `/lookups/ap-indexes` | `ApIndexOut[]` |
| `/lookups/ap-statuses` | `ApStatusOut[]` |
| `/lookups/content-types` | `ContentTypeOut[]` |
| `/lookups/chief-instructions` | `ChiefInstructionOut[]` |
| `/lookups/chief-instructions/by-section/{section_id}` | `ChiefInstructionOut[]` |
| `/lookups/in-sections` | `InSectionOut[]` |
| `/lookups/sections` | `SectionOut[]` |
| `/lookups/user-sections` | `UserSectionOut[]` |
| `/lookups/who-controls` | `WhoControlOut[]` |
| `/lookups/departments` | `DepartmentOut[]` |
| `/lookups/dep-officials` | `DepOfficialOut[]` |
| `/lookups/dep-officials/by-dep/{dep_id}` | `DepOfficialOut[]` |
| `/lookups/regions` | `RegionOut[]` |
| `/lookups/organs` | `OrganOut[]` |
| `/lookups/directions` | `DirectionOut[]` |
| `/lookups/directions/by-section/{section_id}` | `DirectionOut[]` |
| `/lookups/executor-list` | `ExecutorListOut[]` |
| `/lookups/executor-list/by-direction/{direction_id}` | `ExecutorListOut[]` |
| `/lookups/movzular` | `MovzuOut[]` |
| `/lookups/holidays` | `HolidayOut[]` |

### 6.2 Yaradılma / Redaktə / Silmə (lookup növləri üzrə)

- **Departments:** POST `/lookups/departments`, PUT `/lookups/departments/{dept_id}` — DELETE icazə verilmir.
- **Regions:** POST `/lookups/regions`, PUT `/lookups/regions/{region_id}` — DELETE icazə verilmir.
- **Dep-officials:** POST, PUT `/lookups/dep-officials/{official_id}`, DELETE.
- **Chief-instructions, In-sections, Who-controls:** POST, PUT; DELETE 403.
- **Ap-statuses:** POST, PUT; DELETE 403.
- **Executor-list:** POST, PUT `/lookups/executor-list/{executor_id}`, DELETE.
- **User-sections:** POST, PUT, DELETE (müraciət/istifadəçi yoxlanılır).
- **Holidays:** GET list, POST, PUT `/lookups/holidays/{holiday_id}`, DELETE.

Hər birində request body müvafiq schema (Create/Update) — adətən `id` istisna olmaqla əsas sahələr (ad, sign, section_id və s.).

---

## 7. Reports (Hesabatlar)

**Auth:** Token.

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/reports/appeals` | Müraciət statistikası | Query: `group_by` (department \| region \| status \| index \| insection), `start_date`, `end_date` | `{ "items": [ { "id", "name", "count" } ], "total", "group_by", "start_date", "end_date" }` |
| **GET** | `/reports/appeals/export/excel` | Eyni hesabat — Excel | Eyni query | Fayl: `.xlsx` (StreamingResponse) |
| **GET** | `/reports/appeals/export/pdf` | Eyni hesabat — PDF | Eyni query | Fayl: `.pdf` |
| **GET** | `/reports/appeals/export/word` | Eyni hesabat — Word | Eyni query | Fayl: `.docx` |
| **GET** | `/reports/forma-4/excel` | Forma-4 Excel | Query: `start_date`, `end_date` | Fayl: `.xlsx` |
| **GET** | `/reports/forma-4/word` | Forma-4 Word | Eyni query | Fayl: `.docx` |
| **GET** | `/reports/forma-4/pdf` | Forma-4 PDF | Eyni query | Fayl: `.pdf` |

---

## 8. Audit logs

**Auth:** Admin.

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/audit-logs` | Audit siyahısı | Query: `entity_type`, `entity_id`, `created_by`, `action`, `limit`, `offset` | `{ "items": AuditLogOut[], "total", "limit", "offset" }` |
| **GET** | `/audit-logs/{entity_type}/{entity_id}` | Konkret qeydin tarixçəsi | — | `{ "entity_type", "entity_id", "history": AuditLogOut[], "total" }` |

**AuditLogOut:** id, entity_type, entity_id, action, description, old_values, new_values, created_by, created_by_name, created_at, ip_address, user_agent.

---

## 9. Citizens (Vətəndaşlar)

**Auth:** Token.

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **GET** | `/citizens/` | Siyahı | Query: `q` (first_name, last_name, fin axtarışı), `limit`, `offset` | `{ "items": CitizenSchema[], "total" }` |
| **GET** | `/citizens/{id}` | Tək vətəndaş | — | `CitizenSchema` |
| **POST** | `/citizens/` | Yeni vətəndaş | Body: first_name, last_name, fin (7 simvol), phone?, address? | `CitizenSchema` |
| **PATCH** | `/citizens/{id}` | Redaktə | Body: first_name?, last_name?, fin?, phone?, address? | `CitizenSchema` |
| **DELETE** | `/citizens/{id}` | Soft-delete | — | `{ "status": "success" }` |

**CitizenSchema:** id, first_name, last_name, fin, phone, address, created_at, updated_at, is_deleted.

---

## 10. Feedback (Təklif və iradlar)

**Auth:** Token.

| Method | Path | İzah | Request | Cavab |
|--------|------|------|--------|--------|
| **POST** | `/feedback` | Təklif/irad göndər | Body: `{ "message": "string" (3–1000), "category": "string" (optional) }` | 201, `{ "status": "success" }` |

Backend mesajı audit log kimi (entity_type=Feedback) qeyd edir.

---

## 11. Ümumi qeydlər

- **Base URL:** `http://<host>:8000/api/v1` (backend 8000-də işləyir).
- **Content-Type:** JSON üçün `application/json`.
- **Xətalar:** 400 (validasiya), 401 (auth), 403 (icazə), 404 (tapılmadı), 409 (konflikt), 422 (body validasiya). Cavabda `detail` (string və ya array) olur.
- **Frontend:** Bütün çağırışlar `apiClient` (axios) ilə bu base URL-ə gedir; token interceptor tərəfindən əlavə olunur.

Bu sənəd backend route-ları və schema-lar əsasında yazılıb; frontend eyni endpoint-ləri və strukturları istifadə edir.
