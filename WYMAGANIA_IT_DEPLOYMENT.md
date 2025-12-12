# Wymagania IT - Instalacja Aplikacji Inspekcyjnej

## 1. WYMAGANIA SPRZĘTOWE

### Serwer Windows Server 2019
- **Procesor:** Minimum 4 rdzenie (zalecane: 8 rdzeni)
- **RAM:** Minimum 8 GB (zalecane: 16 GB)
- **Dysk:** Minimum 100 GB wolnego miejsca na partycji systemowej
  - 20 GB dla kontenerów Docker
  - 30 GB dla obrazów Docker
  - 50 GB dla danych aplikacji, logów i kopii zapasowych
- **Sieć:** Karta sieciowa 1 Gbps

## 2. WYMAGANIA PROGRAMOWE

### System Operacyjny
- **Windows Server 2019** (wszystkie edycje)
- Najnowsze aktualizacje Windows Update zainstalowane

### Wymagane Oprogramowanie
1. **Docker Desktop for Windows** (wersja 4.x lub nowsza)
   - Obsługa kontenerów Linux (WSL 2 backend)
   - Link: https://www.docker.com/products/docker-desktop/

2. **Microsoft SQL Server** (już zainstalowany w sieci)
   - Wersja: SQL Server 2016 lub nowsza
   - Baza danych: GHSerwis (istniejąca)

3. **Git for Windows** (opcjonalne, ale zalecane)
   - Link: https://git-scm.com/download/win

## 3. WYMAGANIA DOSTĘPOWE

### Dostęp do Serwera
- **Uprawnienia administratora** na serwerze Windows Server 2019
- **Dostęp RDP** lub fizyczny dostęp do serwera
- **Uprawnienia do instalacji oprogramowania**

### Dostęp do Bazy Danych
- **Connection String do SQL Server:**
  - Adres serwera SQL: `[ADRES_SERWERA_SQL]`
  - Port: `1433` (standardowy)
  - Baza danych: `GHSerwis`
  - Login SQL: `[LOGIN_UŻYTKOWNIKA]`
  - Hasło: `[HASŁO_UŻYTKOWNIKA]`

- **Wymagane uprawnienia SQL:**
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE` na tabelach:
    - `dbo.ZadanieNagl`
    - `dbo.ZadaniePoz`
    - `dbo.ProtokolNagl`
    - `dbo.ProtokolPoz`
    - `dbo.ZdjeciaProtokolPoz`
    - `dbo.Uzytkownik`
  - `EXECUTE` na procedurach składowanych:
    - `dbo.sp_PPOZ_Zapisz`
    - `dbo.sp_PNAGL_Podpisz`
  - Dostęp do widoków (views):
    - `dbo.v_ZadanieNaglWidok`
    - `dbo.v_ZadaniePozWidok`
    - `dbo.v_ProtokolNaglWidok`
    - `dbo.v_ProtokolPozWidok`

### Dostęp Sieciowy
- **Dostęp do internetu** (podczas instalacji Docker i pobierania obrazów)
- **Otwarte porty wewnętrzne:**
  - Port `80` (HTTP) - dostęp do aplikacji
  - Port `443` (HTTPS) - opcjonalne, dla SSL
  - Port `8000` - backend API (opcjonalnie, jeśli zewnętrzny)

- **Dostęp z serwera aplikacyjnego do SQL Server:**
  - Port `1433` otwarty między serwerem aplikacyjnym a SQL Server

### Dostęp do Repozytorium Kodu
- **Kod źródłowy aplikacji** (otrzymany od developera)
- Katalog: `/home/user/inspection-app-iis` lub równoważny na Windows

## 4. KONFIGURACJA WYMAGANA PRZED INSTALACJĄ

### A. Włączenie WSL 2 (Windows Subsystem for Linux)

Uruchomić PowerShell jako administrator i wykonać:

```powershell
# Włączenie WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Włączenie Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart serwera
Restart-Computer
```

Po restarcie:

```powershell
# Ustawienie WSL 2 jako domyślnej wersji
wsl --set-default-version 2

# Instalacja kernela Linux (jeśli wymagane)
# Pobrać z: https://aka.ms/wsl2kernel
```

### B. Konfiguracja Firewall

Dodać reguły firewall dla portów:

```powershell
# Reguła dla portu HTTP (80)
New-NetFirewallRule -DisplayName "Inspection App HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Reguła dla portu HTTPS (443) - opcjonalnie
New-NetFirewallRule -DisplayName "Inspection App HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Reguła dla Backend API (8000) - tylko jeśli wymagany dostęp zewnętrzny
New-NetFirewallRule -DisplayName "Inspection App API" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### C. Przygotowanie Katalogów

