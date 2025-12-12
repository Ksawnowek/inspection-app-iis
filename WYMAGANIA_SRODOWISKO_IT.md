# Wymagania dla Działu IT - Przygotowanie Środowiska

## Dokument dla: Dział IT
## Cel: Przygotowanie środowiska pod wdrożenie Aplikacji Inspekcyjnej
## Termin: [DO UZUPEŁNIENIA]

---

## 1. INFRASTRUKTURA SERWEROWA

### Serwer Aplikacyjny - Windows Server 2019

**Wymagane:**
- [ ] Serwer fizyczny lub wirtualny z Windows Server 2019
- [ ] Minimum 8 GB RAM (zalecane 16 GB)
- [ ] Minimum 4 rdzenie CPU (zalecane 8 rdzeni)
- [ ] Minimum 100 GB wolnego miejsca na dysku systemowym
- [ ] Karta sieciowa 1 Gbps
- [ ] Zainstalowane wszystkie aktualizacje Windows Update

**Dostęp:**
- [ ] Udostępnić konto z uprawnieniami administratora lokalnego
- [ ] Skonfigurować dostęp RDP dla osoby wdrażającej aplikację
- [ ] Przekazać: hostname serwera, adres IP, domenę (jeśli dotyczy)

---

## 2. BAZA DANYCH - SQL SERVER

### Wymagane Informacje

**Parametry połączenia:**
```
Adres serwera SQL:  _________________________ (np. sql-server.domena.local)
Port:               1433 (standardowy)
Nazwa bazy:         GHSerwis
```

### Konto Użytkownika SQL

**Wymagane:**
- [ ] Utworzyć dedykowanego użytkownika SQL do aplikacji
  - Nazwa użytkownika: `app_inspection` (lub inna nazwa)
  - Hasło: [silne hasło, min. 12 znaków]
  - Typ uwierzytelniania: SQL Server Authentication

**Przekazać:**
- [ ] Login SQL: _________________________
- [ ] Hasło SQL: _________________________
- [ ] Pełny connection string lub parametry połączenia

### Uprawnienia Użytkownika SQL

Na bazie danych `GHSerwis` użytkownik musi mieć następujące uprawnienia:

**Uprawnienia do tabel:**
- [ ] `SELECT`, `INSERT`, `UPDATE`, `DELETE` na tabelach:
  - `dbo.ZadanieNagl`
  - `dbo.ZadaniePoz`
  - `dbo.ProtokolNagl`
  - `dbo.ProtokolPoz`
  - `dbo.ZdjeciaProtokolPoz`
  - `dbo.Uzytkownik`

**Uprawnienia do procedur składowanych:**
- [ ] `EXECUTE` na procedurach:
  - `dbo.sp_PPOZ_Zapisz`
  - `dbo.sp_PNAGL_Podpisz`

**Uprawnienia do widoków:**
- [ ] `SELECT` na widokach:
  - `dbo.v_ZadanieNaglWidok`
  - `dbo.v_ZadaniePozWidok`
  - `dbo.v_ProtokolNaglWidok`
  - `dbo.v_ProtokolPozWidok`

### Skrypt SQL do nadania uprawnień:

```sql
-- Utworzenie użytkownika (jeśli nie istnieje)
CREATE LOGIN [app_inspection] WITH PASSWORD = 'SilneHaslo123!@#';
GO

USE [GHSerwis];
GO

CREATE USER [app_inspection] FOR LOGIN [app_inspection];
GO

-- Uprawnienia do tabel
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.ZadanieNagl TO [app_inspection];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.ZadaniePoz TO [app_inspection];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.ProtokolNagl TO [app_inspection];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.ProtokolPoz TO [app_inspection];
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.ZdjeciaProtokolPoz TO [app_inspection];
GRANT SELECT ON dbo.Uzytkownik TO [app_inspection];
GO

-- Uprawnienia do procedur składowanych
GRANT EXECUTE ON dbo.sp_PPOZ_Zapisz TO [app_inspection];
GRANT EXECUTE ON dbo.sp_PNAGL_Podpisz TO [app_inspection];
GO

-- Uprawnienia do widoków
GRANT SELECT ON dbo.v_ZadanieNaglWidok TO [app_inspection];
GRANT SELECT ON dbo.v_ZadaniePozWidok TO [app_inspection];
GRANT SELECT ON dbo.v_ProtokolNaglWidok TO [app_inspection];
GRANT SELECT ON dbo.v_ProtokolPozWidok TO [app_inspection];
GO
```

