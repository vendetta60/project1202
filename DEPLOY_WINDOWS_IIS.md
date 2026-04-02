## Windows Server + IIS üçün offline deploy təlimatı

Bu sənəd bu proyektin (FastAPI backend + Vite React frontend) **internetsiz Windows Server mühitində, IIS istifadə edərək** deploy qaydalarını izah edir.

Backend: FastAPI (`uvicorn`) — port `8002`  
Frontend: Vite build (`npm run build`) — statik fayllar IIS-dən verilir  
IIS: `/api` sorğularını backend-ə reverse proxy edir.

> **Qeyd (offline mühit):** Aşağıdakı bütün paketlər və alətlər (Python, Node.js, pip paketləri, npm paketləri və s.) üçün installer-ləri və ya daxili mirror-u əvvəlcədən hazırlamalısınız. İnternet olmadığı üçün `pip install`, `npm install` əmrləri yalnız lokal/şəbəkə mirror-u olduqda işləyəcək.

---

## 1. Server mühiti (Windows + IIS) hazırlanması

- **Windows Server + IIS** quraşdırın (Server Manager → Add Roles and Features → Web Server (IIS)).
- Aşağıdakı IIS komponentlərini aktiv edin:
  - **Web Server → Application Development →**
    - `.NET Extensibility`, `ASP.NET` (lazım olarsa),
    - **URL Rewrite** və **Application Request Routing (ARR)** modulunu ayrıca quraşdırın (offline .msi faylları ilə).
  - **Web Server → Security → Request Filtering**
  - **Management Tools → IIS Management Console**
- Serverdə aşağıdakı proqramlar olmalıdır:
  - **Python 3.11+**
  - **Node.js 18+**
  - `git` (şərti, əgər kod zip ilə gəlmirsə)

Backend üçün MSSQL bağlantısı və `pyodbc` driver-ləri sistemdə öncədən sazlanmış olmalıdır (bu proyekt mövcud MSSQL bazası ilə işləyir).

---

## 2. Proyekt fayllarının serverə köçürülməsi

Proyekt kökü (hazırda səndə olduğu kimi) belə fərz olunur:

- `C:\apps\project1202`  (bu qovluqda həm `backend`, həm də `frontend`, həm də `wheelhouse` var)

Yəni:

- `C:\apps\project1202\backend`
- `C:\apps\project1202\frontend`  (yalnız dev maşın üçün lazımdır)
- `C:\apps\project1202\wheelhouse`  (`.whl` paketlərinin olduğu qovluq)

---

## 3. Backend (FastAPI) quraşdırılması və sazlanması

### 3.1. Virtual environment və paketlər

PowerShell açın, backend qovluğuna keçin:

```powershell
cd C:\apps\project1202\backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

`requirements.txt` faylına uyğun paketləri, proyekt kökündəki `wheelhouse_py310_win` qovluğundan quraşdırın (Python 3.10 üçün hazırladığın wheelhouse):

```powershell
pip install --no-index --find-links="C:\apps\project1202\wheelhouse_py310_win" -r requirements.txt
```

Əgər başqa yerdə saxlayırsansa, sadəcə `--find-links` yolunu dəyişmək kifayətdir.

### 3.2. Backend konfiqurasiyası

- `backend\env` faylını server mühitinə uyğun düzəldin:
  - **Database connection string** (MSSQL üçün),
  - **CORS_ALLOW_ORIGINS**:

    ```env
    CORS_ALLOW_ORIGINS=http://server-adi-vəya-ip
    ```

    və ya ehtiyac varsa:

    ```env
    CORS_ALLOW_ORIGINS=*
    ```

### 3.3. Backend-i servis kimi işə salmaq

Backend-i `uvicorn` ilə port `8002`-də dinləyən daimi servis kimi işlətmək məsləhətdir. Məsələn:

```powershell
cd C:\apps\project1202\backend
.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002
```

Production üçün:
- `nssm` və ya `sc create` kimi alətlərlə bu komandanı **Windows Service** kimi qeyd edin ki, server açılan kimi avtomatik işə düşsün.

**Firewall:**
- Windows Defender Firewall-da **Inbound Rule** yaradın və `TCP 8000` portuna daxil olan trafiki icazəli edin (yalnız daxili şəbəkə üçün məhdudlaşdırmaq olar).
- Windows Defender Firewall-da **Inbound Rule** yaradın və `TCP 8002` portuna daxil olan trafiki icazəli edin (yalnız daxili şəbəkə üçün məhdudlaşdırmaq olar).

---

## 4. Frontend (Vite build) hazırlanması

### 4.1. Env faylı

`frontend` qovluğunda `.env` yaradın (və ya `.env.example`-ı kopyalayın) və `VITE_API_URL`-i **IIS üzərindən gedəcək API ünvanına** yönəldin:

```env
VITE_API_URL=http://server-adi-vəya-ip/api/v1
```

Burada `/api` IIS tərəfindən backend-ə proxy ediləcək, backend isə `/api/v1` prefix-i ilə işləyir (`API_REFERENCE.md`-də göstərildiyi kimi).

### 4.2. Build (dev maşında) və yalnız `dist`-in serverə köçürülməsi

Ən praktik ssenari:

1. **Dev maşınında** (öz kompüterində) build et:

   ```powershell
   cd C:\apps\project1202\frontend
   npm install
   npm run build
   ```

   Nəticədə `C:\apps\project1202\frontend\dist` qovluğunda production fayllar yaranacaq.

2. `dist` qovluğunu arxivlə:

   ```powershell
   cd C:\apps\project1202\frontend
   Compress-Archive -Path dist -DestinationPath dist.zip
   ```

3. `dist.zip` faylını **serverə kopyala** (məsələn, `C:\apps\project1202\dist.zip`).

4. Serverdə `dist.zip`-i aç:

   ```powershell
   cd C:\apps\project1202
   Expand-Archive -Path dist.zip -DestinationPath .
   ```

5. Nəticədə serverdə bu qovluq olacaq:

   - `C:\apps\project1202\dist`

   IIS saytının **Physical path** olaraq bu `dist` qovluğu göstəriləcək (aşağıda 5.1-də).

---

## 5. IIS sazlanması (frontend + API proxy)

### 5.1. Yeni Website yaradılması

1. IIS Manager açın.
2. `Sites` üzərinə sağ klik → **Add Website…**
3. Məsələn:
   - **Site name:** `AppealsApp`
   - **Physical path:** `C:\apps\project1202\dist`
   - **Binding:**
     - **Type:** `http`
     - **IP address:** `All Unassigned` və ya konkret server IP
     - **Port:** `80` (vəya 8080, ehtiyacdan asılı)
     - **Host name:** daxili DNS adı (məs. `appeals.local`)
4. Saytı Start edin.

Bu mərhələdə `http://server-adi-vəya-ip/` ünvanına gedəndə frontend-in `index.html` faylı açılacaq, amma API hələ proxy olunmayıb.

