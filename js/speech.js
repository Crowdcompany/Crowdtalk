/**
 * Speech Recognition Manager - Web Speech API Wrapper
 */

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
