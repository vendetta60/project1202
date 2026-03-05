## Project1202 – Linux (Offline) Deploy Təlimatı

Bu sənəd layihəni **internetə çıxışı olmayan** Linux serverdə (məsələn Ubuntu/Debian) Nginx + FastAPI ilə qaldırmaq üçün addım-addım təlimatdır.

Struktur (serverdə hədəf yol nümunəsi):

- `/opt/project1202/backend` – FastAPI backend
- `/opt/project1202/frontend/dist` – build olunmuş React/Vite frontend

Backend API `http://127.0.0.1:8000/api/v1/...`, frontend isə Nginx vasitəsilə servis olunur.

---

### 1. Tələblər (Requirements)

#### 1.1. Serverdə OS paketləri

Serverdə (internetli və ya lokal repo ilə) aşağıdakılar quraşdırılmış olmalıdır:

- `python3` (ən azı 3.10)
- `python3-venv`
- `nginx`
- `systemd` (standart olaraq var)

Əgər virtual mühitdə `requirements.txt`-də olan Python paketlərini internet olmadan yükləyəcəksinizsə, əlavə olaraq development maşınında:

- `pip`
- `pip download` üçün disk boşluğu (bir neçə yüz MB)

#### 1.2. Development kompüteri

Bu maşında:

- Node.js 18+ (frontend build üçün)
- Python 3.10+ (wheel-ları yığmaq üçün)
- Layihənin tam kodu (git və ya zip)

---

### 2. Development maşınında hazırlıq

Bu addımlar interneti olan development maşınında edilir və nəticə flashkartla serverə daşınır.

#### 2.1. Frontend build

```bash
cd frontend
npm ci              # və ya npm install
npm run build       # nəticə: frontend/dist
```

`frontend/dist` qovluğunu saxlayın – serverdə yalnız bu lazım olacaq.

#### 2.2. Backend üçün offline paketlər (wheelhouse)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip

# wheelhouse qovluğu yaradın (layihə kökündə):
cd ..
mkdir wheelhouse

# requirements.txt üzrə bütün paketləri yüklə (İNTERNET LAZIMDIR!)
pip download -r backend/requirements.txt -d wheelhouse
```

Nəticədə diskdə belə struktur olacaq:

- `backend/` – kod + `requirements.txt` + `env`/`.env` nümunəsi
- `frontend/dist/` – build olunmuş UI
- `wheelhouse/` – `.whl` və `.tar.gz` Python paketləri

#### 2.3. Lazımsız fayllar

Artıq aşağıdakı sənədlər silinmişdir və serverə daşınmır:

- `CODE_CHANGES_DETAILED.md`
- `WORK_SUMMARY_FINAL.md`
- `RBAC_ARCHITECTURE_DIAGRAMS.md`
- `RBAC_IMPLEMENTATION_SUMMARY.md`
- `README_FIXES.md`
- `STATUS_REPORT.md`

---

### 3. Serverdə kataloq strukturu

Serverdə (root kimi):

```bash
sudo mkdir -p /opt/project1202
sudo chown -R $USER:$USER /opt/project1202
```

Flashkartdan aşağıdakı qovluqları **birbaşa** bu yolun altına kopyalayın:

- `backend/`
- `frontend/dist/`
- `wheelhouse/`

Nəticə:

- `/opt/project1202/backend`
- `/opt/project1202/frontend/dist`
- `/opt/project1202/wheelhouse`

---

### 4. Backend – virtualenv və asılılıqlar (OFFLINE)

```bash
cd /opt/project1202/backend
python3 -m venv .venv
source .venv/bin/activate

# İnternetsiz: yalnız wheelhouse-dan quraşdır
pip install --no-index --find-links=/opt/project1202/wheelhouse -r requirements.txt
```

> **Qeyd:** `requirements.txt` dəyişərsə, development maşınında `wheelhouse`-u yenidən yaratmalısınız.

#### 4.1. Konfiq (env)

Backend konfiqi aşağıdakı yollardan biri ilə verilir:

- `backend/.env` və ya `backend/env` faylı (artıq varsa, onu serverdə də kopyalayın)
- **və ya** systemd service faylında `Environment`/`EnvironmentFile` ilə

Əsas dəyişənlər (layihədə istifadə olunduqları kimi):

- `DATABASE_URL` və ya ekvivalent konfiq (MSSQL connection string)
- `JWT_SECRET`, `JWT_ALGORITHM`
- Texniki rejim, log və s. üçün lazım olan digər dəyişənlər

Bu faylları **heç vaxt** repoya və ya internetə qoymayın; yalnız serverdə saxlayın.

---

### 5. Backend üçün systemd servisi

`/etc/systemd/system/project1202-backend.service` yaradın:

```ini
[Unit]
Description=Project1202 FastAPI backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/project1202/backend
Environment="PYTHONUNBUFFERED=1"
# Əgər .env faylı varsa:
# EnvironmentFile=/opt/project1202/backend/.env
ExecStart=/opt/project1202/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

