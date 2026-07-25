[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$jdkUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.11+10/OpenJDK21U-jdk_x64_windows_hotspot_21.0.11_10.msi"
$jdkMsi = "C:\Users\mauro\jdk21.msi"

Write-Host "Downloading OpenJDK 21 MSI..."
if (Test-Path $jdkMsi) { Remove-Item $jdkMsi -Force }
$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0")
$wc.DownloadFile($jdkUrl, $jdkMsi)

$file = Get-Item $jdkMsi
Write-Host "JDK 21 MSI downloaded size: " $file.Length

if ($file.Length -gt 10000000) {
    Write-Host "Installing OpenJDK 21..."
    Start-Process msiexec.exe -ArgumentList "/i $jdkMsi /qn" -Wait
    Write-Host "JDK 21 installed successfully!"
}

# Configure Kotlin PATH in Environment
$oldPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
if ($oldPath -notlike "*C:\Users\mauro\kotlin\kotlinc\bin*") {
    [Environment]::SetEnvironmentVariable("PATH", "$oldPath;C:\Users\mauro\kotlin\kotlinc\bin", [EnvironmentVariableTarget]::User)
    Write-Host "Added Kotlin to User PATH"
}
