## Frontend üçün API bələdçisi (rootlar nədir, nə edir?)

Bu backend-də əsas base URL:

- **Base**: `http://localhost:8000`
- **API prefix**: `/api/v1`

### Auth (token)

#### `POST /api/v1/auth/login`

Form-data (`application/x-www-form-urlencoded`):
- `username`
- `password`

Response:
- `{ "access_token": "...", "token_type": "bearer" }`

Frontend etməlidir:
- Token-u (məs: localStorage) saxla
- Sonrakı bütün protected çağırışlarda header əlavə et:
  - `Authorization: Bearer <token>`

#### `GET /api/v1/me`

Cari user məlumatı (token yoxlama üçün).

### Org struktur (baş idarə/idarə)

#### `GET /api/v1/org-units`
- Hamını qaytarır (public)

#### `POST /api/v1/org-units` (admin)
Body:
- `name`
- `parent_id` (opsional)

#### `PATCH /api/v1/org-units/{id}` (admin)
Body:
- `name` (opsional)
- `parent_id` (opsional)

Frontend gözləntiləri:
- Org tree UI üçün `parent_id`-yə görə ağac qurmaq
- Operator yaratmaq üçün `org_unit_id` seçdirmək

### Users (operator/admin)

#### `GET /api/v1/users` (admin)

#### `POST /api/v1/users` (admin)
Body:
- `username`
- `password`
- `full_name` (opsional)
- `org_unit_id` (opsional, amma operator üçün tövsiyə olunur)
- `is_admin` (default false)

Frontend gözləntiləri:
- Admin panel: user creation + org_unit assignment

### Citizens (vətəndaş)

Protected (token lazımdır).

#### `GET /api/v1/citizens?q=...`
- `q` adı/soyadı üzrə simple search
- `limit` (default 50, max 200)
- `offset` (default 0)

#### `GET /api/v1/citizens/{id}`
- seçilmiş vətəndaşın detalları

#### `POST /api/v1/citizens`
Body:
- `fin` (opsional, uniq)
- `first_name`
- `last_name`
- `father_name` (opsional)
- `phone` (opsional)
- `address` (opsional)

#### `PATCH /api/v1/citizens/{id}`
Body: yuxarıdakı sahələrin istənilən subset-i

Frontend gözləntiləri:
- “Vətəndaş axtar / seç / yarat” flow-u

### Appeals (müraciət)

Protected (token lazımdır).

#### Scope qaydası (çox vacib)
- Operator (admin deyilsə) yalnız **öz `org_unit_id`**-una aid müraciətləri görə/yarada/yeniləyə bilər.
- Admin bütün müraciətləri görə bilər.

#### `GET /api/v1/appeals`
Query (opsional):
- `org_unit_id` (admin üçün mənalıdır)
- `citizen_id`
- `reg_no`
- `limit` (default 50, max 200)
- `offset` (default 0)

#### `POST /api/v1/appeals`
Body:
- `subject`
- `description` (opsional)
- `citizen_id`
- `org_unit_id` (operator üçün yalnız öz org_unit-i keçərlidir)

Response:
- `reg_no` backend tərəfindən avtomatik verilir.

#### `PATCH /api/v1/appeals/{id}`
Body:
- `subject` (opsional)
- `description` (opsional)
- `status` (opsional: `registered|in_review|answered|closed`)
- `org_unit_id` (opsional, yalnız admin move edə bilər)

Frontend gözləntiləri:
- “Müraciət yarat” formu: citizen seçimi + subject/description
- “Müraciətlər siyahısı” + status update
- “Müraciət detayı” (patch ilə update)

### Error formatı (ümumi)
- 400: input/validation səhvi
- 401: token yox/yanlış
- 403: icazə yoxdur (məs. başqa org_unit)
- 404: tapılmadı
- 409: conflict (məs. username/FIN uniq)


