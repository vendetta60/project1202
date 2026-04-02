cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt



## Ubuntu deploy (Nginx + systemd) — internetli və internetsiz (offline)

Bu sənəd **sıfırdan** Ubuntu Server-də bu layihəni deploy etmək üçündür:

- **Backend**: FastAPI (`uvicorn`) → **yalnız lokal** `127.0.0.1:8002` (Nginx proxy edir)
- **Frontend**: Vite build (`dist/`) → Nginx statik verir
- **Nginx**: `/api/*` sorğularını backend-ə yönləndirir

---

## 0) Serverdə hansı fayllar olmalıdır? (nəyi hara atırsan)

Serverdə bu qovluqları belə saxla (nümunə yol):

```
/opt/project1202/
  backend/                 # repo-dan
  dist/                    # yalnız frontend build nəticəsi (production)
```

- **`/opt/project1202/backend/`**: repo-dakı `backend` qovluğu (içində `requirements.txt`, `app/`, `env.example` və s.)
- **`/opt/project1202/backend/env`**: server üçün konfiq (aşağıda necə yaradılır)
- **`/opt/project1202/dist/`**: `frontend/dist` build nəticəsi (dev maşında build edib serverə kopyalayacaqsan)
- **Offline Python paketləri** *(offline ssenari)*: `.whl` faylları.
  - **Sənin hazır strukturuna görə** bu fayllar `backend/packages/` qovluğundadır.
  - Serverdə yol: **`/opt/project1202/backend/packages/`**

> Qeyd: `wheelhouse_py310_win` Windows üçündür, Ubuntu-da işləməyəcək. Offline server üçün **Linux (manylinux) wheel** hazırlanmalıdır.

---

## 1) Hansı variantla deploy edirsən?

### Variant A — internetli server (ən rahat)
- `apt` işləyir, `pip install -r ...` PyPI-dən çəkə bilir.

### Variant B — internetsiz server (offline)
- `apt` üçün lokal `.deb` və ya mirror
- `pip` üçün lokal `.whl` paketlər (səndə `backend/packages/`)
- Frontend üçün: build **dev maşında** edilir, serverə yalnız `dist/` atılır (serverdə npm/Node şərt deyil)

---

## 1.1) Offline hazırlıq (internetli kompüterdə) — Ubuntu 22 üçün

Bu bölmə offline deploy-un ən vacib hissəsidir: **serverə aparacağın paketləri** internetli kompüterdə hazırlayırsan.

### A) Ubuntu 22 / Python 3.10 üçün `.whl` paketlərini Windows-da yığmaq (səndə `backend/packages/` kimi)

Ubuntu 22-də default Python adətən **3.10** olur. Wheelhouse-u **serverdəki Python versiyası** ilə eyni saxla.

Internetli Linux kompüterdə (və ya WSL2 Ubuntu) repo kökündə:

PowerShell (Windows) — repo kökündə:

```powershell
cd C:\Users\qorxmaz.mammadov\Desktop\project1202
New-Item -ItemType Directory -Force backend\packages | Out-Null

# Ubuntu 22 (manylinux) + Python 3.10 üçün only-wheel yüklə
python -m pip install -U pip
python -m pip download -r backend\requirements.txt -d backend\packages `
  --only-binary=:all: --platform manylinux2014_x86_64 --implementation cp --python-version 310 --abi cp310

# Bəzən transitive dependency düşməyə bilər — ən çox rast gəlinən:
python -m pip download sniffio -d backend\packages `
  --only-binary=:all: --platform manylinux2014_x86_64 --implementation cp --python-version 310 --abi cp310
```

**Nəticə:** `backend/packages/` içində `.whl` fayllar olacaq. Offline serverdə `pip install --no-index --find-links=...` zamanı hamısı localdan quraşmalıdır.

> Vacib: `pyodbc` Linux-da sistem kitabxanaları tələb edir. Offline serverdə həm Python wheel, həm də `apt` `.deb` paketləri lazım ola bilər (aşağıdakı “B” bölməsi).

### B) Offline `.deb` paketlərini necə hazırlayırsan? (minimum)

