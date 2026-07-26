[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$sdkDir = "C:\Users\mauro\AppData\Local\Android\Sdk"
$zipFile = "C:\Users\mauro\cmdline-tools.zip"
$toolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

Write-Host "Downloading commandlinetools..."
$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0")
$wc.DownloadFile($toolsUrl, $zipFile)

Write-Host "Extracting..."
if (Test-Path "$sdkDir\cmdline-tools") { Remove-Item "$sdkDir\cmdline-tools" -Recurse -Force }
New-Item -ItemType Directory -Force -Path "$sdkDir\cmdline-tools\latest" | Out-Null
Expand-Archive -Path $zipFile -DestinationPath "C:\Users\mauro\temp_extract" -Force

Get-ChildItem "C:\Users\mauro\temp_extract\cmdline-tools" | Move-Item -Destination "$sdkDir\cmdline-tools\latest" -Force
Remove-Item "C:\Users\mauro\temp_extract" -Recurse -Force
Remove-Item $zipFile -Force -ErrorAction SilentlyContinue

Write-Host "Checking sdkmanager.bat..."
Test-Path "$sdkDir\cmdline-tools\latest\bin\sdkmanager.bat"
