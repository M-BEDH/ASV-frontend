# détection IP automatique pour expo start

# =============================================================
# start-mobile.ps1
# Lance Expo Go avec la bonne IP détectée automatiquement
#
# Pourquoi ce script ?
# Expo a besoin de connaître l'IP du PC pour générer le QR code.
# Sans ça, il peut détecter une IP Docker (172.x) ou WSL (10.x) ou même localhost de la machine (127.x)
# qui ne sont pas accessibles depuis le téléphone.
#
# Utilisation : .\start-mobile.ps1
# =============================================================

# Récupère l'IP de la vraie interface réseau (WiFi ou USB tethering)
# Exclut :
#   172.x.x.x  → interfaces Docker
#   10.0.x.x   → interface WSL
#   127.x.x.x  → loopback (localhost)
# Garde uniquement les IPs attribuées par DHCP (box/routeur/téléphone)



# Si plusieurs IPs sont détectées, prend la première (généralement la WiFi)
$ip = Get-NetIPAddress -AddressFamily IPv4 |
# Exclut les IPs Docker, WSL et loopback, et garde celles attribuées par DHCP
    Where-Object { $_.IPAddress -notmatch '^(172\.|10\.0\.|127\.)' -and $_.PrefixOrigin -eq 'Dhcp' } |
    # Prend la première IP valide
    Select-Object -First 1 -ExpandProperty IPAddress
# Affiche l'IP détectée
Write-Host "IP détectée : $ip"

# Injecte l'IP dans la variable d'environnement qu'Expo utilise
# pour générer le QR code et l'URL du Metro Bundler
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip

# Lance Expo
npx expo start