```powershell
# Utworzenie katalogu głównego aplikacji
New-Item -ItemType Directory -Path "C:\InspectionApp" -Force

# Utworzenie katalogu na dane
New-Item -ItemType Directory -Path "C:\InspectionApp\data" -Force

# Utworzenie katalogu na logi
New-Item -ItemType Directory -Path "C:\InspectionApp\logs" -Force

# Utworzenie katalogu na backupy
New-Item -ItemType Directory -Path "C:\InspectionApp\backups" -Force
```

## 5. PARAMETRY KONFIGURACYJNE DO PRZYGOTOWANIA

Przygotować następujące informacje przed instalacją:

```
### BAZA DANYCH SQL SERVER ###
DB_SERVER=          # np. sql-server.domena.local lub 192.168.1.100
DB_PORT=1433
DB_NAME=GHSerwis
DB_USER=            # Login użytkownika SQL
DB_PASSWORD=        # Hasło użytkownika SQL

### APLIKACJA ###
APP_PORT_HTTP=80
APP_PORT_HTTPS=443  # Opcjonalnie
BACKEND_PORT=8000

### SSL/CERTYFIKATY (opcjonalnie) ###
SSL_CERT_PATH=      # Ścieżka do certyfikatu .crt
SSL_KEY_PATH=       # Ścieżka do klucza .key
```

## 6. PROCEDURA INSTALACJI - CHECKLIST

### Faza 1: Przygotowanie Środowiska
- [ ] Zainstalować Windows Server 2019 Updates
- [ ] Włączyć WSL 2 (krok 4.A)
- [ ] Zainstalować Docker Desktop for Windows
- [ ] Zrestartować serwer
- [ ] Zweryfikować działanie Docker: `docker --version`
- [ ] Skonfigurować firewall (krok 4.B)
- [ ] Utworzyć katalogi aplikacji (krok 4.C)

### Faza 2: Weryfikacja Dostępu do Bazy Danych
- [ ] Przetestować połączenie do SQL Server z serwera aplikacyjnego
- [ ] Zweryfikować uprawnienia użytkownika SQL
- [ ] Potwierdzić dostępność bazy `GHSerwis`

### Faza 3: Deployment Aplikacji
- [ ] Skopiować kod aplikacji do `C:\InspectionApp`
- [ ] Utworzyć plik `.env` z danymi konfiguracyjnymi
- [ ] Zbudować obrazy Docker: `docker-compose build`
- [ ] Uruchomić kontenery: `docker-compose up -d`
- [ ] Sprawdzić status kontenerów: `docker-compose ps`

### Faza 4: Weryfikacja Działania
- [ ] Sprawdzić logi backendu: `docker-compose logs backend`
- [ ] Sprawdzić logi frontendu: `docker-compose logs frontend`
- [ ] Test dostępu HTTP: `http://[ADRES_SERWERA]`
- [ ] Test logowania użytkownika
- [ ] Test podstawowych funkcji (lista zadań, protokoły)
- [ ] Test zapisu danych do bazy

### Faza 5: Konfiguracja Produkcyjna
- [ ] Skonfigurować automatyczne uruchamianie Docker kontenerów po restarcie
- [ ] Skonfigurować backup bazy danych
- [ ] Skonfigurować monitoring logów
- [ ] Skonfigurować SSL/HTTPS (opcjonalnie)
- [ ] Udokumentować procedury backupu i restore

## 7. TESTOWANIE I WALIDACJA

### Testy Funkcjonalne
1. **Test logowania:**
   - Otworzyć przeglądarkę: `http://[ADRES_SERWERA]`
   - Zalogować się jako użytkownik testowy
   - Potwierdzić dostęp do panelu głównego

2. **Test dostępu do bazy:**
   - Sprawdzić wyświetlanie listy zadań w zakładce OTWARTE
   - Sprawdzić wyświetlanie listy zadań w zakładce ZAMKNIĘTE
   - Otworzyć jedno zadanie i zweryfikować wyświetlanie szczegółów

3. **Test zapisywania danych:**
   - Edytować dowolne zadanie
   - Zapisać zmiany
   - Odświeżyć stronę i zweryfikować, czy dane zostały zapisane

4. **Test podpisu:**
   - Złożyć podpis klienta na zadaniu
   - Sprawdzić, czy podpis został zapisany
   - Sprawdzić, czy zadanie przesunęło się do zakładki ZAMKNIĘTE

