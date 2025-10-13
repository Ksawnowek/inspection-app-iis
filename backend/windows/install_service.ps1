\
param(
  [string]$ServiceName = "InspectionApi",
  [string]$PythonExe = "C:\\Python312\\python.exe",
  [string]$AppDir = "C:\\inetpub\\inspection-api\\backend",
  [int]$Port = 8001,
  [string]$NssmPath = "C:\\Program Files\\nssm\\nssm.exe"
)
$ErrorActionPreference = "Stop"
if (!(Test-Path $NssmPath)) { Write-Host "NSSM not found at $NssmPath. Install NSSM or adjust path."; exit 1 }
New-Item -ItemType Directory -Force -Path "$AppDir\\logs" | Out-Null
$Args = "-m uvicorn app.main:app --host 0.0.0.0 --port $Port"
& "$NssmPath" install $ServiceName $PythonExe $Args
& "$NssmPath" set $ServiceName AppDirectory $AppDir
& "$NssmPath" set $ServiceName Start SERVICE_AUTO_START
& "$NssmPath" set $ServiceName AppStdout "$AppDir\\logs\\stdout.log"
& "$NssmPath" set $ServiceName AppStderr "$AppDir\\logs\\stderr.log"
& "$NssmPath" start $ServiceName
