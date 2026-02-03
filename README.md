# Sprachassistent - Kostengünstiger KI-Voice-Assistant

Kostengünstiger Sprachassistent (< 2 Cent/Minute) mit automatischer Spracherkennung, Barge-In-Funktionalität und Proxy-basierter KI-Anbindung.

## Schnellstart

```bash
# Terminal 1: Proxy-Server starten (CORS-Proxy für GLM 4.7)
./start_proxy.sh

# Terminal 2: HTTP-Server starten
./start_server.sh

# Browser öffnen: http://localhost:8000
```

## Server steuern

### Proxy-Server (Port 8001)
```bash
# Starten
./start_proxy.sh

# Stoppen
kill $(cat logs/proxy.pid)

# Status
ps aux | grep proxy_server
```

### HTTP-Server (Port 8000)
```bash
# Starten
./start_server.sh

# Stoppen
kill $(cat logs/server.pid)

# Status
ps aux | grep "python3 -m http.server"
```

Beide Server müssen gleichzeitig laufen!

## Änderungsprotokoll (Changelog)

### Version 1.0.2 - 2026-02-03

**Status:** CORS-Problem gelöst

**Erstellt von:** Raimund

**Änderungen:**
- CORS-Problem identifiziert und gelöst
- Lokaler Proxy-Server implementiert (proxy_server.py, Port 8001)
- Proxy Manager angepasst (localhost:8001/api/chat)
- Proxy-Server getestet und funktioniert (GLM 4.7 Antwort erhalten)
- Start-Skripte für beide Server erstellt

**Funktionen:**
- [x] VAD-basierte Spracherkennung
- [x] Web Speech API Transkription
- [x] GLM 4.7 Proxy Anbindung (Anthropic Format + CORS-Proxy)
- [x] Text-Ausgabe als Popup
- [x] Konversationshistorie (letzte 10 Nachrichten)
- [x] Debug-Panel für Fehleranalyse
- [x] Server-Logging nach logs/

**Technologie-Stack:**
- Frontend: JavaScript (Web Speech API, VAD)
- VAD-Library: @ricky0123/vad mit Silero VAD Model
- Backend: Python (CORS-Proxy, HTTP-Server)
- GLM 4.7 Proxy: https://glmproxy.ccpn.cc/v1/messages

**Architektur-Entscheidungen:**
- Lokaler CORS-Proxy notwendig für Browser-Anfragen
- Zwei Server: HTTP-Server (8000) + Proxy-Server (8001)
- Frontend muss lokal UND auf AWS S3 ohne Backend-Server funktionieren
- CDN mit lokalem Fallback für VAD-Modelle
- Keine API-Keys im Frontend

**Offene Punkte:**
- [ ] Browser-Testing (mit funktionierendem Proxy)
- [ ] Phase 2: TTS-Ausgabe mit Barge-In
- [ ] Phase 3: Such-Proxy und JINA-Proxy Integration
- [ ] Phase 4: Docker-Deployment für Coolify

**Nächste Schritte:**
- [x] CORS-Problem gelöst
- [x] Proxy-Server getestet
- [ ] Browser-Testing mit Mikrofon
- [ ] Phase 2 Planung

---

### Version 1.0.1 - 2026-02-03

**Status:** Phase 1 MVP Implementiert

**Änderungen:**
- Proxy-Endpoints analysiert (GLM, Perplexity, JINA aus Crowdbot)
- Projektstruktur erstellt (index.html, js/, css/, assets/)
- VAD Manager implementiert (@ricky0123/vad)
- Speech Recognition Manager implementiert (Web Speech API)
- Proxy Manager implementiert (GLM 4.7 mit Anthropic API Format)
- UI Manager implementiert
- Hauptanwendung (app.js) mit Konversationshistorie
- HTTP-Server mit Logging gestartet (Port 8000, PID 116095)

---

### Version 1.0.0 - 2026-02-03

**Status:** Initial-Planung

