# Implementierungsplan Phase 1 (MVP)

## Zielsetzung

Minimal Viable Product (MVP) mit:
- VAD-basierte Spracherkennung
- Web Speech API für Transkription
- GLM 4.7 Proxy für KI-Antworten
- Text-Ausgabe als Popup

## Technologie-Stack (Phase 1)

- **HTML5:** Einfache Single-Page-Application
- **JavaScript (Vanilla):** Kein Framework, maximale Kompatibilität
- **@ricky0123/vad:** Voice Activity Detection
- **Web Speech API:** Transkription
- **GLM 4.7 Proxy:** KI-Chat

## Schritt-für-Schritt Implementierung

### Schritt 1: Projektstruktur erstellen

```bash
mkdir -p js css assets/local
touch index.html js/app.js js/vad.js js/speech.js js/proxy.js js/ui.js css/styles.css
```

### Schritt 2: Grundlegende HTML-Seite

**Datei:** index.html

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sprachassistent MVP</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div id="app">
        <h1>Sprachassistent</h1>
        <div id="status">Initialisiere...</div>
        <button id="start-btn">Mikrofon aktivieren</button>
        <div id="transcript"></div>
        <div id="response"></div>
    </div>

    <!-- ONNX Runtime Web mit lokalem Fallback -->
    <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js"
            onerror="this.src='/assets/local/ort.js'"></script>

    <!-- VAD Library mit lokalem Fallback -->
    <script src="https://cdn.jsdelivr.net/npm/@ricky0123/vad/dist/index.browser.js"
            onerror="this.src='/assets/local/vad.browser.js'"></script>

    <script type="module" src="js/app.js"></script>
</body>
</html>
```

### Schritt 3: VAD Integration

**Datei:** js/vad.js

```javascript
export class VADManager {
    constructor(options = {}) {
        this.vad = null;
        this.onSpeechStart = options.onSpeechStart || (() => {});
        this.onSpeechEnd = options.onSpeechEnd || (() => {});
        this.isListening = false;
    }

    async init() {
        try {
            this.vad = await vad.MicVAD.new({
                onSpeechStart: () => {
                    console.log('VAD: Sprache gestartet');
                    this.onSpeechStart();
                },
                onSpeechEnd: (audio) => {
                    console.log('VAD: Sprache beendet');
                    this.onSpeechEnd(audio);
                },
                positiveSpeechThreshold: 0.5,
                minSpeechFrames: 3,
                preSpeechPadFrames: 1
            });
            return true;
        } catch (error) {
            console.error('VAD Initialisierung fehlgeschlagen:', error);
            return false;
        }
    }

    start() {
        if (this.vad && !this.isListening) {
            this.vad.start();
            this.isListening = true;
        }
    }

    pause() {
        if (this.vad && this.isListening) {
            this.vad.pause();
            this.isListening = false;
        }
    }

