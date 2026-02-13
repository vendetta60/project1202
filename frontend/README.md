# Müraciət Qeydiyyat Sistemi - Frontend

Modern və gözəl dizayn edilmiş müraciət qeydiyyat sistemi üçün React frontend tətbiqi.

## Texnologiyalar

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router v6** - Routing
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Form management
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client
- **Vite** - Build tool

## Xüsusiyyətlər

### Səhifələr

1. **Login** (`/login`) - İstifadəçi girişi
2. **Dashboard** (`/dashboard`) - Statistika və son müraciətlər
3. **Müraciətlər** (`/appeals`) - Müraciətlərin siyahısı
4. **Müraciət Formu** (`/appeals/new`, `/appeals/:id`) - Müraciət yarat/redaktə
5. **Vətəndaşlar** (`/citizens`) - Vətəndaşların siyahısı
6. **Vətəndaş Formu** (`/citizens/new`, `/citizens/:id`) - Vətəndaş yarat/redaktə

### Əsas Funksiyalar

- İstifadəçi autentifikasiyası
- Müraciətlərin idarə edilməsi (CRUD)
- Vətəndaşların idarə edilməsi (CRUD)
- Axtarış və filtrasiya
- Pagination
- Responsive dizayn
- Loading states
- Error handling
- Azerbaijani dil dəstəyi

## Quraşdırma

### Tələblər

- Node.js 18+
- npm və ya yarn
- Backend API (FastAPI) `http://localhost:8000/api/v1` ünvanında işləməlidir

### Addımlar

1. Layihəni klonlayın və dependency-ləri quraşdırın:

```bash
npm install
```

2. Backend API-nin işlədiyinə əmin olun:

Backend API `http://localhost:8000/api/v1` ünvanında accessible olmalıdır.

3. Development server-i başladın:

```bash
npm run dev
```

Tətbiq `http://localhost:5173` ünvanında açılacaq.

## İstifadə

### Giriş

1. Login səhifəsinə gedin (`http://localhost:5173/login`)
2. İstifadəçi adı və şifrənizi daxil edin
3. "Daxil ol" düyməsinə klikləyin

### Müraciət Yaratmaq

1. Dashboard-dan və ya Appeals səhifəsindən "Yeni Müraciət" düyməsinə klikləyin
2. Formu doldurun:
   - Mövzu (tələb olunur)
   - Təsvir (tələb olunur)
   - Vətəndaş seçin (axtarışla)
   - İdarə seçin
3. "Yadda saxla" düyməsinə klikləyin

### Vətəndaş Yaratmak

1. Dashboard-dan və ya Citizens səhifəsindən "Yeni Vətəndaş" düyməsinə klikləyin
2. Formu doldurun:
   - Ad (tələb olunur)
   - Soyad (tələb olunur)
   - FIN (tələb olunur, 7 simvol)
   - Telefon (opsional)
   - Email (opsional)
   - Ünvan (opsional)
3. "Yadda saxla" düyməsinə klikləyin

## API Endpoint-ləri

Frontend aşağıdakı API endpoint-ləri ilə işləyir:

- `POST /auth/login` - İstifadəçi girişi
- `GET /me` - Cari istifadəçi məlumatı
- `GET /appeals` - Müraciətlər siyahısı
- `POST /appeals` - Müraciət yarat
- `GET /appeals/{id}` - Müraciət ətraflı məlumat
- `PATCH /appeals/{id}` - Müraciət yenilə
- `GET /citizens` - Vətəndaşlar siyahısı
- `POST /citizens` - Vətəndaş yarat
- `GET /citizens/{id}` - Vətəndaş ətraflı məlumat
- `PATCH /citizens/{id}` - Vətəndaş yenilə
- `GET /org-units` - İdarələr siyahısı

Bütün API sorğularında `Authorization: Bearer <token>` header-i göndərilir.

## Build

Production build yaratmaq üçün:

```bash
npm run build
```

Build edilmiş fayllar `dist/` qovluğunda olacaq.

## Layihə Strukturu

```
src/
├── api/              # API client və endpoint funksiyaları
│   ├── client.ts     # Axios client konfiqurasiyası
│   ├── auth.ts       # Auth API
│   ├── appeals.ts    # Appeals API
│   ├── citizens.ts   # Citizens API
│   └── orgUnits.ts   # Org Units API
├── components/       # Reusable komponentlər
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   ├── LoadingSpinner.tsx
│   └── StatCard.tsx
├── pages/           # Səhifə komponentləri
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── AppealsList.tsx
│   ├── AppealForm.tsx
│   ├── CitizensList.tsx
│   └── CitizenForm.tsx
├── utils/           # Utility funksiyalar
│   ├── auth.ts      # Auth helper funksiyaları
│   └── errors.ts    # Error handling
├── App.tsx          # Main app və routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Əsas Xüsusiyyətlər

### Authentication

- Token-based authentication
- Automatic token injection in requests
- Auto-redirect to login on 401 errors
- Protected routes

### Error Handling

- User-friendly error messages in Azerbaijani
- Network error detection
- Form validation errors
- API error handling

### UX Features

- Loading states with spinners
- Hover effects on tables
- Smooth transitions
- Responsive design
- Keyboard shortcuts (Enter to submit forms)

## Məlumat Təhlükəsizliyi

- Tokenlar localStorage-da saxlanılır
- Bütün API sorğuları authentication tələb edir
- Operator istifadəçilər yalnız öz idarələrinin məlumatlarını görürlər
- Admin istifadəçilər bütün məlumatları görə bilərlər

## Dəstək

Problem və ya sual olduqda development komandası ilə əlaqə saxlayın.
