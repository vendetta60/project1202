# Frontend Development Prompt (Qısa Versiya)

## Məqsəd
**Müraciət Qeydiyyat Sistemi** üçün gözəl dizayn edilmiş, modern React frontend hazırla. İlkin versiya - sadə, amma professional görünüşlü.

## Texnologiya
- **React 18+ + TypeScript**
- **React Router v6** (routing)
- **React Query** (API calls, caching)
- **React Hook Form** (formlar)
- **Material-UI (MUI) v5** və ya **Ant Design** (UI kit)
- **Axios** (HTTP client)

## Backend API
**Base URL**: `http://localhost:8000/api/v1`

### Əsas Endpoint-lər
- `POST /auth/login` → `{username, password}` → `{access_token}`
- `GET /me` → cari user məlumatı
- `GET /org-units` → idarələr siyahısı
- `GET /citizens?q=search` → vətəndaşlar (search + pagination)
- `POST /citizens` → vətəndaş yarat
- `GET /appeals?limit=50&offset=0` → müraciətlər (pagination)
- `POST /appeals` → müraciət yarat
- `PATCH /appeals/{id}` → müraciət yenilə

**Auth**: Bütün request-lərdə header: `Authorization: Bearer <token>` (token localStorage-dan)

**Qayda**: Operator (admin deyilsə) yalnız öz idarəsinin müraciətlərini görür.

## Tələb Olunan Səhifələr

### 1. Login (`/login`)
- Gözəl, mərkəzləşdirilmiş form
- Username + Password input-ları
- "Daxil ol" button
- Error mesajı göstərmək
- Uğurlu login → `/dashboard`-a yönləndir

### 2. Dashboard (`/dashboard`)
- **Statistika kartları** (4 ədəd):
  - Ümumi müraciətlər
  - Vətəndaşlar
  - İdarələr (admin üçün)
  - İstifadəçilər (admin üçün)
- **Son müraciətlər cədvəli** (10 ədəd)
- **Sürətli əməliyyatlar**: "Yeni müraciət", "Yeni vətəndaş"

### 3. Müraciətlər (`/appeals`)
- **Cədvəl**: Reg No, Mövzu, Vətəndaş, İdarə, Tarix
- **Filter**: İdarə seçimi (admin üçün), Axtarış
- **Pagination**
- **"Yeni müraciət"** button
- Sətirə klik → edit səhifəsinə

### 4. Müraciət Yarat/Yenilə (`/appeals/new`, `/appeals/:id`)
- **Form**:
  - Mövzu (required)
  - Təsvir (textarea, required)
  - Vətəndaş (searchable dropdown - `/citizens` API-dən)
  - İdarə (dropdown - `/org-units` API-dən, operator üçün avtomatik)
- Save/Cancel button-ları

### 5. Vətəndaşlar (`/citizens`)
- **Cədvəl**: Ad, Soyad, FIN, Telefon, Email
- **Axtarış barı** (ad/soyad üzrə)
- **"Yeni vətəndaş"** button
- Pagination

### 6. Vətəndaş Yarat/Yenilə (`/citizens/new`, `/citizens/:id`)
- **Form**: Ad, Soyad, FIN, Telefon, Email, Ünvan
- Save/Cancel

## Dizayn Tələbləri

### Görünüş
- **Modern, təmiz, professional** (hökumət təşkilatı üçün)
- **Responsive** (desktop əsas, tablet dəstəkləsin)
- **Gözəl rəng palitrası** (mavi/boz, MUI/Ant Design default theme)
- **Azerbaijani dil** (bütün label və mesajlar)

### Layout
```
┌──────────────────────────────┐
│ Header: Logo | User | Logout │
├──────────────────────────────┤
│                              │
│   Main Content (centered)    │
│                              │
└──────────────────────────────┘
```

### UI Element-ləri
- **Card-lar** statistika üçün (gözəl shadow, hover effect)
- **Table** müraciətlər/vətəndaşlar üçün (striped rows, hover)
- **Form input-ları** (clean, validation error göstərmə)
- **Button-lar** (primary/secondary, hover states)
- **Loading skeleton** (data yüklənərkən)
- **Toast notification** (success/error mesajları)

## Texniki Detallar

### API Client
- Axios instance yarat
- Interceptor: token əlavə et, 401 → login-ə yönləndir
- Error handling: user-friendly mesajlar (azərbaycanca)

### State Management
- React Query: server state (API calls)
- localStorage: token storage
- React Hook Form: form state

### Error Messages (azərbaycanca)
- 401: "Giriş tələb olunur" → login-ə yönləndir
- 403: "Bu əməliyyat üçün icazəniz yoxdur"
- 404: "Məlumat tapılmadı"
- 409: "Bu məlumat artıq mövcuddur"
- Network: "İnternet bağlantısını yoxlayın"

## File Structure
```
frontend/
├── src/
│   ├── api/          # API client, endpoints
│   ├── components/   # Reusable UI components
│   ├── pages/        # Səhifələr (Login, Dashboard, Appeals, etc.)
│   ├── hooks/        # Custom hooks (useAuth, etc.)
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## Deliverables
1. ✅ Tam işləyən React + TypeScript app
2. ✅ Yuxarıdakı 6 səhifə (Login, Dashboard, Appeals, Citizens)
3. ✅ Gözəl, professional dizayn
4. ✅ Responsive layout
5. ✅ Error handling + loading states
6. ✅ README.md (setup instructions)

## Qeyd
- **İlkin versiya** - sadə, amma gözəl olmalıdır
- Admin funksionallığı (users/org-units management) **opsional** - əsas fokus müraciətlər və vətəndaşlar
- Code clean, TypeScript strict, production-ready