    destroy() {
        if (this.vad) {
            this.vad.destroy();
            this.isListening = false;
        }
    }
}
```

### Schritt 4: Web Speech API Wrapper

**Datei:** js/speech.js

```javascript
export class SpeechRecognitionManager {
    constructor(options = {}) {
        this.recognition = null;
        this.onResult = options.onResult || (() => {});
        this.onError = options.onError || (() => {});
        this.isListening = false;
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Web Speech API nicht unterstützt');
            return false;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'de-DE';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.onResult(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech Recognition Error:', event.error);
            this.onError(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        return true;
    }

    start() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.isListening = true;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}
```

### Schritt 5: GLM 4.7 Proxy Kommunikation

**Datei:** js/proxy.js

```javascript
export class ProxyManager {
    constructor(proxyUrl) {
        this.proxyUrl = proxyUrl;
    }

    async sendToGLM(transcript) {
        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'glm-4.7',
                    messages: [
                        {
                            role: 'system',
                            content: 'Du bist ein hilfreicher deutscher Sprachassistent. Antworte kurz und prägnant. Verwende kein Markdown.'
                        },
                        {
                            role: 'user',
                            content: transcript
                        }
                    ],
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`Proxy Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Proxy Kommunikation fehlgeschlagen:', error);
            throw error;
        }
    }

    removeMarkdown(text) {
        // Entferne Markdown-Formatierung für TTS
        return text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/`/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    }
}
```

### Schritt 6: UI Manager

**Datei:** js/ui.js

```javascript
export class UIManager {
    constructor() {
        this.statusEl = document.getElementById('status');
        this.transcriptEl = document.getElementById('transcript');
        this.responseEl = document.getElementById('response');
        this.startBtn = document.getElementById('start-btn');
    }

    updateStatus(status, type = 'info') {
        this.statusEl.textContent = status;
        this.statusEl.className = `status ${type}`;
    }

    showTranscript(text) {
        this.transcriptEl.innerHTML = `<strong>Du:</strong> ${text}`;
    }

    showResponse(text) {
        this.responseEl.innerHTML = `<strong>Assistent:</strong> ${text}`;
    }

    showError(error) {
        this.responseEl.innerHTML = `<strong>Fehler:</strong> ${error}`;
    }

    setStartButtonEnabled(enabled) {
        this.startBtn.disabled = !enabled;
    }
}
```

### Schritt 7: Hauptanwendung (Koordinator)

**Datei:** js/app.js

```javascript
import { VADManager } from './vad.js';
import { SpeechRecognitionManager } from './speech.js';
import { ProxyManager } from './proxy.js';
import { UIManager } from './ui.js';

class App {
    constructor() {
        this.ui = new UIManager();
        this.vad = new VADManager({
            onSpeechStart: () => this.handleSpeechStart(),
            onSpeechEnd: () => this.handleSpeechEnd()
        });
        this.speech = new SpeechRecognitionManager({
            onResult: (transcript) => this.handleTranscript(transcript),
            onError: (error) => this.handleSpeechError(error)
        });
        this.proxy = new ProxyManager('https://dein-glm-proxy.com/v1/chat/completions');
        this.isProcessing = false;
    }

    async init() {
        this.ui.updateStatus('Initialisiere VAD...');

        const vadInitialized = await this.vad.init();
        if (!vadInitialized) {
            this.ui.updateStatus('VAD Initialisierung fehlgeschlagen', 'error');
            return;
        }

        const speechInitialized = this.speech.init();
        if (!speechInitialized) {
            this.ui.updateStatus('Web Speech API nicht unterstützt', 'error');
            return;
        }

        this.ui.updateStatus('Bereit. Mikrofon aktivieren um zu starten.');
        this.ui.setStartButtonEnabled(true);

        document.getElementById('start-btn').addEventListener('click', () => {
            this.vad.start();
            this.ui.updateStatus('Höre zu... Sprich jetzt.', 'success');
            this.ui.setStartButtonEnabled(false);
        });
    }

    handleSpeechStart() {
        console.log('Sprache erkannt, starte Transkription...');
        this.speech.start();
    }

    handleSpeechEnd() {
        console.log('Sprache beendet');
        // Warte auf Transkriptionsergebnis
    }

    async handleTranscript(transcript) {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.ui.showTranscript(transcript);
        this.ui.updateStatus('Verarbeite...', 'info');

        try {
            const response = await this.proxy.sendToGLM(transcript);
            const cleanResponse = this.proxy.removeMarkdown(response);
            this.ui.showResponse(cleanResponse);
            this.ui.updateStatus('Bereit für nächste Eingabe.', 'success');
        } catch (error) {
            this.ui.showError(error.message);
            this.ui.updateStatus('Fehler aufgetreten.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    handleSpeechError(error) {
        this.ui.showError(`Speech Error: ${error}`);
        this.isProcessing = false;
    }
}

// App starten
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});
```

### Schritt 8: Einfache Styles

**Datei:** css/styles.css

```css
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}

#app {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    color: #333;
    text-align: center;
}

#status {
    padding: 15px;
    margin: 20px 0;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
}

.status.info { background-color: #e3f2fd; color: #1976d2; }
.status.success { background-color: #e8f5e9; color: #388e3c; }
.status.error { background-color: #ffebee; color: #d32f2f; }

button {
    width: 100%;
    padding: 15px;
    font-size: 18px;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 20px 0;
}

button:hover:not(:disabled) {
    background-color: #1565c0;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

#transcript, #response {
    padding: 15px;
    margin: 10px 0;
    background-color: #f9f9f9;
    border-radius: 5px;
    min-height: 50px;
}
```

## Test-Checkliste (Phase 1)

- [ ] Mikrofon-Permission wird angefragt
- [ ] VAD erkennt Spracheingabe (Console Log)
- [ ] Web Speech API transkribiert korrekt
- [ ] Transcript wird im UI angezeigt
- [ ] Anfrage wird an GLM Proxy gesendet
- [ ] Antwort wird im UI angezeigt
- [ ] Keine Markdown-Formatierung in der Antwort
- [ ] Mehrere Anfragen hintereinander möglich

## Nächste Schritte (Phase 2)

Siehe README.md - Phase 2: TTS mit Barge-In

## Bekannte Limitierungen (Phase 1)

- Keine TTS-Ausgabe (nur Text)
- Kein Barge-In (noch keine TTS zum unterbrechen)
- Keine Such-Proxy Integration
- Kein Mobile-Optimierung