Offline Ubuntu 22 serverdə bu minimum paketlər lazımdır:

- `python3`, `python3-venv`, `python3-pip`
- `nginx`
- `unzip`
- (MSSQL varsa) `unixodbc` və Microsoft ODBC driver (`msodbcsql18` və dependency-lər)

Internetli Ubuntu 22 kompüterdə `.deb` yığmaq üçün ən sadə yanaşma:

```bash
mkdir -p debs
cd debs

# Bazalar
apt-get download python3 python3-venv python3-pip nginx unzip

# MSSQL/ODBC (lazımdırsa)
apt-get download unixodbc libodbc1 odbcinst odbcinst1debian2
```

> Qeyd: `msodbcsql18` Microsoft repo tələb edir; offline üçün onu ayrıca `.deb` kimi götürüb dependency-ləri ilə birlikdə serverə aparmaq lazımdır.

Serverdə `.deb` quraşdırma:

```bash
sudo dpkg -i *.deb || sudo apt -f install
```

### C) Frontend `dist/` offline server üçün necə hazırlanır?

Frontend build-i internetli maşında et və serverə yalnız `dist/` apar:

```bash
cd /path/to/project1202/frontend
echo "VITE_API_URL=http://SERVER_IP/api/v1" > .env.production
npm ci
npm run build
```

Sonra `frontend/dist/` qovluğunu serverdə `/opt/project1202/dist/` kimi yerləşdir.

### D) Serverə aparacağın “paket” siyahısı (praktik)

Serverə kopyala:

- repo-dan: `backend/`  → `/opt/project1202/backend/`
- build-dən: `frontend/dist/` → `/opt/project1202/dist/`
- offline python: `backend/packages/` → `/opt/project1202/backend/packages/`
- offline apt: `debs/*.deb` → serverdə istənilən qovluğa (məs. `/opt/project1202/debs/`)

---

## 2) Internetli server — tam ardıcıllıq (copy/paste)

Bu ssenari **internet mühiti** üçündür:

- Serverin **public IP**-si var
- Domen varsa: `example.com` → server IP-yə yönləndirilib
- Nginx internetdən 80/443 portlarını qəbul edir
- Backend yalnız `127.0.0.1:8002`-də işləyir (xaricə açılmır)

### 2.0 Faylları serverə necə atırsan? (repo + dist)

Serverdə aşağıdakı struktur olmalıdır:

```
/opt/project1202/
  backend/        # repo-dan backend qovluğu
  dist/           # frontend build (yalnız dist)
```

**Variant 1 — serverdə git clone (internet varsa ən rahat):**

```bash
sudo mkdir -p /opt/project1202
sudo chown -R $USER:$USER /opt/project1202
cd /opt/project1202
# repo URL-ni buraya yaz
git clone <REPO_URL> repo
rm -rf backend dist
mv repo/backend ./backend
mv repo/frontend/dist ./dist 2>/dev/null || true
```

> Qeyd: `frontend/dist` adətən dev maşında build edilir. Serverdə build etmək istəsən Node.js lazımdır.

**Variant 2 — lokal maşından `scp/rsync` ilə upload (tövsiyə):**

- Lokalda:
  - `backend/` qovluğunu olduğu kimi göndər
  - `frontend` üçün isə yalnız `frontend/dist/` göndər

Misal (lokaldan):

```bash
# backend (repo-dakı backend qovluğu)
rsync -av --delete ./backend/ ubuntu@SERVER_IP:/opt/project1202/backend/

# frontend dist (build nəticəsi)
rsync -av --delete ./frontend/dist/ ubuntu@SERVER_IP:/opt/project1202/dist/
```

> Windows-dasan: Git Bash/WSL ilə `rsync` rahat olur. Əks halda WinSCP də istifadə edə bilərsən.

