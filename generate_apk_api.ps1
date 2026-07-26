[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
[Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$apiUrl = "https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage"
$bodyObj = @{
    manifestUrl = "https://mauriciano47-pixel.github.io/Speaker_remote/manifest.json"
    appUrl = "https://mauriciano47-pixel.github.io/Speaker_remote/"
    appName = "Speaker Remote Pro"
    packageName = "com.speakerremote.app"
    packageId = "com.speakerremote.app"
    version = "1.2.0"
    versionCode = 120
    themeColor = "#0D0D12"
    navColor = "#0D0D12"
    backgroundColor = "#0D0D12"
    display = "standalone"
    iconUrl = "https://mauriciano47-pixel.github.io/Speaker_remote/icon-512.png"
    maskableIconUrl = "https://mauriciano47-pixel.github.io/Speaker_remote/icon-512.png"
    signing = @{
        mode = "none"
    }
}
$bodyJson = $bodyObj | ConvertTo-Json -Depth 5

Write-Host "Sending request to PWABuilder Cloud APK Generator..."
try {
    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add("Content-Type", "application/json")
    $wc.Headers.Add("User-Agent", "Mozilla/5.0")
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
    $responseBytes = $wc.UploadData($apiUrl, "POST", $bytes)
    [System.IO.File]::WriteAllBytes("C:\Users\mauro\Speaker_remote\apk_package.zip", $responseBytes)
    Write-Host "Response received! APK package size:" (Get-Item "C:\Users\mauro\Speaker_remote\apk_package.zip").Length "bytes"
} catch {
    Write-Host "API Error:" $_.Exception.Message
    if ($_.Exception.InnerException) {
        Write-Host "Inner:" $_.Exception.InnerException.Message
    }
}
