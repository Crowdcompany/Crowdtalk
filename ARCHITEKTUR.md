# Architektur-Dokumentation

## Systemarchitektur

Das System ist als **serverless Frontend-Anwendung** konzipiert, die lokal UND gehostet (AWS S3) ohne Backend-Server funktionieren kann.

### Komponenten-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Browser)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │     VAD     │  │ Web Speech   │  │    UI        │       │
│  │ (Silero)    │  │    API       │  │ (Popup/TTS)  │       │
│  │             │  │              │  │              │       │
│  │ onSpeechStart│  │ Transcribe  │  │ Anzeige      │       │
│  │ onSpeechEnd │  │ Audio → Text │  │ Audio-Out    │       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                   │             │
│         └─────────────────┴───────────────────┘             │
│                         │                                   │
│                    Koordinator                               │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API-Proxys                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  GLM 4.7    │  │  JINA Proxy  │  │ Such-Proxy   │       │
│  │  Proxy      │  │  (Recherche) │  │ (Internet)   │       │
│  │             │  │              │  │              │       │
│  │ Chat/KI     │  │ Deep Search  │  │ Web Search   │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  API-Keys serverseitig hinterlegt (CORS-frei)               │
└─────────────────────────────────────────────────────────────┘
```

## Datenfluss

### 1. Benutzer spricht (Barge-In Szenario)

```
User spricht → VAD erkennt Spracheingabe
                ↓
                onSpeechStart Event
                ↓
                Falls TTS aktiv: TTS stoppen (Barge-In)
                ↓
                Web Speech API transkribiert
                ↓
                Text an GLM 4.7 Proxy senden
                ↓
                KI-Antwort empfangen
                ↓
                Markdown entfernen
                ↓
                Popup anzeigen UND TTS starten
                ↓
                VAD überwacht während TTS (weiter Barge-In möglich)
```

### 2. Initialisierung

```
Seite laden → ONNX Runtime Web laden (CDN + Fallback)
              ↓
              VAD Model laden (@ricky0123/vad)
              ↓
              MicVAD.new() mit Callbacks
              ↓
              myVAD.start() - kontinuierliche Überwachung
              ↓
              Bereit für Benutzer-Eingabe
```

## Technologie-Entscheidungen

### Warum @ricky0123/vad?

| Vorteil | Erklärung |
|---------|-----------|
| Browser-basiert | Keine Installation, keine nativen Abhängigkeiten |
| Cross-Platform | Chrome, Firefox, Safari, Edge |
| Silero VAD | Bewährtes Modell, das du bereits lokal nutzt |
| < 30ms Latenz | Schnell genug für Barge-In |
| Open Source | Keine Lizenzkosten |

### Warum CDN mit lokalem Fallback?

```javascript
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js"
        onerror="this.src='/local/ort.js'"></script>
```

- **CDN:** Einfach, funktioniert sofort mit Internet
- **Lokal:** Fallback wenn CDN nicht verfügbar, schneller nach erstem Laden
- **Beides:** Maximale Verfügbarkeit ohne Komplexität

### Warum nicht reine Web Speech API?

- **Problem:** 30-Sekunden-Limit
- **Problem:** Kein Barge-In während Ausgabe
- **Lösung:** VAD überwacht kontinuierlich, Web Speech API nur für Transkription

## Sicherheits-Aspekte

### API-Keys

- **NIEMALS** im Frontend-Code
- **NIEMALS** in GitHub-Repository
- **IMMER** serverseitig in Proxys hinterlegt
- **CORS-frei:** Proxys müssen CORS korrekt konfigurieren

### Datenschutz

- Audio-Verarbeitung läuft im Browser (Client-seitig)
- Nur transkribierter Text wird an Proxys gesendet
- Keine Audio-Aufzeichnung auf Server

## Performance-Überlegungen

### Latenz-Ziele

| Komponente | Ziel-Latenz |
|------------|-------------|
| VAD Speech Detection | < 30ms |
| Barge-In Reaktion | < 500ms |
| KI-Antwort | < 2s |
| TTS Start | < 500ms |

### Optimierungen

- **Web Workers:** VAD läuft im Hintergrund-Thread
- **Audio Worklet:** Niedrige Latenz für Audio-Verarbeitung
- **Streaming:** KI-Antworten gestreamt (wenn Proxy unterstützt)
- **Caching:** ONNX-Modelle im Browser-Cache

## Dateistruktur (geplant)

```
sprachassistent/
├── README.md                  # Versionierte Log-Datei
├── ARCHITEKTUR.md             # Dieses Dokument
├── CLAUDE.md                  # Richtlinien für Claude Code
├── .plan                      # Ursprüngliche Anforderungsbeschreibung
├── index.html                 # Hauptseite (Einstiegspunkt)
├── js/
│   ├── app.js                # Hauptanwendung
│   ├── vad.js                # VAD Integration
│   ├── speech.js             # Web Speech API Wrapper
│   ├── proxy.js              # API-Proxy Kommunikation
│   └── ui.js                 # UI (Popup, TTS)
├── css/
│   └── styles.css            # Einfache Styles
├── assets/
│   └── local/                # Lokale Fallback-Dateien (optional)
│       ├── ort.js            # ONNX Runtime (fallback)
│       └── vad.browser.js    # VAD Library (fallback)
└── docker/
    ├── Dockerfile            # Für Coolify Deployment
    └── nginx.conf            # nginx Konfiguration
```

## Deployment-Strategie

### Lokal (Entwicklung)

```bash
# Einfacher HTTP-Server
python3 -m http.server 8000
# Oder
npx serve
```

### Gehostet (Produktion)

**Option 1: AWS S3 + CloudFront**
- index.html und Assets nach S3 hochladen
- CloudFront für CDN und HTTPS
- Kein Server notwendig

**Option 2: Docker mit Coolify**
- nginx-Container mit statischen Files
- Coolify für einfaches Deployment
- Mobile Optimierung durch CDN

## Testing-Strategie

### Manuelle Tests

1. **VAD Funktionalität**
   - Mikrofon aktiviert sich bei Sprache
   - onSpeechStart/onSpeechEnd feuern korrekt

2. **Barge-In**
   - Während TTS-Ausgabe sprechen
   - TTS stoppt sofort (< 500ms)

3. **Cross-Platform**
   - Chrome, Firefox, Safari, Edge
   - Desktop und Mobil

4. **Offline-Fallback**
   - CDN nicht verfügbar → lokale Version nutzen

### Automatische Tests (später)

- Unit Tests für VAD-Integration
- E2E Tests mit Playwright
- Performance-Messung (Latenz)

## Nächste Schritte

Siehe README.md - Phase 1: MVP Implementierung