```bash
set -e

# 2.1 Paketlər
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx unzip

# 2.2 Layihə faylları artıq /opt/project1202 altında olmalıdır:
#   /opt/project1202/backend
#   /opt/project1202/dist   (frontend build)

# 2.3 Backend venv + paketlər
cd /opt/project1202/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
deactivate

# 2.4 Backend env
cp -n env.example env
sudo nano env

# 2.5 systemd
sudo tee /etc/systemd/system/appeals-backend.service >/dev/null <<'UNIT'
[Unit]
Description=Appeals FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/project1202/backend
ExecStart=/opt/project1202/backend/.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now appeals-backend

# 2.6 Backend test
curl -s http://127.0.0.1:8002/health

# 2.7 Frontend faylları (dist) → Nginx root
sudo mkdir -p /var/www/appeals-frontend
sudo rsync -a --delete /opt/project1202/dist/ /var/www/appeals-frontend/
sudo chown -R www-data:www-data /var/www/appeals-frontend

# 2.8 Nginx config
sudo tee /etc/nginx/sites-available/appeals >/dev/null <<'NGINX'
server {
    listen 80;
    # Domenin varsa buraya yaz: example.com www.example.com
    # Domen yoxdursa server IP ilə işləyəcək, qalır _.
    server_name _;

    root /var/www/appeals-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        # Ən stabil yanaşma: location prefix-i çıxmadan backend-ə URI-ni olduğu kimi göndəririk
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20m;
}
NGINX

sudo ln -sf /etc/nginx/sites-available/appeals /etc/nginx/sites-enabled/appeals
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 2.9 Firewall (UFW istifadə edirsənsə)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 2.10 (İstəyə bağlı, tövsiyə) HTTPS / SSL — Certbot
# Domen serverə yönləndirilmiş olmalıdır.
# Əgər domen yoxdursa bu hissəni keç.
sudo apt install -y certbot python3-certbot-nginx
# example.com-u öz domeninlə əvəz et:
# sudo certbot --nginx -d example.com -d www.example.com
```

İndi:
- `http://SERVER_IP/` → frontend
- `http://SERVER_IP/api/v1/...` → backend

Əgər domen + SSL qurdunsa:
- `https://example.com/` → frontend
- `https://example.com/api/v1/...` → backend

---

## 3) Offline server — tam ardıcıllıq (copy/paste)

Əsas fərq: `pip install` PyPI-dən yox, **lokal wheelhouse**-dan gedir.

Serverdə bu olmalıdır:
- `/opt/project1202/backend/`
- `/opt/project1202/backend/packages/`  *(.whl paketlər — internetli maşında yığılıb serverə kopyalanır)*
- `/opt/project1202/dist/`  *(frontend build nəticəsi)*

```bash
set -e

# 3.1 Paketlər (offline .deb ilə)
# Bu hissə sənin offline paket hazırlığına bağlıdır.
# Minimum tələb: python3, python3-venv, nginx, unzip

# 3.2 Backend venv + offline wheelhouse
cd /opt/project1202/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install --no-index --find-links=/opt/project1202/backend/packages -r requirements.txt
deactivate

# 3.3 Backend env
cp -n env.example env
nano env

# 3.4 systemd (internetli ilə eyni)
sudo tee /etc/systemd/system/appeals-backend.service >/dev/null <<'UNIT'
[Unit]
Description=Appeals FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/project1202/backend
ExecStart=/opt/project1202/backend/.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now appeals-backend
curl -s http://127.0.0.1:8002/health

# 3.5 Frontend dist → Nginx root
sudo mkdir -p /var/www/appeals-frontend
sudo rsync -a --delete /opt/project1202/dist/ /var/www/appeals-frontend/
sudo chown -R www-data:www-data /var/www/appeals-frontend

# 3.6 Nginx config (internetli ilə eyni)
sudo tee /etc/nginx/sites-available/appeals >/dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    root /var/www/appeals-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        # Ən stabil yanaşma: location prefix-i çıxmadan backend-ə URI-ni olduğu kimi göndəririk
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20m;
}
NGINX

sudo ln -sf /etc/nginx/sites-available/appeals /etc/nginx/sites-enabled/appeals
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4) `backend/env` necə doldurulmalıdır? (minimum)

`/opt/project1202/backend/env` faylında ən azı bunları düzəlt:

- `DATABASE_URL` (SQLite və ya MSSQL)
- `JWT_SECRET` (prod-da mütləq dəyiş)
- `CORS_ALLOW_ORIGINS` (Nginx domen/IP)

Nümunə (prod):

```env
ENV=prod
DATABASE_URL=sqlite:///./app.db
JWT_SECRET=CHANGE_ME_LONG_RANDOM
CORS_ALLOW_ORIGINS=http://SERVER_IP
```

---

## 5) Frontend `dist/`-i necə hazırlayırsan? (dev maşında)

Dev maşında:

```bash
cd frontend
echo "VITE_API_URL=http://SERVER_IP/api/v1" > .env.production
npm ci
npm run build
```

Sonra `frontend/dist/` qovluğunu serverə kopyala və serverdə:

- `dist/` → `/opt/project1202/dist/`

---

## 6) Yoxlama

Serverin özündə:

```bash
curl -s http://127.0.0.1:8002/health
sudo systemctl status appeals-backend
sudo systemctl status nginx
```

Brauzer:
- `http://SERVER_IP/`
- `http://SERVER_IP/api/v1/health` *(əgər route yoxdursa, `http://SERVER_IP/api/v1/...` normal endpoint)*

