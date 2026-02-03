#!/bin/bash
# Proxy-Server Start-Skript
# Startet lokalen CORS-Proxy für GLM 4.7

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/proxy_$(date +%Y%m%d_%H%M%S).log"
PID_FILE="$LOG_DIR/proxy.pid"

# Prüfe ob Server bereits läuft
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "Proxy-Server läuft bereits mit PID $OLD_PID"
        exit 1
    else
        echo "Alte PID-Datei gefunden, Server läuft nicht mehr. Entferne $PID_FILE"
        rm "$PID_FILE"
    fi
fi

# Starte Proxy-Server mit Logging
echo "Starte Proxy-Server auf Port 8001..."
echo "Log-Datei: $LOG_FILE"

nohup python3 proxy_server.py >> "$LOG_FILE" 2>&1 &
PROXY_PID=$!

# Speichre PID
echo $PROXY_PID > "$PID_FILE"

echo "Proxy-Server gestartet mit PID $PROXY_PID"
echo "Log-Datei: $LOG_FILE"
echo "Endpoint: http://localhost:8001/api/chat"
echo ""
echo "Um den Proxy-Server zu stoppen:"
echo "  kill $PROXY_PID"
echo "  oder: kill \$(cat $PID_FILE)"
