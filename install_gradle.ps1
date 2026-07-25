[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$gradleUrl = "https://services.gradle.org/distributions/gradle-8.11.1-bin.zip"
$gradleZip = "C:\Users\mauro\gradle.zip"

Write-Host "Downloading Gradle 8.11.1..."
if (Test-Path $gradleZip) { Remove-Item $gradleZip -Force }
$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0")
$wc.DownloadFile($gradleUrl, $gradleZip)

$file = Get-Item $gradleZip
Write-Host "Gradle Zip downloaded size: " $file.Length

if ($file.Length -gt 10000000) {
    Write-Host "Extracting Gradle 8.11.1..."
    Expand-Archive -Path $gradleZip -DestinationPath "C:\Users\mauro\gradle_temp" -Force
    $subFolder = Get-ChildItem "C:\Users\mauro\gradle_temp" | Select-Object -First 1
    if (Test-Path "C:\Users\mauro\gradle") { Remove-Item "C:\Users\mauro\gradle" -Recurse -Force }
    Move-Item -Path $subFolder.FullName -Destination "C:\Users\mauro\gradle"
    Remove-Item "C:\Users\mauro\gradle_temp" -Recurse -Force
    Write-Host "Gradle successfully installed to C:\Users\mauro\gradle!"
}
