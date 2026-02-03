#!/bin/bash
# Sprachassistent Server Start-Skript
# Startet HTTP-Server mit Logging

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/server_$(date +%Y%m%d_%H%M%S).log"
PID_FILE="$LOG_DIR/server.pid"

# Prüfe ob Server bereits läuft
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "Server läuft bereits mit PID $OLD_PID"
        echo "Um den Server zu stoppen: kill $OLD_PID"
        exit 1
    else
        echo "Alte PID-Datei gefunden, Server läuft nicht mehr. Entferne $PID_FILE"
        rm "$PID_FILE"
    fi
fi

# Starte Server mit Logging
echo "Starte HTTP-Server auf Port 8000..."
echo "Log-Datei: $LOG_FILE"

nohup python3 -m http.server 8000 >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Speichere PID
echo $SERVER_PID > "$PID_FILE"

echo "Server gestartet mit PID $SERVER_PID"
echo "Log-Datei: $LOG_FILE"
echo "URL: http://localhost:8000"
echo ""
echo "Um den Server zu stoppen:"
echo "  kill $SERVER_PID"
echo "  oder: kill \$(cat $PID_FILE)"
