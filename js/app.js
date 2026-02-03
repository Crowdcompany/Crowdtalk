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
        console.log('[1/10] App Konstruktor aufgerufen');
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
        console.log('[2/10] App Konstruktor abgeschlossen');
    }

    async init() {
        try {
            console.log('[3/10] Starte Initialisierung...');
            this.ui.updateStatus('Initialisiere VAD...');
            this.ui.showDebug('Starte Initialisierung...');

            // Prüfe ob ONNX Runtime geladen ist
            if (typeof ort === 'undefined') {
                throw new Error('ONNX Runtime nicht geladen');
            }
            console.log('[4/10] ONNX Runtime geladen:', ort);

            const vadInitialized = await this.vad.init();
            if (!vadInitialized) {
                console.error('[ERROR] VAD Initialisierung fehlgeschlagen');
                this.ui.updateStatus('VAD Initialisierung fehlgeschlagen', 'error');
                this.ui.showError('VAD konnte nicht initialisiert werden');
                this.ui.showDebug('VAD Init fehlgeschlagen');
                return;
            }
            console.log('[5/10] VAD initialisiert');

            const speechInitialized = this.speech.init();
            if (!speechInitialized) {
                console.error('[ERROR] Web Speech API nicht verfügbar');
                this.ui.updateStatus('Web Speech API nicht unterstützt', 'error');
                this.ui.showError('Dein Browser unterstützt die Web Speech API nicht');
                this.ui.showDebug('Web Speech API nicht verfügbar');
                return;
            }
            console.log('[6/10] Web Speech API initialisiert');

            this.ui.updateStatus('Bereit. Mikrofon aktivieren um zu starten.');
            this.ui.setStartButtonEnabled(true);

            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                console.log('[7/10] Event Listener wird hinzugefügt...');
                startBtn.addEventListener('click', () => {
                    console.log('[BUTTON] Mikrofon Button geklickt!');
                    this.startListening();
                });
                console.log('[8/10] Event Listener hinzugefügt');
            } else {
                console.error('[ERROR] Start Button nicht gefunden!');
            }

            this.ui.showDebug('Bereit für Eingaben. Version: 1.0.3');
            console.log('[9/10] App initialisierung abgeschlossen');

            // Prüfe ob VAD Library verfügbar ist
            if (typeof window.vad !== 'undefined') {
                console.log('[10/10] VAD Library global verfügbar:', Object.keys(window.vad));
            } else {
                console.error('[ERROR] VAD Library nicht global verfügbar!');
            }

        } catch (error) {
            console.error('[ERROR] Fehler bei Initialisierung:', error);
            console.error('[ERROR] Error Stack:', error.stack);
            this.ui.updateStatus('Fehler bei Initialisierung', 'error');
            this.ui.showError(error.message);
            this.ui.showDebug(`Init Error: ${error.message}`);
        }
    }

    startListening() {
        try {
            console.log('[START] startListening() aufgerufen');
            this.ui.showDebug('VAD wird gestartet...');
            this.vad.start();
            this.ui.updateStatus('Höre zu... Sprich jetzt.', 'success');
            this.ui.setStartButtonEnabled(false);
            this.ui.showDebug('VAD gestartet - Mikrofon aktiv');
            console.log('[START] VAD start() aufgerufen');
        } catch (error) {
            console.error('[ERROR] Fehler beim Starten:', error);
            this.ui.showError(`Fehler: ${error.message}`);
            this.ui.showDebug(`Start Error: ${error.message}`);
        }
    }

    handleSpeechStart() {
        console.log('[VAD] Sprache gestartet');
        this.ui.showDebug('Sprache erkannt');
        this.speech.start();
    }

    handleSpeechEnd() {
        console.log('[VAD] Sprache beendet');
        this.ui.showDebug('Sprache beendet');
    }

    async handleTranscript(transcript) {
        if (this.isProcessing) {
            console.log('[PROCESSING] Bereits beschäftigt, ignoriere Transkript');
            this.ui.showDebug('Transkription ignoriert (bereits beschäftigt)');
            return;
        }

        console.log('[TRANSCRIPT] Empfangen:', transcript);
        this.isProcessing = true;
        this.ui.showTranscript(transcript);
        this.ui.updateStatus('Verarbeite...', 'info');
        this.ui.showDebug(`Transkript: "${transcript}"`);

        try {
            const response = await this.proxy.sendToGLM(transcript, this.conversationHistory);
            const cleanResponse = this.proxy.removeMarkdown(response);

            console.log('[RESPONSE] Antwort erhalten:', cleanResponse.substring(0, 50) + '...');
            this.ui.showResponse(cleanResponse);
            this.ui.updateStatus('Bereit für nächste Eingabe.', 'success');
            this.ui.showDebug(`Antwort: ${cleanResponse.substring(0, 50)}...`);

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
            console.error('[ERROR] Fehler bei Transkript-Verarbeitung:', error);
            this.ui.showError(error.message);
            this.ui.updateStatus('Fehler aufgetreten.', 'error');
            this.ui.showDebug(`Fehler: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    handleSpeechError(error) {
        console.error('[ERROR] Speech Error:', error);
        this.ui.showError(`Speech Error: ${error}`);
        this.ui.showDebug(`Speech Error: ${error}`);
        this.isProcessing = false;
    }
}

// App starten
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[0/10] DOM geladen, starte App...');
    try {
        const app = new App();
        await app.init();
    } catch (error) {
        console.error('[CRITICAL] App konnte nicht gestartet werden:', error);
    }
});
