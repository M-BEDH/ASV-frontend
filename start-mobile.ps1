# Detecte automatiquement l'IP WiFi active (exclut Docker et loopback)
$ip = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notmatch '^(172\.|10\.0\.|127\.)' -and $_.PrefixOrigin -eq 'Dhcp' } |
    Select-Object -First 1 -ExpandProperty IPAddress

Write-Host "IP detectee : $ip"
Write-Host ""
Write-Host "1 - Meme reseau WiFi (local)"
Write-Host "2 - Reseau different (tunnel ngrok)"
$choix = Read-Host "Ton choix"

if ($choix -eq "2") {
    Write-Host "Demarrage du tunnel ngrok pour l'API (port 8080)..."
    Start-Process powershell -ArgumentList "ngrok http 8080" -WindowStyle Normal
    
    Write-Host "Attente que le tunnel demarre..."
    Start-Sleep -Seconds 8

    # Recupère l'URL ngrok via l'API locale
    $tunnels = (Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels
    $apiUrl = $tunnels | Where-Object { $_.proto -eq "https" } |
        Select-Object -First 1 -ExpandProperty public_url

    Write-Host "URL API : $apiUrl"

    # Met à jour .env.local avec l'URL de l'API
    $envPath = ".\.env.local"
    $content = Get-Content $envPath
    $content = $content -replace 'EXPO_PUBLIC_API_URL=.*', "EXPO_PUBLIC_API_URL=$apiUrl"
    $content | Set-Content $envPath

    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
    npx expo start --tunnel
} else {
    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
    npx expo start
}