**Test połączenia:**
- [ ] Zweryfikować możliwość połączenia z serwerem aplikacyjnym do SQL Servera
- [ ] Przetestować login i uprawnienia użytkownika `app_inspection`

---

## 3. KONFIGURACJA SIECIOWA

### Dostęp Sieciowy

**Firewall - połączenia przychodzące (Inbound):**
- [ ] Port `80` (HTTP) - dostęp do aplikacji webowej
- [ ] Port `443` (HTTPS) - dostęp HTTPS (opcjonalnie, jeśli SSL)
- [ ] Port `8000` (API) - opcjonalnie, tylko jeśli wymagany dostęp zewnętrzny do API

**Firewall - połączenia wychodzące (Outbound):**
- [ ] Port `1433` - połączenie z SQL Server (z serwera aplikacyjnego do SQL Server)
- [ ] Port `80/443` - dostęp do internetu (pobieranie obrazów Docker podczas instalacji)

**Routing i DNS:**
- [ ] Zapewnić, że serwer aplikacyjny może pingować serwer SQL
- [ ] Jeśli używany jest hostname SQL Server, upewnić się że jest rozwiązywany przez DNS
- [ ] Przekazać: adres IP serwera aplikacyjnego: _________________________

### Dostęp Użytkowników Końcowych

**Wymagane:**
- [ ] Określić, z jakiej sieci użytkownicy będą korzystać z aplikacji:
  - [ ] Sieć lokalna (LAN)
  - [ ] VPN
  - [ ] Internet publiczny (wymaga dodatkowych zabezpieczeń)

- [ ] Skonfigurować DNS lub przekazać użytkownikom adres dostępu:
  - URL aplikacji: http://_________________________ lub https://_________________________

---

## 4. OPROGRAMOWANIE I KOMPONENTY

### WAŻNE: Docker na Windows Server 2019

**Docker Desktop NIE JEST dostępny dla Windows Server 2019.**

Dostępne są **DWA WARIANTY** wdrożenia:

---

### **WARIANT A: Natywne wdrożenie na IIS + Python Service (ZALECANE)**

Ten wariant nie wymaga Docker - aplikacja działa bezpośrednio na Windows Server.

**Wymagane:**
- [ ] **IIS (Internet Information Services)**
  - Włączyć rolę Web Server (IIS) w Server Manager
  - Zainstalować moduł URL Rewrite dla IIS
  - Zainstalować moduł Application Request Routing (ARR)

- [ ] **Python 3.11**
  - Pobrać z: https://www.python.org/downloads/
  - Podczas instalacji zaznaczyć "Add Python to PATH"
  - Zainstalować pip (package manager)

- [ ] **Node.js 18.x LTS**
  - Pobrać z: https://nodejs.org/
  - Zainstalować wraz z npm

- [ ] **wkhtmltopdf** (do generowania PDF)
  - Pobrać z: https://wkhtmltopdf.org/downloads.html
  - Zainstalować w domyślnej lokalizacji

**Komendy instalacyjne IIS (PowerShell jako administrator):**
```powershell
# Instalacja IIS
Install-WindowsFeature -Name Web-Server -IncludeManagementTools

# Instalacja URL Rewrite
# Pobrać z: https://www.iis.net/downloads/microsoft/url-rewrite

# Instalacja ARR (Application Request Routing)
# Pobrać z: https://www.iis.net/downloads/microsoft/application-request-routing
```

**Weryfikacja:**
```powershell
# Sprawdzenie Python
python --version

# Sprawdzenie Node.js
node --version

# Sprawdzenie IIS
Get-WindowsFeature Web-Server
```

---

### **WARIANT B: Docker Engine (Mirantis Container Runtime)**

Docker Engine dla Windows Server wymaga licencji enterprise.

**Wymagane:**
- [ ] Zakup licencji Mirantis Container Runtime (MCR)
- [ ] Instalacja Mirantis Container Runtime
  - Link: https://www.mirantis.com/software/container-runtime/

**Komendy PowerShell (jako administrator):**
```powershell
# Instalacja Docker Engine z repozytorium Mirantis
Install-Module -Name DockerMsftProvider -Repository PSGallery -Force
Install-Package -Name docker -ProviderName DockerMsftProvider -Force

# Restart serwera
Restart-Computer

# Po restarcie - uruchomienie usługi Docker
Start-Service Docker

# Weryfikacja
docker version
```

**Instalacja docker-compose:**
```powershell
# Pobranie docker-compose (standalone)
Invoke-WebRequest "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-windows-x86_64.exe" -UseBasicParsing -OutFile $Env:ProgramFiles\Docker\docker-compose.exe

# Weryfikacja
docker-compose --version
```