---

## 7) Sürətli troubleshooting

- Backend qalxmır:
  - `sudo journalctl -u appeals-backend -n 200 --no-pager`
  - Port:
    - `sudo ss -ltnp | grep 8002`
- Nginx error:
  - `sudo nginx -t`
  - `sudo journalctl -u nginx -n 200 --no-pager`

---

## 1. Server mühiti hazırlanması

Ubuntu Server (20.04+ və ya 22.04+) fərz edək.

### 1.1. Lazımı paketlər

İnternetli mühitdə `.deb` paketlərini yığıb, offline serverə köçürdüyünüzü fərz edək. Nəticədə serverdə bu paketlər quraşdırılmış olmalıdır:

- `python3`, `python3-venv`, `python3-pip`
- `nginx`
- MSSQL üçün müvafiq ODBC driver-lər (`msodbcsql` və s., əgər lazım olarsa)
- Node.js 18+ (binary və ya `.deb` ilə offline quraşdırma) — yalnız **build dev maşında** edilirsə serverdə Node lazım olmaya bilər

---

## 2. Proyekt fayllarının serverə köçürülməsi

Proyekt kökü nümunə:

- `/opt/project1202`  (bu qovluqda `backend` və Linux üçün `wheelhouse` var)

Yəni:

- `/opt/project1202/backend`
- `/opt/project1202/wheelhouse`  (`.whl` paketlərinin toplandığı qovluq — **Ubuntu üçün manylinux wheel**)

`frontend` mənbə qovluğuna production serverdə ehtiyac yoxdur; build-i dev maşında edib yalnız `dist`-i serverə atacağıq (yuxarıdakı cədvəl, addım 7–8).

---

## 3. Backend (FastAPI) quraşdırılması və systemd servisi

### 3.1. Virtual environment və paketlər

```bash
cd /opt/project1202/backend
python3 -m venv .venv
source .venv/bin/activate
```

`requirements.txt` faylından paketləri `/opt/project1202/wheelhouse` qovluğundan quraşdırın:

```bash
pip install --no-index --find-links=/opt/project1202/wheelhouse -r requirements.txt
```

Əgər `wheelhouse` başqa yerdədirsə, sadəcə `--find-links` yolunu dəyişin.

### 3.2. Backend `env` faylı

```bash
cp env.example env   # lazım olsa
nano env
```

Tənzimləmələr:

- MSSQL/SQLite bağlantısı (`DATABASE_URL` və s.)
- CORS üçün (prod-da mümkün qədər konkret origin):

```env
CORS_ALLOW_ORIGINS=http://server-adi-vəya-ip
```

və ya zərurət olduqda:

```env
CORS_ALLOW_ORIGINS=*
```

Tətbiq `WorkingDirectory`-də olan `env` faylını avtomatik oxuyur (`app.core.config`).

