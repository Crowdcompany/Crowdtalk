# Sprachassistent - Kostengünstiger KI-Voice-Assistant

Kostengünstiger Sprachassistent (< 2 Cent/Minute) mit automatischer Spracherkennung, Barge-In-Funktionalität und Proxy-basierter KI-Anbindung.

## Änderungsprotokoll (Changelog)

### Version 1.0.1 - 2026-02-03

**Status:** Phase 1 MVP Implementiert

**Erstellt von:** Raimund

**Änderungen:**
- Proxy-Endpoints analysiert (GLM, Perplexity, JINA aus Crowdbot)
- Projektstruktur erstellt (index.html, js/, css/, assets/)
- VAD Manager implementiert (@ricky0123/vad)
- Speech Recognition Manager implementiert (Web Speech API)
- Proxy Manager implementiert (GLM 4.7 mit Anthropic API Format)
- UI Manager implementiert
- Hauptanwendung (app.js) mit Konversationshistorie
- HTTP-Server mit Logging gestartet (Port 8000, PID 116095)

**Funktionen:**
- [x] VAD-basierte Spracherkennung
- [x] Web Speech API Transkription
- [x] GLM 4.7 Proxy Anbindung (Anthropic Format)
- [x] Text-Ausgabe als Popup
- [x] Konversationshistorie (letzte 10 Nachrichten)
- [x] Debug-Panel für Fehleranalyse
- [x] Server-Logging nach logs/

**Technologie-Stack:**
- Frontend: JavaScript (Web Speech API, VAD)
- VAD-Library: @ricky0123/vad mit Silero VAD Model
- Backend-Optional: Python (für Docker-Hosting)
- Deployment: Docker mit Coolify

**Architektur-Entscheidungen:**
- Frontend muss lokal UND auf AWS S3 ohne Backend-Server funktionieren
- Drei Proxy-Server: GLM 4.7 (KI), JINA (Recherche), Such-Proxy
- CDN mit lokalem Fallback für VAD-Modelle
- Kein CORS, keine API-Keys im Frontend

**Offene Punkte:**
- [ ] Phase 1 Implementierung: MVP mit VAD und Web Speech API
- [ ] Phase 2: TTS-Ausgabe mit Barge-In
- [ ] Phase 3: Such-Proxy und JINA-Proxy Integration
- [ ] Phase 4: Docker-Deployment für Coolify

**Nächste Schritte:**
- [x] Architektur-Dokumentation erstellt (ARCHITEKTUR.md)
- [x] Erste HTML-Seite mit VAD und Web Speech API
- [x] GLM 4.7 Proxy angebinden (Anthropic API Format)
- [x] Text-Ausgabe als Popup implementiert
- [ ] Browser-Testing (Mikrofon-Permission, CORS)
- [ ] Phase 2: TTS-Ausgabe mit Barge-In

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

### Backend (optional)
- Python mit virtueller Umgebung
- Proxy-Server für KI und Suche
- Docker mit Coolify für Hosting

### API-Proxys
- **GLM 4.7 Proxy:** Haupt-KI für Chat
- **JINA Proxy:** Tiefgehende Recherchen
- **Such-Proxy:** Internetsuchen

Alle Proxys haben serverseitige API-Keys - keine Keys im Frontend!

## Bekannte Probleme und Lösungen

| Problem | Lösung |
|---------|---------|
| Whisper fällt im Ruhezustand aus (Debian) | Web Speech API bevorzugen |
| Python Audio-Bibliotheken (pydub/pyaudio) Probleme | Browser-basierte Lösung mit VAD |
| Web Speech API 30-Sekunden-Limit | VAD überwacht kontinuierlich, Web Speech API nur für Transkription |
| Barge-In während AI-Ausgabe | VAD erkennt Spracheingabe, stoppt TTS sofort |

## Entwicklungsphase

### Phase 1: MVP (abgeschlossen)
- [x] Planung und Dokumentation
- [x] Architektur-Dokumentation (ARCHITEKTUR.md)
- [x] Implementierungsplan (IMPLEMENTIERUNG.md)
- [x] Einfache HTML-Seite mit VAD
- [x] Web Speech API Integration
- [x] GLM 4.7 Proxy anbinden (Anthropic Format)
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
