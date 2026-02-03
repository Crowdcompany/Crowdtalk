/**
 * VAD Manager - Voice Activity Detection
 * Nutzt @ricky0123/vad mit Silero VAD Model
 */

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
