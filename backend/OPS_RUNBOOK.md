## Backend runbook (nə etməliyəm?)

### 1) Python mühiti

`project1202/backend` qovluğunda:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2) Konfiqurasiya (env)

Bu layihədə `.env` yazmaq bloklana bilər. Ona görə `backend/env` faylı istifadə olunur.

```bash
copy env.example env
```

`backend/env` içində vacib dəyişənlər:

- `DATABASE_URL`: default `sqlite:///./app.db`
- `JWT_SECRET`: token imzası (prod-da mütləq dəyiş)
- `CORS_ALLOW_ORIGINS`: default `*` (prod-da domenləri yaz: `https://app1,https://app2`)

### 3) İlk admin-in avtomatik yaranması (first run)

DB boşdursa, startup-da aşağıdakı env-lər ilə admin user yaradılır:

- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_FULL_NAME` (opsional)

Qeyd: DB-də ən az 1 user varsa, bootstrap işləmir.

### 4) Serveri işə salmaq

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Yoxlama:
- `GET http://localhost:8000/health`
- Swagger: `http://localhost:8000/docs`

### 5) İlkin istifadə ardıcıllığı (tövsiyə)

- Admin ilə login et (`/api/v1/auth/login`)
- `org_units` strukturunu yarat (baş idarələr/idarələr)
- Operator user-ları yarat və `org_unit_id` ver
- Vətəndaş yarat (`citizens`)
- Müraciət yarat (`appeals`)