### 5.2. URL Rewrite + ARR ilə `/api` proxy

#### 5.2.1. ARR aktiv edilməsi

1. IIS root səviyyəsində server adını seçin.
2. `Application Request Routing Cache` modulunu açın.
3. Sağ paneldən **Server Proxy Settings…** → `Enable proxy` işarəsini qoyun → Apply.

#### 5.2.2. URL Rewrite qaydası

1. `AppealsApp` saytını seçin.
2. `URL Rewrite` modulunu açın.
3. Sağ paneldən **Add Rule(s)…** → `Blank rule`.
4. Məsələn:
   - **Name:** `API to FastAPI`
   - **Requested URL:** `Matches the Pattern`
   - **Using:** `Regular Expressions`
   - **Pattern:** `^api/(.*)`
   - **Ignore case:** işarəli qalsın.
5. **Conditions** bölməsinə ehtiyac yoxdur (boş qala bilər).
6. **Action:**
   - **Action type:** `Rewrite`
  - **Rewrite URL:** `http://127.0.0.1:8002/api/{R:1}`
   - **Append query string:** işarəli
   - **Stop processing of subsequent rules:** işarəli
7. Apply edin.

Beləliklə:
- Brauzerdən `http://server-adi-vəya-ip/api/v1/...` sorğuları gəlir,
- IIS bu sorğuları `http://127.0.0.1:8002/api/v1/...` ünvanına ötürür,
- Backend isə FastAPI ilə cavab verir.

---

## 6. Yoxlama

1. Backend servisini işə salın və `http://127.0.0.1:8002/health` ünvanını serverdən test edin:

```powershell
Invoke-WebRequest http://127.0.0.1:8002/health
```

`{"status":"ok"}` cavabını görməlisiniz.

2. Brauzerdən (istər serverdən, istər şəbəkədəki başqa kompüterdən) bu ünvana gedin:

```text
http://server-adi-vəya-ip/
```

3. Login edib, hər hansı API funksiyasını (məs. vətəndaş siyahısı, müraciətlər və s.) yoxlayın.  
   - Sorğular `Developer Tools → Network` panelində `/api/v1/...` kimi görünməlidir.

---

## 7. Qısa xülasə

- **Backend:** `uvicorn app.main:app --host 0.0.0.0 --port 8002` (Windows Service kimi).
- **Frontend:** `npm run build` → `dist` qovluğu IIS saytının kök qovluğu.
- **IIS:** `/api/*` sorğularını `http://127.0.0.1:8002/api/*` ünvanına proxy edən URL Rewrite qaydası.
- **Env-lər:** `backend/env` və `frontend/.env` fayllarında IP/host adlarını server mühitinə uyğunlaşdırın.
