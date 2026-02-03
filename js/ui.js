/**
 * UI Manager - Benutzeroberfläche
 */

export class UIManager {
    constructor() {
        this.statusEl = document.getElementById('status');
        this.transcriptEl = document.getElementById('transcript');
        this.responseEl = document.getElementById('response');
        this.debugEl = document.getElementById('debug');
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

    showDebug(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.debugEl.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        this.debugEl.scrollTop = this.debugEl.scrollHeight;
    }

    setStartButtonEnabled(enabled) {
        this.startBtn.disabled = !enabled;
    }

    clearDebug() {
        this.debugEl.innerHTML = '';
    }
}
