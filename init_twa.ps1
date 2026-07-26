[Environment]::SetEnvironmentVariable('NODE_TLS_REJECT_UNAUTHORIZED', '0')
[Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Android\Android Studio\jbr')

Write-Host "Initialising Bubblewrap project for Speaker Remote Pro..."
cmd.exe /c "npx -y @bubblewrap/cli init --manifest=https://mauriciano47-pixel.github.io/Speaker_remote/manifest.json --directory=c:\Users\mauro\Speaker_remote\twa"
