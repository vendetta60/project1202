# Ubuntu deploy (Internet) — Nginx + systemd + SSL (Let’s Encrypt)

Bu sənəd **yalnız internet mühiti** üçündür (server internetə çıxır və internetdən gələn trafik qəbul edir).

- **Backend**: FastAPI (`uvicorn`) → **yalnız lokal** `127.0.0.1:8002`
- **Frontend**: `frontend/dist/` → Nginx statik verir
- **Nginx**: `/api/*` → backend proxy
- **SSL**: `certbot` (Let’s Encrypt)

---

## 0) Serverdə fayllar harada olacaq? (nəyi hara yükləyirsən)

Serverdə bu strukturu saxla:

```
/opt/project1202/
  backend/           # repo-dan backend qovluğu
  dist/              # frontend build (yalnız dist)
```

- **`/opt/project1202/backend/`**: repo-dakı `backend` qovluğu (içində `requirements.txt`, `app/`, `env.example` və s.)
- **`/opt/project1202/backend/env`**: server üçün konfiq faylı (özün yaradacaqsan)
- **`/opt/project1202/dist/`**: `frontend/dist` build nəticəsi (lokalda build edib serverə kopyalayacaqsan)

Nginx statik faylları daha “standart” yerə kopyalayacağıq:

```
/var/www/appeals-frontend/    # dist buraya kopyalanır
```

---

## 1) Lokal maşında (dev) frontend build (dist) hazırla

Backend API URL-ni prod üçün ver:

> Domen varsa tövsiyə: `https://example.com/api/v1`  
> Domen yoxdursa: `http://SERVER_IP/api/v1`

Linux/macOS/WSL:

```bash
cd frontend
echo "VITE_API_URL=https://example.com/api/v1" > .env.production
npm ci
npm run build
```

Windows PowerShell:

```powershell
cd frontend
"VITE_API_URL=https://example.com/api/v1" | Out-File -Encoding ascii .env.production
npm ci
npm run build
```

Nəticə: `frontend/dist/`

---

## 2) Faylları serverə yüklə (backend + dist)

Serverdə qovluğu hazırla:

```bash
sudo mkdir -p /opt/project1202
sudo chown -R $USER:$USER /opt/project1202
```

### Variant A — `rsync` (tövsiyə)

Lokaldan (repo root-da):

```bash
# backend qovluğu
rsync -av --delete ./backend/ ubuntu@SERVER_IP:/opt/project1202/backend/

# dist (yalnız build nəticəsi)
rsync -av --delete ./frontend/dist/ ubuntu@SERVER_IP:/opt/project1202/dist/
```

### Variant B — `scp` (sadə)

```bash
scp -r ./backend ubuntu@SERVER_IP:/opt/project1202/backend
scp -r ./frontend/dist ubuntu@SERVER_IP:/opt/project1202/dist
```

---

## 3) Serverdə paketlər + user + permissions

Ubuntu serverdə:

```bash
set -e
sudo apt update
sudo apt install -y python3 python3-pip nginx unzip rsync curl
```

> Qeyd: MSSQL + `pyodbc` istifadə edirsənsə, əlavə olaraq ODBC paketləri də tələb oluna bilər (`unixodbc` + `msodbcsql18`).

---

## 4) Backend quraşdırılması (VENVSİZ) — requirements

Bu ssenaridə paketlər **sistemin Python mühitinə** yüklənir.

> Qeyd (Ubuntu 23+/24+): `pip` bəzən “externally managed environment” xətası verə bilər.
> O halda aşağıdakı komandalara `--break-system-packages` əlavə etməlisən.

```bash
set -e
cd /opt/project1202/backend

sudo python3 -m pip install -U pip
sudo python3 -m pip install -r requirements.txt
```

---

## 5) Backend konfiq (`env`) — harada və necə?

Serverdə:

```bash
cd /opt/project1202/backend
cp -n env.example env
sudo nano env
```

Minimum olaraq burada bunlar düzgün olmalıdır (səndə faylda adlar fərqli ola bilər — `env.example`-a baxıb uyğunlaşdır):

- `DATABASE_URL` və ya MSSQL connection settings
- `SECRET_KEY` / JWT secret
- `CORS_ALLOW_ORIGINS` (domenin/IP)

---

## 6) systemd servisi (backend daimi işləsin)

```bash
sudo tee /etc/systemd/system/appeals-backend.service >/dev/null <<'UNIT'
[Unit]
Description=Appeals FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/project1202/backend
EnvironmentFile=/opt/project1202/backend/env
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8002
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now appeals-backend
```

Yoxla:

```bash
curl -s http://127.0.0.1:8002/health
sudo systemctl status appeals-backend --no-pager
```

Loglar:

```bash
sudo journalctl -u appeals-backend -n 200 --no-pager
```

---

## 7) Frontend statik faylları Nginx root-a kopyala

```bash
sudo mkdir -p /var/www/appeals-frontend
sudo rsync -a --delete /opt/project1202/dist/ /var/www/appeals-frontend/
sudo chown -R www-data:www-data /var/www/appeals-frontend
```

---

## 8) Nginx config (HTTP → işlək)

```bash
sudo tee /etc/nginx/sites-available/appeals >/dev/null <<'NGINX'
server {
    listen 80;

    # Domen varsa yaz:
    # server_name example.com www.example.com;
    # Domen yoxdursa:
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
```

Yoxla:

- `http://SERVER_IP/` → frontend
- `http://SERVER_IP/api/v1/...` → backend

---

## 9) Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

---

## 10) HTTPS / SSL (Let’s Encrypt, Certbot) — domen varsa

Şərt: domen DNS A record server IP-yə yönəlib olmalıdır.

```bash
sudo apt install -y certbot python3-certbot-nginx

# öz domeninlə əvəz et:
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot avtomatik olaraq `listen 443` və redirect (80→443) əlavə edəcək.

Yoxla:

- `https://example.com/`
- `https://example.com/api/v1/...`

Auto-renew:

```bash
sudo systemctl status certbot.timer --no-pager
sudo certbot renew --dry-run
```

---

## 11) Update (yeniləmə) necə edilir?

### 11.1 Frontend update

Lokalda `npm run build` et, sonra serverə yenidən `dist` at:

```bash
rsync -av --delete ./frontend/dist/ ubuntu@SERVER_IP:/opt/project1202/dist/
ssh ubuntu@SERVER_IP "sudo rsync -a --delete /opt/project1202/dist/ /var/www/appeals-frontend/"
```

### 11.2 Backend update

```bash
# lokaldan backend qovluğunu yenilə
rsync -av --delete ./backend/ ubuntu@SERVER_IP:/opt/project1202/backend/

# serverdə dependency dəyişibsə:
ssh ubuntu@SERVER_IP "cd /opt/project1202/backend && sudo python3 -m pip install -r requirements.txt"

# restart
ssh ubuntu@SERVER_IP "sudo systemctl restart appeals-backend"
```

---

## 12) Tez-tez rast gəlinən problemlər

- Nginx config xətası:

```bash
sudo nginx -t
sudo journalctl -u nginx -n 200 --no-pager
```

- Backend servis işləmir:

```bash
sudo systemctl status appeals-backend --no-pager
sudo journalctl -u appeals-backend -n 200 --no-pager
```

- 502 Bad Gateway:
  - backend portu işləyir? `curl http://127.0.0.1:8002/health`
  - `proxy_pass` URL düzgündür?

