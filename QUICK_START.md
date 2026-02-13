# 🚀 Proyekt İşə Salma Təlimatları

## ✅ Backend Hazırdır və İşləyir!

Backend artıq işləyir:
- **URL**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health

## 📦 Frontend Quraşdırma

Frontend-i işə salmaq üçün:

```bash
cd frontend
npm install
npm run dev
```

Frontend adətən `http://localhost:5173` portunda işləyir (və ya terminal-da göstərilən port).

## 🔐 İlkin Login Məlumatları

Backend-də avtomatik yaradılan admin user:
- **Username**: `admin`
- **Password**: `admin123`

## 🛠️ Backend-i Yenidən Run Etmək

Backend-i dayandırıbsan və yenidən run etmək istəyirsənsə:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## ✅ Düzəldilən Problemlər

1. ✅ SQLAlchemy model syntax error-ları düzəldildi
2. ✅ Login endpoint JSON dəstəkləyir
3. ✅ Appeals və Citizens pagination response formatı
4. ✅ Field adları uyğunlaşdırıldı (reg_no)
5. ✅ User aktivləşdirmə endpoint-i əlavə olundu
6. ✅ Appeal detail endpoint-i əlavə olundu

## 📝 Qeydlər

- Backend background-da işləyir (ayrı PowerShell pəncərəsində)
- Frontend də ayrı pəncərədə işləyir
- İkisini də eyni vaxtda run etmək lazımdır