**Änderungen:**
- Projektinitialisierung und Anforderungsanalyse
- README.md als versionierte Log-Datei erstellt (v1.0.0)
- CLAUDE.md mit Projektrichtlinien erstellt
- Anforderungsdokumentation in .plan erstellt

---

## Projektziele

- **Kosten:** < 2 Cent pro Minute (vs. 5+ Cent bei 11Labs/Vapi)
- **Barge-In:** User kann während AI-Ausgabe sprechen wie bei normales Gespräch
- **Cross-Platform:** Lokal (Debian) UND gehostet (Docker/Coolify) UND mobil
- **Einfach:** Keine 10 verschiedener Dienste, maximal ein Anbieter

## Technologie-Stack

### Frontend
- JavaScript mit Web Speech API (30-Sekunden-Limit wird durch VAD umgangen)
- @ricky0123/vad für Voice Activity Detection (Silero VAD Model)
- Einfache HTML/CSS (Stabilität > Design)

### Backend (lokal)
- Python CORS-Proxy für GLM 4.7 Anfragen
- Python HTTP-Server für statische Files

### API-Proxys
- **GLM 4.7 Proxy:** Haupt-KI für Chat (https://glmproxy.ccpn.cc/v1/messages)
- **JINA Proxy:** Tiefgehende Recherchen (https://jinaproxy.ccpn.cc/v1/chat/completions)
- **Such-Proxy:** Internetsuchen (https://ppproxy.ccpn.cc/chat/completions)

Alle Proxys haben serverseitige API-Keys - keine Keys im Frontend!

## Bekannte Probleme und Lösungen

| Problem | Lösung |
|---------|---------|
| Whisper fällt im Ruhezustand aus (Debian) | Web Speech API bevorzugen |
| Python Audio-Bibliotheken (pydub/pyaudio) Probleme | Browser-basierte Lösung mit VAD |
| Web Speech API 30-Sekunden-Limit | VAD überwacht kontinuierlich, Web Speech API nur für Transkription |
| Barge-In während AI-Ausgabe | VAD erkennt Spracheingabe, stoppt TTS sofort |
| CORS verhindert Browser-Anfragen an GLM Proxy | Lokaler Python Proxy-Server mit CORS-Headern |

## Entwicklungsphase

### Phase 1: MVP (abgeschlossen)
- [x] Planung und Dokumentation
- [x] Architektur-Dokumentation (ARCHITEKTUR.md)
- [x] Implementierungsplan (IMPLEMENTIERUNG.md)
- [x] Einfache HTML-Seite mit VAD
- [x] Web Speech API Integration
- [x] GLM 4.7 Proxy anbinden (Anthropic Format)
- [x] CORS-Proxy implementiert
- [x] Text-Ausgabe als Popup
- [x] HTTP-Server mit Logging
- [ ] Browser-Testing

### Phase 2: TTS mit Barge-In
- [ ] TTS-Ausgabe implementieren
- [ ] Barge-In mit VAD
- [ ] Unterbrechung während AI-Ausgabe

### Phase 3: Such-Funktionen
- [ ] Such-Proxy integrieren
- [ ] JINA-Proxy für tiefe Recherchen

### Phase 4: Deployment
- [ ] Docker-Container erstellen
- [ ] Coolify-Deployment
- [ ] Mobile Optimierung

## Entwicklungsumgebung

- **OS:** Debian Linux
- **Python:** python3 (nicht python)
- **Bash Timeout:** 60000ms
- **Git Autor:** raimund.bauer@crowdcompany-ug.com (Crowdcompany GitHub-Konto)

## Wichtige Hinweise

### TTS-Kompatibilität
- Kein Markdown in Bot-Antworten (**fett**, *kursiv*, `code`)
- Deutsche Umlaute korrekt schreiben (ö, ä, ü, ß)
- Post-Processing für alle LLM-Antworten vor TTS-Ausgabe

### Git-Sicherheit
- Niemals .env oder API-Keys committen
- Immer `git status` und `git diff` vor Push prüfen
- Commit-Format: "feat/scope: kurze Beschreibung"

## Lizenz

(C) 2026 Crowdcompany UG - Raimund Bauer
