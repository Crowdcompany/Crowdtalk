/**
 * VAD Manager - Voice Activity Detection
 * Nutzt @ricky0123/vad mit Silero VAD Model
 */

// Dynamischer Import der VAD Library vom CDN
let vad = null;

async function loadVADLibrary() {
    try {
        // Importiere VAD als ES6 Module von CDN
        const vadModule = await import('https://cdn.jsdelivr.net/npm/@ricky0123/vad/dist/index.browser.js');
        vad = vadModule;
        console.log('VAD Library geladen:', vad);
        return true;
    } catch (error) {
        console.error('Fehler beim Laden der VAD Library:', error);
        // Versuche lokalen Fallback
        try {
            const vadModule = await import('/assets/local/vad.browser.js');
            vad = vadModule;
            console.log('VAD Library lokal geladen:', vad);
            return true;
        } catch (localError) {
            console.error('Fehler beim Laden der lokalen VAD Library:', localError);
            return false;
        }
    }
}

export class VADManager {
    constructor(options = {}) {
        this.vadInstance = null;
        this.onSpeechStart = options.onSpeechStart || (() => {});
        this.onSpeechEnd = options.onSpeechEnd || (() => {});
        this.isListening = false;
    }

    async init() {
        try {
            console.log('Lade VAD Library...');

            // Lade VAD Library falls noch nicht geladen
            if (!vad) {
                const loaded = await loadVADLibrary();
                if (!loaded) {
                    throw new Error('VAD Library konnte nicht geladen werden');
                }
            }

            console.log('Erstelle MicVAD Instanz...');

            // Erstelle MicVAD Instanz
            this.vadInstance = await vad.MicVAD.new({
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

            console.log('MicVAD Instanz erstellt:', this.vadInstance);
            return true;

        } catch (error) {
            console.error('VAD Initialisierung fehlgeschlagen:', error);
            return false;
        }
    }

    start() {
        if (this.vadInstance && !this.isListening) {
            console.log('Starte VAD...');
            this.vadInstance.start();
            this.isListening = true;
        } else {
            console.error('VAD kann nicht gestartet werden:', {
                hasInstance: !!this.vadInstance,
                isListening: this.isListening
            });
        }
    }

    pause() {
        if (this.vadInstance && this.isListening) {
            console.log('Pausiere VAD...');
            this.vadInstance.pause();
            this.isListening = false;
        }
    }

    destroy() {
        if (this.vadInstance) {
            console.log('Zerstöre VAD Instanz...');
            this.vadInstance.destroy();
            this.isListening = false;
        }
    }
}
