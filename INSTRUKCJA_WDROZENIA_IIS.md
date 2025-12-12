# Instrukcja Wdrożenia - Windows Server 2019 + IIS

## Wdrożenie Natywne (bez Docker)

Ten dokument opisuje wdrożenie aplikacji inspekcyjnej na Windows Server 2019 z wykorzystaniem IIS dla frontendu i Python Service dla backendu.

---

## WYMAGANIA WSTĘPNE

Przed rozpoczęciem upewnij się, że dział IT przygotował środowisko zgodnie z dokumentem `WYMAGANIA_SRODOWISKO_IT.md` (WARIANT A).

### Zainstalowane komponenty:
- [x] Windows Server 2019 z aktualizacjami
- [x] IIS (Internet Information Services)
- [x] Python 3.11
- [x] Node.js 18.x LTS
- [x] wkhtmltopdf
- [x] Dostęp do bazy SQL Server (connection string)
- [x] Katalogi utworzone: `C:\InspectionApp`

---

## KROK 1: Przygotowanie Kodu Aplikacji

### 1.1. Skopiowanie kodu na serwer

```powershell
# Skopiuj cały katalog projektu do serwera
# Docelowa lokalizacja: C:\InspectionApp
```

Struktura katalogów powinna wyglądać następująco:
```
C:\InspectionApp\
├── backend\
│   ├── app\
│   ├── requirements.txt
│   └── ...
├── frontend\
│   ├── src\
│   ├── public\
│   ├── package.json
│   └── ...
└── ...
```

---

## KROK 2: Konfiguracja Backendu (Python/FastAPI)

### 2.1. Instalacja zależności Python

```powershell
cd C:\InspectionApp\backend

# Utworzenie środowiska wirtualnego (opcjonalnie, ale zalecane)
python -m venv venv

# Aktywacja środowiska wirtualnego
.\venv\Scripts\Activate.ps1

# Instalacja zależności
pip install -r requirements.txt

# Instalacja pyodbc dla połączenia z SQL Server (jeśli nie w requirements.txt)
pip install pyodbc

# Instalacja uvicorn (serwer ASGI)
pip install uvicorn[standard]
```

### 2.2. Konfiguracja zmiennych środowiskowych

Utwórz plik `.env` w katalogu `C:\InspectionApp\backend\`:

```powershell
# Utwórz plik .env
notepad C:\InspectionApp\backend\.env
```

Zawartość pliku `.env`:
```env
# Connection string do SQL Server (uzupełnić danymi od IT)
MSSQL_ODBC_CONNSTR=DRIVER={ODBC Driver 18 for SQL Server};SERVER=sql-server.local,1433;DATABASE=GHSerwis;UID=app_inspection;PWD=TwojeHaslo123!;Encrypt=yes;TrustServerCertificate=yes

# Konfiguracja aplikacji
API_HOST=0.0.0.0
API_PORT=8000

# Katalog dla wygenerowanych PDF-ów
PDF_OUTPUT_DIR=C:\InspectionApp\pdfs
```

**WAŻNE:** Uzupełnij `SERVER`, `UID` i `PWD` danymi otrzymanymi od działu IT.

### 2.3. Test uruchomienia backendu

```powershell
# Test uruchomienia (w katalogu backend z aktywowanym venv)
cd C:\InspectionApp\backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Powinno uruchomić się bez błędów
# Test w przeglądarce: http://localhost:8000/docs
```

Po sprawdzeniu, że działa, zamknij serwer (Ctrl+C).

### 2.4. Utworzenie Windows Service dla backendu

Aby backend działał jako usługa Windows:

#### Opcja A: Użycie NSSM (Non-Sucking Service Manager)

```powershell
# Pobranie NSSM
Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "C:\Temp\nssm.zip"
Expand-Archive -Path "C:\Temp\nssm.zip" -DestinationPath "C:\Temp\"

# Kopiowanie nssm.exe do system32
Copy-Item "C:\Temp\nssm-2.24\win64\nssm.exe" -Destination "C:\Windows\System32\"

# Instalacja usługi
nssm install InspectionAppAPI "C:\InspectionApp\backend\venv\Scripts\python.exe" "C:\InspectionApp\backend\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000"

# Konfiguracja katalogu roboczego
nssm set InspectionAppAPI AppDirectory "C:\InspectionApp\backend"