---

### **Rekomendacja:**

Dla Windows Server 2019 **zalecamy WARIANT A** (natywne wdrożenie na IIS):
- ✅ Brak kosztów licencji Docker
- ✅ Lepsza integracja z Windows
- ✅ Łatwiejsze zarządzanie
- ✅ Lepsza wydajność na Windows Server

WARIANT B (Docker) jest bardziej skomplikowany i wymaga dodatkowych kosztów licencji.

### Katalogi i Struktura Plików

**Wymagane:**
- [ ] Utworzyć katalog główny dla aplikacji: `C:\InspectionApp`
- [ ] Utworzyć podkatalogi:
  - `C:\InspectionApp\data` - dane aplikacji
  - `C:\InspectionApp\logs` - logi aplikacji
  - `C:\InspectionApp\backups` - kopie zapasowe
  - `C:\InspectionApp\pdfs` - wygenerowane pliki PDF

**Komendy PowerShell:**
```powershell
New-Item -ItemType Directory -Path "C:\InspectionApp" -Force
New-Item -ItemType Directory -Path "C:\InspectionApp\data" -Force
New-Item -ItemType Directory -Path "C:\InspectionApp\logs" -Force
New-Item -ItemType Directory -Path "C:\InspectionApp\backups" -Force
New-Item -ItemType Directory -Path "C:\InspectionApp\pdfs" -Force
```

**Uprawnienia:**
- [ ] Nadać pełne uprawnienia (Full Control) dla konta administratora na `C:\InspectionApp`
- [ ] Upewnić się, że Docker ma dostęp do tych katalogów

---

## 5. CERTYFIKATY SSL (OPCJONALNIE)

Jeśli aplikacja ma być dostępna przez HTTPS:

**Wymagane:**
- [ ] Certyfikat SSL (.crt lub .pem)
- [ ] Klucz prywatny (.key)
- [ ] Certyfikat pośredni / łańcuch certyfikatów (jeśli dotyczy)

**Przekazać:**
- [ ] Ścieżkę do pliku certyfikatu: _________________________
- [ ] Ścieżkę do pliku klucza: _________________________
- [ ] Hasło do klucza (jeśli jest zaszyfrowany): _________________________

---

## 6. BACKUP I DISASTER RECOVERY

### Harmonogram Kopii Zapasowych

**Wymagane:**
- [ ] Skonfigurować automatyczne backupy bazy danych `GHSerwis`
  - Częstotliwość: codziennie o godzinie: _________
  - Lokalizacja backupów: _________________________
  - Retencja: min. 7 dni

**Przekazać:**
- [ ] Informacje o polityce backup bazy danych
- [ ] Procedura odzyskiwania danych (restore)

### Backup Serwera Aplikacyjnego

**Wymagane:**
- [ ] Uwzględnić katalog `C:\InspectionApp` w backupie serwera
- [ ] Backup konfiguracji Docker (jeśli dotyczy)

---

## 7. MONITORING I LOGI

### System Monitorowania

**Opcjonalnie (jeśli dostępne w firmie):**
- [ ] Dodać serwer aplikacyjny do systemu monitorowania
- [ ] Skonfigurować alerty dla:
  - Wysokiego zużycia CPU (>80%)
  - Wysokiego zużycia RAM (>90%)
  - Niskiego miejsca na dysku (<10 GB)
  - Niedostępności aplikacji (HTTP 500/503)

### Logi

**Wymagane:**
- [ ] Upewnić się, że logi Windows Event Log są włączone
- [ ] Skonfigurować rotację logów (aby nie zapełniły dysku)

---

## 8. BEZPIECZEŃSTWO

### Polityki Bezpieczeństwa

**Wymagane:**
- [ ] Wyłączyć niepotrzebne usługi Windows na serwerze
- [ ] Skonfigurować Windows Firewall (tylko wymagane porty otwarte)
- [ ] Upewnić się, że Windows Defender lub inny antywirus jest aktywny
- [ ] Skonfigurować regularne aktualizacje Windows Update

### Dostęp do Serwera

**Wymagane:**
- [ ] Ograniczyć dostęp RDP tylko dla autoryzowanych użytkowników
- [ ] Używać silnych haseł (min. 12 znaków, złożone)
- [ ] Rozważyć użycie MFA (Multi-Factor Authentication) dla RDP

---

## 9. DOKUMENTACJA DO PRZEKAZANIA

Po przygotowaniu środowiska, przekazać następujące informacje osobie wdrażającej aplikację:

### Parametry Serwera Aplikacyjnego
```
Hostname:        _________________________
Adres IP:        _________________________
Domena:          _________________________
System:          Windows Server 2019
RDP Login:       _________________________
RDP Hasło:       _________________________
```

### Parametry Bazy Danych
```
SQL Server:      _________________________
Port:            1433
Baza danych:     GHSerwis
SQL Login:       _________________________
SQL Hasło:       _________________________
Connection String: DRIVER={ODBC Driver 18 for SQL Server};SERVER=_____;DATABASE=GHSerwis;UID=_____;PWD=_____;Encrypt=yes;TrustServerCertificate=yes
```

### Parametry Sieciowe
```
URL aplikacji:   http://_________________________ (lub https://)
Porty otwarte:   80, 443, 8000, 1433
Firewall:        [Potwierdź że skonfigurowany]
```

### Certyfikaty SSL (jeśli dotyczy)
```
Certyfikat (.crt):  _________________________
Klucz (.key):       _________________________
Hasło klucza:       _________________________
```

---

## 10. TIMELINE I KOORDYNACJA

### Szacowany Czas Przygotowania

**WARIANT A (IIS + Python - zalecany):**
- **Przygotowanie serwera (instalacja OS, aktualizacje):** 2-4 godziny
- **Instalacja IIS, Python, Node.js, wkhtmltopdf:** 1-2 godziny
- **Konfiguracja SQL Server (użytkownik, uprawnienia):** 1 godzina
- **Konfiguracja sieciowa (firewall, routing):** 1 godzina
- **Testy połączeń i weryfikacja:** 1 godzina
- **ŁĄCZNIE: 6-9 godzin pracy**

**WARIANT B (Docker Engine):**
- **Przygotowanie serwera (instalacja OS, aktualizacje):** 2-4 godziny
- **Zakup i instalacja Mirantis Container Runtime:** 2-3 godziny
- **Instalacja docker-compose:** 0.5 godziny
- **Konfiguracja SQL Server (użytkownik, uprawnienia):** 1 godzina
- **Konfiguracja sieciowa (firewall, routing):** 1 godzina
- **Testy połączeń i weryfikacja:** 1 godzina
- **ŁĄCZNIE: 7.5-10.5 godzin pracy + czas na zakup licencji**

### Kontakt

**Osoba odpowiedzialna za wdrożenie aplikacji:**
- Imię i nazwisko: _________________________
- Email: _________________________
- Telefon: _________________________

**Preferowany termin wdrożenia:**
- Data: _________________________
- Godzina: _________________________

---

## 11. CHECKLIST - PODSUMOWANIE

Przed przekazaniem środowiska do wdrożenia, upewnić się że:

### Serwer
- [ ] Windows Server 2019 zainstalowany i zaktualizowany
- [ ] Wybrany wariant wdrożenia: [ ] WARIANT A (IIS) / [ ] WARIANT B (Docker)
- [ ] **WARIANT A:** IIS, Python 3.11, Node.js 18.x, wkhtmltopdf zainstalowane
- [ ] **WARIANT B:** Mirantis Container Runtime i docker-compose zainstalowane
- [ ] Katalogi aplikacji utworzone (`C:\InspectionApp`)
- [ ] Dostęp RDP skonfigurowany

### Baza Danych
- [ ] Użytkownik SQL utworzony
- [ ] Uprawnienia nadane (skrypt SQL wykonany)
- [ ] Connection string przygotowany
- [ ] Test połączenia przeprowadzony pomyślnie

### Sieć
- [ ] Firewall skonfigurowany (porty 80, 443, 1433, 8000)
- [ ] Routing między serwerem aplikacyjnym a SQL Server działa
- [ ] DNS (jeśli używany) skonfigurowany
- [ ] URL aplikacji ustalony

### Bezpieczeństwo
- [ ] Silne hasła ustawione
- [ ] Windows Defender aktywny
- [ ] Dostęp RDP zabezpieczony
- [ ] Backup bazy danych skonfigurowany

### Dokumentacja
- [ ] Wszystkie parametry połączeń zapisane
- [ ] Dane dostępowe przygotowane do przekazania
- [ ] Kontakt z osobą wdrażającą nawiązany

---

**Podpis osoby przygotowującej środowisko:**

Imię i nazwisko: _________________________

Data: _________________________

Podpis: _________________________

---

**ŚRODOWISKO GOTOWE DO WDROŻENIA: [ ] TAK / [ ] NIE**

W przypadku problemów lub pytań, proszę o kontakt przed rozpoczęciem wdrożenia.
