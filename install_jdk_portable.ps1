[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$jdkZipUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.11+10/OpenJDK21U-jdk_x64_windows_hotspot_21.0.11_10.zip"
$jdkZip = "C:\Users\mauro\jdk21.zip"

Write-Host "Downloading OpenJDK 21 Portable Zip..."
if (Test-Path $jdkZip) { Remove-Item $jdkZip -Force }
$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0")
$wc.DownloadFile($jdkZipUrl, $jdkZip)

$file = Get-Item $jdkZip
Write-Host "JDK 21 Zip downloaded size: " $file.Length

if ($file.Length -gt 10000000) {
    Write-Host "Extracting OpenJDK 21..."
    Expand-Archive -Path $jdkZip -DestinationPath "C:\Users\mauro\jdk21_temp" -Force
    $subFolder = Get-ChildItem "C:\Users\mauro\jdk21_temp" | Select-Object -First 1
    if (Test-Path "C:\Users\mauro\jdk21") { Remove-Item "C:\Users\mauro\jdk21" -Recurse -Force }
    Move-Item -Path $subFolder.FullName -Destination "C:\Users\mauro\jdk21"
    Remove-Item "C:\Users\mauro\jdk21_temp" -Recurse -Force
    Write-Host "JDK 21 successfully installed to C:\Users\mauro\jdk21!"
}

# Update Environment Variables for PATH and JAVA_HOME
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Users\mauro\jdk21", [EnvironmentVariableTarget]::User)

$userPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
if ($userPath -notlike "*C:\Users\mauro\jdk21\bin*") {
    $userPath = "$userPath;C:\Users\mauro\jdk21\bin"
}
if ($userPath -notlike "*C:\Users\mauro\kotlin\kotlinc\bin*") {
    $userPath = "$userPath;C:\Users\mauro\kotlin\kotlinc\bin"
}
[Environment]::SetEnvironmentVariable("PATH", $userPath, [EnvironmentVariableTarget]::User)
Write-Host "Configured JAVA_HOME and PATH successfully!"