# Konfiguracja zmiennych środowiskowych
nssm set InspectionAppAPI AppEnvironmentExtra "MSSQL_ODBC_CONNSTR=DRIVER={ODBC Driver 18 for SQL Server};SERVER=sql-server.local,1433;DATABASE=GHSerwis;UID=app_inspection;PWD=TwojeHaslo123!;Encrypt=yes;TrustServerCertificate=yes"

# Uruchomienie usługi
nssm start InspectionAppAPI

# Sprawdzenie statusu
nssm status InspectionAppAPI
```

#### Opcja B: Użycie Task Scheduler

```powershell
# Utworzenie zadania w Task Scheduler, które uruchamia się przy starcie systemu
$action = New-ScheduledTaskAction -Execute "C:\InspectionApp\backend\venv\Scripts\python.exe" -Argument "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "C:\InspectionApp\backend"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "InspectionAppAPI" -Action $action -Trigger $trigger -Principal $principal -Settings $settings
Start-ScheduledTask -TaskName "InspectionAppAPI"
```

**Weryfikacja:**
```powershell
# Test dostępu do API
Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing
```

Powinieneś otrzymać odpowiedź HTML z dokumentacją Swagger.

---

## KROK 3: Konfiguracja Frontendu (React + IIS)

### 3.1. Build aplikacji React

```powershell
cd C:\InspectionApp\frontend

# Instalacja zależności
npm install

# Utworzenie zmiennych środowiskowych dla build
# Utwórz plik .env w katalogu frontend
notepad .env
```

Zawartość pliku `.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

**Jeśli API będzie dostępne pod innym adresem, zmień `localhost` na odpowiedni hostname/IP.**

```powershell
# Build produkcyjny aplikacji React
npm run build
```

Po wykonaniu tego polecenia, w katalogu `frontend\build` znajdziesz zbudowaną aplikację.

### 3.2. Utworzenie aplikacji w IIS

#### 3.2.1. Skopiowanie plików do katalogu IIS

```powershell
# Utwórz katalog dla aplikacji w IIS
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\inspection-app" -Force

# Skopiuj zbudowaną aplikację
Copy-Item -Path "C:\InspectionApp\frontend\build\*" -Destination "C:\inetpub\wwwroot\inspection-app\" -Recurse -Force
```

#### 3.2.2. Utworzenie aplikacji w IIS Manager

**Opcja A: Przez IIS Manager (GUI)**

1. Otwórz **IIS Manager** (Start → Internet Information Services (IIS) Manager)
2. Rozwiń drzewo serwera → **Sites** → **Default Web Site**
3. Kliknij prawym przyciskiem na **Default Web Site** → **Add Application**
4. Wprowadź:
   - **Alias:** `inspection-app`
   - **Physical Path:** `C:\inetpub\wwwroot\inspection-app`
5. Kliknij **OK**

**Opcja B: Przez PowerShell**

```powershell
Import-Module WebAdministration

# Utworzenie aplikacji w IIS
New-WebApplication -Name "inspection-app" -Site "Default Web Site" -PhysicalPath "C:\inetpub\wwwroot\inspection-app" -ApplicationPool "DefaultAppPool"
```

#### 3.2.3. Konfiguracja URL Rewrite dla React Router

React Router wymaga, aby wszystkie requesty były przekierowywane do `index.html`.

**Utwórz plik `web.config` w katalogu `C:\inetpub\wwwroot\inspection-app\`:**

```powershell
notepad C:\inetpub\wwwroot\inspection-app\web.config
```

Zawartość pliku `web.config`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Router" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

#### 3.2.4. Konfiguracja Reverse Proxy dla API

Aby requesty do `/api` były przekierowywane do backendu (port 8000), skonfiguruj ARR (Application Request Routing).

**Włączenie Proxy w ARR:**

1. W IIS Manager, wybierz serwer (główny węzeł w drzewie)
2. Otwórz **Application Request Routing Cache**
3. W panelu **Actions** (po prawej) kliknij **Server Proxy Settings**
4. Zaznacz **Enable proxy**
5. Kliknij **Apply**

**Dodanie reguły Reverse Proxy do `web.config`:**

Zmodyfikuj plik `C:\inetpub\wwwroot\inspection-app\web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Reguła dla API - przekierowanie do backendu -->
        <rule name="API Reverse Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8000/api/{R:1}" />
        </rule>

        <!-- Reguła dla React Router -->
        <rule name="React Router" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

