/**
 * UI Manager - Benutzeroberfläche
 * Version 1.0.5 - Kompaktes Layout
 */

export class UIManager {
    constructor() {
        this.statusEl = document.getElementById('status');
        this.chatContainer = document.getElementById('chat-container');
        this.debugEl = document.getElementById('debug');
        this.startBtn = document.getElementById('start-btn');
        this.messageCount = 0;
    }

    updateStatus(status, type = 'info') {
        this.statusEl.textContent = status;
        this.statusEl.className = type;
    }

    showTranscript(text) {
        this.clearEmptyState();

        const messageEl = document.createElement('div');
        messageEl.className = 'message user-message';
        messageEl.innerHTML = `
            <div class="message-label">Du</div>
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;

        this.chatContainer.appendChild(messageEl);
        this.scrollToBottom();
        this.messageCount++;
    }

    showResponse(text) {
        this.clearEmptyState();

        const messageEl = document.createElement('div');
        messageEl.className = 'message assistant-message';
        messageEl.innerHTML = `
            <div class="message-label">Assistent</div>
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;

        this.chatContainer.appendChild(messageEl);
        this.scrollToBottom();
        this.messageCount++;
    }

    showError(error) {
        this.clearEmptyState();

        const messageEl = document.createElement('div');
        messageEl.className = 'message error-message';
        messageEl.innerHTML = `
            <div class="message-label">Fehler</div>
            <div class="message-content">${this.escapeHtml(error)}</div>
        `;

        this.chatContainer.appendChild(messageEl);
        this.scrollToBottom();
    }

    showDebug(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.debugEl.innerHTML += `<div>[${timestamp}] ${this.escapeHtml(message)}</div>`;
        this.debugEl.scrollTop = this.debugEl.scrollHeight;
    }

    setStartButtonEnabled(enabled) {
        this.startBtn.disabled = !enabled;
    }

    clearDebug() {
        this.debugEl.innerHTML = '';
    }

    clearChat() {
        this.chatContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎤</div>
                <div>Klicke auf Mikrofon aktivieren und starte eine Unterhaltung</div>
            </div>
        `;
        this.messageCount = 0;
    }

    clearEmptyState() {
        const emptyState = this.chatContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