### 3.3. `systemd` servisi (uvicorn üçün)

Backend-i daimi servis kimi işlətmək üçün `systemd` unit yaradın.

```bash
sudo nano /etc/systemd/system/appeals-backend.service
```

İçərisinə (yolları öz mühitinizə uyğunlaşdırın):

```ini
[Unit]
Description=Appeals FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/project1202/backend
# env faylı WorkingDirectory altında olmalıdır: /opt/project1202/backend/env
ExecStart=/opt/project1202/backend/.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Sonra:

```bash
sudo systemctl daemon-reload
sudo systemctl enable appeals-backend
sudo systemctl start appeals-backend
sudo systemctl status appeals-backend
```

Test üçün serverdən:

```bash
curl http://127.0.0.1:8002/health
```

`{"status":"ok"}` görməlisiniz.

---

## 4. Frontend (Vite build) hazırlanması

### 4.1. Env faylı (build vaxtı)

`frontend` qovluğunda production üçün məsələn `.env.production`:

```env
VITE_API_URL=http://server-adi-vəya-ip/api/v1
```

Burada `/api` Nginx tərəfindən backend-ə proxy edilir; backend `/api/v1` prefix-i ilə işləyir.

### 4.2. Build (dev maşında) və yalnız `dist`-in serverə köçürülməsi

1. **Dev maşınında** build et:

   ```bash
   cd /path/to/project1202/frontend
   npm ci
   npm run build
   ```

   Nəticə: `frontend/dist` qovluğunda production fayllar.

2. Arxivlə və serverə köçür:

   ```bash
   cd /path/to/project1202/frontend
   zip -r dist.zip dist
   ```

3. Serverdə:

   ```bash
   cd /opt/project1202
   unzip dist.zip
   sudo mkdir -p /var/www/appeals-frontend
   sudo cp -r dist/* /var/www/appeals-frontend/
   sudo chown -R www-data:www-data /var/www/appeals-frontend
   ```

---

## 5. Nginx sazlanması (statik frontend + API proxy)

Yeni Nginx server block yaradın:

```bash
sudo nano /etc/nginx/sites-available/appeals
```

Məsələn:

```nginx
server {
    listen 80;
    server_name server-adi-vəya-ip;

    root /var/www/appeals-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        # Ən stabil yanaşma: location prefix-i çıxmadan backend-ə URI-ni olduğu kimi göndəririk
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20m;
}
```

Saytı aktiv edin və Nginx-i yenidən yükləyin:

```bash
sudo ln -sf /etc/nginx/sites-available/appeals /etc/nginx/sites-enabled/appeals
sudo nginx -t
sudo systemctl reload nginx
```

Əgər `default` saytı port 80-də ziddiyyət yaradırsa:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

İndi:

- `http://server-adi-vəya-ip/` → frontend
- `http://server-adi-vəya-ip/api/v1/...` → FastAPI backend

---

## 6. Firewall və təhlükəsizlik

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```

Backend yalnız `127.0.0.1:8002`-də dinlədiyi üçün xaricdən birbaşa görünmür; yalnız Nginx vasitəsilə çıxış olunur.

---

## 7. Yoxlama

1. Backend:

```bash
sudo systemctl status appeals-backend
curl http://127.0.0.1:8002/health
```

2. Nginx:

```bash
sudo systemctl status nginx
```

3. Brauzer: `http://server-adi-vəya-ip/`

4. `Network` panelində API çağırışlarının `http://server-adi-vəya-ip/api/v1/...` ünvanına getdiyini təsdiq edin.

---

## 8. Qısa xülasə

- **Backend:** `systemd` servisi ilə `uvicorn app.main:app --host 127.0.0.1 --port 8002`; konfiq `backend/env`.
- **Frontend:** `npm run build` → `dist` məzmunu `/var/www/appeals-frontend`.
- **Nginx:** `/api/` → `http://127.0.0.1:8002/api/`.
- **Əmrlərin tam sırası:** bu faylın əvvəlindəki **«Əmrlərin ardıcıllığı»** cədvəli və kod bloku.
