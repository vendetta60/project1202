# Backend (FastAPI) — Müraciət Qeydiyyatı

Bu backend bir müəssisəyə gələn vətəndaş müraciətlərinin qeydiyyatı üçün ilkin skeleton-dur.

## İşə salmaq (local)

`backend/` qovluğunda:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# env konfigurasiya (opsional)
copy env.example env

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## Default DB

Default olaraq SQLite istifadə olunur: `sqlite:///./app.db`.
İlk start zamanı cədvəllər avtomatik yaradılır (sonradan Alembic-ə keçirmək olar).

## İlkin endpoint-lər

- `POST /api/v1/auth/login` (OAuth2 form: username/password)
- `GET /api/v1/me` (current user)
- `GET/POST/PATCH /api/v1/org-units` (create/update admin tələb edir)
- `GET/POST /api/v1/users` (admin tələb edir)
- `GET/POST/PATCH /api/v1/citizens`
- `GET/POST/PATCH /api/v1/appeals`

## Scope qaydası (müraciətlər)

- Operator (admin deyilsə) yalnız **öz `org_unit_id`**-una aid müraciətləri görə/yarada/yeniləyə bilər.
- Admin hamısını görə bilər.