---

## KROK 4: Testy i Weryfikacja

### 4.1. Test backendu

```powershell
# Sprawdzenie, czy usługa działa
Get-Service InspectionAppAPI  # jeśli używasz NSSM

# Lub sprawdzenie zadania w Task Scheduler
Get-ScheduledTask -TaskName "InspectionAppAPI"

# Test API
Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing
```

### 4.2. Test frontendu

Otwórz przeglądarkę i przejdź do:
```
http://[ADRES_SERWERA]/inspection-app
```

**Testy funkcjonalne:**
1. **Strona główna** - powinna załadować się strona logowania
2. **Logowanie** - zaloguj się jako użytkownik testowy
3. **Lista zadań** - sprawdź, czy wyświetlają się zadania z bazy
4. **Otwórz zadanie** - sprawdź, czy szczegóły się ładują
5. **Edycja zadania** - wprowadź zmianę i zapisz
6. **Podpis** - złóż podpis klienta i sprawdź, czy został zapisany

### 4.3. Test połączenia z bazą danych

```powershell
# Test z poziomu Python
cd C:\InspectionApp\backend
.\venv\Scripts\Activate.ps1

python
>>> import pyodbc
>>> conn_str = "DRIVER={ODBC Driver 18 for SQL Server};SERVER=sql-server.local,1433;DATABASE=GHSerwis;UID=app_inspection;PWD=TwojeHaslo123!;Encrypt=yes;TrustServerCertificate=yes"
>>> conn = pyodbc.connect(conn_str)
>>> cursor = conn.cursor()
>>> cursor.execute("SELECT TOP 5 ZNAG_Id FROM dbo.ZadanieNagl")
>>> for row in cursor.fetchall():
...     print(row)
>>> conn.close()
>>> exit()
```

---

## KROK 5: Konfiguracja Produkcyjna

### 5.1. Zmiana URL aplikacji (jeśli potrzebne)

Jeśli aplikacja ma być dostępna pod głównym URL (np. `http://serwer/` zamiast `http://serwer/inspection-app/`):

```powershell
# Przenieś pliki do głównego katalogu Default Web Site
Copy-Item -Path "C:\inetpub\wwwroot\inspection-app\*" -Destination "C:\inetpub\wwwroot\" -Recurse -Force

# Zrestartuj IIS
iisreset
```

### 5.2. Konfiguracja HTTPS/SSL (opcjonalnie)

Jeśli dział IT przygotował certyfikat SSL:

1. W **IIS Manager**, wybierz **Default Web Site**
2. W panelu **Actions** kliknij **Bindings**
3. Kliknij **Add**
4. Wybierz:
   - **Type:** https
   - **Port:** 443
   - **SSL certificate:** [wybierz certyfikat]
5. Kliknij **OK**

Zmodyfikuj `frontend\.env` i przebuduj aplikację:
```env
REACT_APP_API_URL=https://[HOSTNAME]/api
```

Przebuduj frontend:
```powershell
cd C:\InspectionApp\frontend
npm run build
Copy-Item -Path "build\*" -Destination "C:\inetpub\wwwroot\inspection-app\" -Recurse -Force
```

### 5.3. Automatyczne uruchamianie usług po restarcie

**Backend (InspectionAppAPI):**
```powershell
# Jeśli używasz NSSM, usługa jest już skonfigurowana do auto-start
nssm set InspectionAppAPI Start SERVICE_AUTO_START

# Jeśli używasz Task Scheduler, zadanie jest już skonfigurowane do uruchamiania przy starcie
```

**IIS:**
IIS domyślnie uruchamia się automatycznie po restarcie serwera.

**Weryfikacja:**
```powershell
# Restart serwera (test)
Restart-Computer

# Po restarcie sprawdź, czy usługi działają
Get-Service W3SVC  # IIS
# Test API i frontendu w przeglądarce
```

---

## KROK 6: Backup i Monitoring

### 6.1. Konfiguracja logów

**Logi backendu:**
```powershell
# Utwórz katalog na logi
New-Item -ItemType Directory -Path "C:\InspectionApp\logs" -Force

# Skonfiguruj uvicorn do zapisywania logów (w pliku .env)
# Dodaj do .env:
# LOG_FILE=C:\InspectionApp\logs\backend.log
```

