/**
 * VAD Manager - Voice Activity Detection
 * Nutzt @ricky0123/vad mit Silero VAD Model
 */

export class VADManager {
    constructor(options = {}) {
        this.vadInstance = null;
        this.onSpeechStart = options.onSpeechStart || (() => {});
        this.onSpeechEnd = options.onSpeechEnd || (() => {});
        this.isListening = false;
    }

    async init() {
        try {
            console.log('Initialisiere VAD...');

            // Warte kurz bis das globale vad Objekt geladen ist
            let retries = 0;
            while (typeof window.vad === 'undefined' && retries < 50) {
                console.log(`Warte auf VAD Library... (${retries + 1}/50)`);
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            if (typeof window.vad === 'undefined') {
                throw new Error('VAD Library nicht geladen nach 5 Sekunden');
            }

            console.log('VAD Library gefunden:', window.vad);

            // Erstelle MicVAD Instanz
            this.vadInstance = await window.vad.MicVAD.new({
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