> `app.main:app` hissəsini backend giriş nöqtənizə uyğunlaşdırın (məsələn `app.main:app` və ya `main:app`).

Sonra:

```bash
sudo systemctl daemon-reload
sudo systemctl enable project1202-backend
sudo systemctl start project1202-backend
sudo systemctl status project1202-backend
```

Backend indi `127.0.0.1:8000` ünvanında işləməlidir.

---

### 6. Frontend – Nginx konfiqurasiyası

Frontend artıq build olunub (`frontend/dist`). Serverdə Node lazım deyil.

#### 6.1. Nginx site faylı

`/etc/nginx/sites-available/project1202`:

```nginx
server {
    listen 80;
    server_name _;  # daxili şəbəkə üçün; ehtiyac olarsa domen yazın

    root /opt/project1202/frontend/dist;
    index index.html;

    # API -> backend
    location /api/ {
        proxy_pass         http://127.0.0.1:8000/api/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # React Router üçün – bütün digər URL-lər index.html-a düşür
    location / {
        try_files $uri /index.html;
    }
}
```

Aktivləşdirin:

```bash
sudo ln -s /etc/nginx/sites-available/project1202 /etc/nginx/sites-enabled/project1202
sudo nginx -t
sudo systemctl reload nginx
```

#### 6.2. Frontend API URL-i

Frontend kodunda (`frontend/src/api/client.ts`) `baseURL` idealda belə olmalıdır:

```ts
const apiClient = axios.create({
  baseURL: '/api',
  // ...
});
```

Bu halda Nginx konfiqurasiyası ilə uyğunluq yaranır və prod serverdə heç nə dəyişməyə ehtiyac qalmır.

Əgər orada `http://localhost:8000` kimi tam URL varsa, **development maşınında** bunu `/api` ilə əvəz edin, sonra `npm run build` edib yalnız `dist/`-i serverə aparın.

---

### 7. Yeniləmə (offline deploy) prosesi

Yeni versiya çıxaranda:

1. **Development maşını**:
   - Backend kodunu yenilə (`git pull`, dəyişikliklər və s.).
   - `requirements.txt` dəyişibsə:

     ```bash
     rm -rf wheelhouse/*
     pip download -r backend/requirements.txt -d wheelhouse
     ```

   - Frontend üçün:

     ```bash
     cd frontend
     npm ci
     npm run build
     ```

2. **Flashkart**:
   - `backend/`-də yalnız kod fayllarını (konfiq faylları daxil) yenilə.
   - `frontend/dist/` qovluğunu yeniləyin.
   - `wheelhouse/`-u (əgər yenilənibsə) kopyalayın.

3. **Serverdə**:

   ```bash
   # Faylları /opt/project1202 altına kopyalayın (köhnə qovluqları əvəz edin)

   cd /opt/project1202/backend
   source .venv/bin/activate
   pip install --no-index --find-links=/opt/project1202/wheelhouse -r requirements.txt

   sudo systemctl restart project1202-backend
   sudo systemctl reload nginx
   ```

---

### 8. Sürətli yoxlama siyahısı (Checklist)

- [ ] `backend/.env` (və ya `EnvironmentFile`) serverdə düzgün doldurulub.
- [ ] `/opt/project1202/backend/.venv` yaradılıb, `pip install` offline `wheelhouse` ilə edilib.
- [ ] `project1202-backend.service` aktiv və `systemctl status` yaşıl.
- [ ] `frontend/dist` düzgün kopyalanıb və `Nginx` root bu qovluğa baxır.
- [ ] `apiClient` base URL-i `/api` olaraq qurulub.
- [ ] `nginx -t` konfiqurasiyanı uğurla təsdiqləyir.
- [ ] Brauzerdə `http://SERVER_IP/` açılır, `/api/v1/me` və digər endpointlər 200 qaytarır (login sonra).

Bu faylı **lokalda da** saxlayın ki, gələcəkdə offline deploy prosesini tez xatırlada biləsiniz.