### Testy Wydajnościowe
- Czas ładowania strony głównej: < 3 sekundy
- Czas odpowiedzi API: < 1 sekunda
- Stabilność aplikacji pod obciążeniem (10+ równoczesnych użytkowników)

### Testy Bezpieczeństwa
- Weryfikacja szyfrowania połączeń (HTTPS)
- Test dostępu bez autoryzacji (powinien przekierowywać do logowania)
- Test uprawnień użytkowników (role: Kierownik, Serwisant)

## 8. PROCEDURY BACKUP I RESTORE

### Backup Kontenerów
```powershell
# Backup bazy danych (wykonywany na SQL Server)
sqlcmd -S [SERWER_SQL] -U [USER] -P [PASSWORD] -Q "BACKUP DATABASE GHSerwis TO DISK='C:\Backups\GHSerwis_backup.bak'"

# Backup wolumenów Docker
docker run --rm -v inspection-app_backend_data:/data -v C:\InspectionApp\backups:/backup alpine tar czf /backup/backend_data_backup.tar.gz -C /data .

# Backup konfiguracji
Copy-Item C:\InspectionApp\.env C:\InspectionApp\backups\.env.backup
Copy-Item C:\InspectionApp\docker-compose.yml C:\InspectionApp\backups\docker-compose.yml.backup
```

### Restore
```powershell
# Restore bazy danych (na SQL Server)
sqlcmd -S [SERWER_SQL] -U [USER] -P [PASSWORD] -Q "RESTORE DATABASE GHSerwis FROM DISK='C:\Backups\GHSerwis_backup.bak' WITH REPLACE"

# Restore wolumenów Docker
docker run --rm -v inspection-app_backend_data:/data -v C:\InspectionApp\backups:/backup alpine sh -c "cd /data && tar xzf /backup/backend_data_backup.tar.gz"

# Restart kontenerów
cd C:\InspectionApp
docker-compose restart
```

## 9. MONITOROWANIE I UTRZYMANIE

### Komendy Monitorowania
```powershell
# Status kontenerów
docker-compose ps

# Logi (ostatnie 100 linii)
docker-compose logs --tail=100

# Logi live (śledzenie na żywo)
docker-compose logs -f

# Zużycie zasobów
docker stats

# Miejsce na dysku
docker system df
```

### Procedury Utrzymaniowe
1. **Co tydzień:**
   - Sprawdzić logi pod kątem błędów
   - Zweryfikować miejsce na dysku
   - Wykonać backup bazy danych

2. **Co miesiąc:**
   - Sprawdzić dostępne aktualizacje Docker
   - Wyczyścić stare obrazy: `docker system prune -a`
   - Zarchiwizować stare logi

3. **Po każdej aktualizacji aplikacji:**
   - Wykonać backup przed aktualizacją
   - Przetestować na środowisku testowym (jeśli dostępne)
   - Zaktualizować obrazy: `docker-compose pull`
   - Restart kontenerów: `docker-compose up -d`

## 10. KONTAKT I WSPARCIE

### W przypadku problemów skontaktować się z:
- **Developer:** [IMIĘ DEVELOPERA]
- **Email:** [EMAIL]
- **Telefon:** [NUMER]

### Dokumentacja techniczna:
- Lokalizacja: `C:\InspectionApp\README.md`
- Dokumentacja Docker: https://docs.docker.com/
- Dokumentacja aplikacji: `C:\InspectionApp\docs\`

## 11. ZAŁĄCZNIKI

### Plik .env (wzór)
```env
# Baza danych
DB_USER=inspection_user
DB_PASSWORD=SecurePassword123!
MSSQL_ODBC_CONNSTR=DRIVER={ODBC Driver 18 for SQL Server};SERVER=sql-server.local,1433;DATABASE=GHSerwis;UID=inspection_user;PWD=SecurePassword123!;Encrypt=yes;TrustServerCertificate=yes

# Porty
APP_PORT_HTTP=80
APP_PORT_HTTPS=443
BACKEND_PORT=8000
```

### Szacowany czas instalacji:
- Faza 1 (Przygotowanie): 1-2 godziny
- Faza 2 (Weryfikacja DB): 30 minut
- Faza 3 (Deployment): 1 godzina
- Faza 4 (Weryfikacja): 1 godzina
- Faza 5 (Konfiguracja produkcyjna): 1-2 godziny

**ŁĄCZNIE: 4.5 - 6.5 godzin**

---

**Data przygotowania dokumentu:** 2025-12-12
**Wersja dokumentu:** 1.0
**Status:** Do realizacji przez dział IT
