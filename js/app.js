/**
 * Sprachassistent - Hauptanwendung
 * Version 1.0.3
 */

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
        this.proxy = new ProxyManager();
        this.isProcessing = false;
        this.conversationHistory = [];
    }

    async init() {
        try {
            this.ui.updateStatus('Initialisiere VAD...');
            this.ui.showDebug('Starte Initialisierung...');
            console.log('App wird initialisiert...');

            // Prüfe ob VAD Library geladen ist
            if (typeof vad === 'undefined') {
                throw new Error('VAD Library nicht geladen. Bitte Seite neu laden.');
            }
            console.log('VAD Library ist geladen:', vad);

            const vadInitialized = await this.vad.init();
            if (!vadInitialized) {
                this.ui.updateStatus('VAD Initialisierung fehlgeschlagen', 'error');
                this.ui.showError('VAD konnte nicht initialisiert werden');
                this.ui.showDebug('VAD Init fehlgeschlagen');
                return;
            }

            this.ui.showDebug('VAD initialisiert');
            console.log('VAD initialisiert');

            const speechInitialized = this.speech.init();
            if (!speechInitialized) {
                this.ui.updateStatus('Web Speech API nicht unterstützt', 'error');
                this.ui.showError('Dein Browser unterstützt die Web Speech API nicht');
                this.ui.showDebug('Web Speech API nicht verfügbar');
                return;
            }

            this.ui.showDebug('Web Speech API initialisiert');
            console.log('Web Speech API initialisiert');

            this.ui.updateStatus('Bereit. Mikrofon aktivieren um zu starten.');
            this.ui.setStartButtonEnabled(true);

            document.getElementById('start-btn').addEventListener('click', () => {
                console.log('Mikrofon Button geklickt');
                this.startListening();
            });

            this.ui.showDebug('Bereit für Eingaben. Version: 1.0.3');
            console.log('App initialisierung abgeschlossen');

        } catch (error) {
            console.error('Fehler bei Initialisierung:', error);
            this.ui.updateStatus('Fehler bei Initialisierung', 'error');
            this.ui.showError(error.message);
            this.ui.showDebug(`Init Error: ${error.message}`);
        }
    }

    startListening() {
        try {
            console.log('Starte VAD...');
            this.vad.start();
            this.ui.updateStatus('Höre zu... Sprich jetzt.', 'success');
            this.ui.setStartButtonEnabled(false);
            this.ui.showDebug('VAD gestartet - Mikrofon aktiv');
        } catch (error) {
            console.error('Fehler beim Starten:', error);
            this.ui.showError(`Fehler: ${error.message}`);
            this.ui.showDebug(`Start Error: ${error.message}`);
        }
    }

    handleSpeechStart() {
        this.ui.showDebug('Sprache erkannt');
        console.log('Sprache erkannt, starte Transkription...');
        this.speech.start();
    }

    handleSpeechEnd() {
        this.ui.showDebug('Sprache beendet');
        console.log('Sprache beendet');
    }

    async handleTranscript(transcript) {
        if (this.isProcessing) {
            this.ui.showDebug('Transkription ignoriert (bereits beschäftigt)');
            return;
        }

        this.isProcessing = true;
        this.ui.showTranscript(transcript);
        this.ui.updateStatus('Verarbeite...', 'info');
        this.ui.showDebug(`Transkript: "${transcript}"`);

        try {
            const response = await this.proxy.sendToGLM(transcript, this.conversationHistory);
            const cleanResponse = this.proxy.removeMarkdown(response);

            this.ui.showResponse(cleanResponse);
            this.ui.updateStatus('Bereit für nächste Eingabe.', 'success');
            this.ui.showDebug(`Antwort erhalten: ${cleanResponse.substring(0, 50)}...`);

            // Zum Konversationsverlauf hinzufügen
            this.conversationHistory.push({
                role: 'user',
                content: transcript
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: cleanResponse
            });

            // Limitiere Historie auf letzte 10 Nachrichten
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

        } catch (error) {
            this.ui.showError(error.message);
            this.ui.updateStatus('Fehler aufgetreten.', 'error');
            this.ui.showDebug(`Fehler: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    handleSpeechError(error) {
        this.ui.showError(`Speech Error: ${error}`);
        this.ui.showDebug(`Speech Error: ${error}`);
        this.isProcessing = false;
    }
}

// App starten
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM geladen, starte App...');
    const app = new App();
    await app.init();
});