**Logi IIS:**
Logi IIS są domyślnie zapisywane w:
```
C:\inetpub\logs\LogFiles\
```

### 6.2. Harmonogram backupów

**Backup bazy danych:**
Uzgodnij z działem IT harmonogram backupów bazy `GHSerwis`.

**Backup aplikacji:**
```powershell
# Utwórz skrypt backupu
notepad C:\InspectionApp\backup.ps1
```

Zawartość `backup.ps1`:
```powershell
$backupDir = "C:\InspectionApp\backups\backup_$(Get-Date -Format 'yyyy-MM-dd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force

# Backup kodu i konfiguracji
Copy-Item -Path "C:\InspectionApp\backend\" -Destination "$backupDir\backend\" -Recurse -Force
Copy-Item -Path "C:\InspectionApp\frontend\" -Destination "$backupDir\frontend\" -Recurse -Force
Copy-Item -Path "C:\inetpub\wwwroot\inspection-app\" -Destination "$backupDir\wwwroot\" -Recurse -Force

Write-Host "Backup utworzony w: $backupDir"
```

**Harmonogram backupu (raz na tydzień):**
```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\InspectionApp\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am
Register-ScheduledTask -TaskName "InspectionAppBackup" -Action $action -Trigger $trigger -User "SYSTEM" -RunLevel Highest
```

---

## KROK 7: Dokumentacja dla Użytkowników

### 7.1. URL dostępu do aplikacji

Przekaż użytkownikom URL:
```
http://[ADRES_SERWERA]/inspection-app
```
lub
```
https://[HOSTNAME]/inspection-app  # jeśli HTTPS
```

### 7.2. Instrukcja logowania

Użytkownicy logują się przy użyciu swoich kont z bazy `GHSerwis` (tabela `dbo.Uzytkownik`).

---

## TROUBLESHOOTING

### Problem: Backend nie uruchamia się

**Rozwiązanie:**
```powershell
# Sprawdź logi usługi
Get-EventLog -LogName Application -Source "InspectionAppAPI" -Newest 10

# Sprawdź, czy Python jest dostępny
python --version

# Sprawdź connection string do SQL
cd C:\InspectionApp\backend
.\venv\Scripts\Activate.ps1
python -c "import os; print(os.getenv('MSSQL_ODBC_CONNSTR'))"
```

### Problem: Frontend wyświetla błąd 404 dla routingu

**Rozwiązanie:**
Sprawdź, czy `web.config` zawiera regułę URL Rewrite i czy moduł URL Rewrite jest zainstalowany w IIS.

### Problem: API zwraca błąd połączenia z bazą

**Rozwiązanie:**
```powershell
# Test połączenia SQL z serwera aplikacyjnego
Test-NetConnection -ComputerName sql-server.local -Port 1433

# Sprawdź uprawnienia użytkownika SQL
# Wykonaj na SQL Server:
# USE GHSerwis;
# SELECT * FROM sys.database_principals WHERE name = 'app_inspection';
```

### Problem: Brak dostępu do `/api`

**Rozwiązanie:**
Upewnij się, że ARR (Application Request Routing) jest zainstalowany i włączony w IIS, oraz że reguła reverse proxy w `web.config` jest poprawna.

---

## KONTAKT I WSPARCIE

W przypadku problemów:
- **Developer:** [IMIĘ]
- **Email:** [EMAIL]
- **Telefon:** [NUMER]

---

**Data wdrożenia:** _________________________

**Wdrożenie wykonał:** _________________________

**Podpis:** _________________________

---

## ZAŁĄCZNIKI

### Lokalizacje kluczowych plików:
- Backend: `C:\InspectionApp\backend\`
- Frontend (build): `C:\inetpub\wwwroot\inspection-app\`
- Logi backendu: `C:\InspectionApp\logs\`
- Logi IIS: `C:\inetpub\logs\LogFiles\`
- Backupy: `C:\InspectionApp\backups\`

### Usługi i procesy:
- Backend Service: `InspectionAppAPI` (NSSM lub Task Scheduler)
- IIS: `W3SVC`
- SQL Server: [podaj nazwę usługi od IT]
