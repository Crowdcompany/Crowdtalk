/**
 * Proxy Manager - Kommunikation mit GLM 4.7 Proxy
 * Anthropic API Format (basierend auf Crowdbot)
 */

export class ProxyManager {
    constructor(proxyUrl = "http://localhost:8001/api/chat") {
        this.proxyUrl = proxyUrl;
    }

    async sendToGLM(transcript, conversationHistory = []) {
        try {
            // Baue Messages Array im Anthropic Format
            const messages = [];

            // Füge Konversationshistorie hinzu
            for (const msg of conversationHistory) {
                if (msg.role === "user" || msg.role === "assistant") {
                    messages.push({
                        role: msg.role,
                        content: msg.content
                    });
                }
            }

            // Füge aktuelle Nachricht hinzu
            messages.push({
                role: "user",
                content: transcript
            });

            const payload = {
                model: "glm-4.7",
                max_tokens: 500,
                system: this._getSystemPrompt(),
                messages: messages
            };

            const headers = {
                "Content-Type": "application/json",
                "x-api-key": "dummy-key"
            };

            const response = await fetch(this.proxyUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Proxy Error: ${response.status}`);
            }

            const data = await response.json();

            // Anthropic API Format: content ist ein Array
            if (data.content && data.content.length > 0) {
                return data.content[0].text;
            } else {
                console.error("Keine content in der Antwort:", data);
                return null;
            }

        } catch (error) {
            console.error("Proxy Kommunikation fehlgeschlagen:", error);
            throw error;
        }
    }

    _getSystemPrompt() {
        return `Du bist ein hilfreicher deutscher Sprachassistent.

Deine Eigenschaften:
- Sei präzise und hilfreich in deinen Antworten
- Bleibe freundlich und respektvoll
- Wenn du etwas nicht weißt, sag es ehrlich
- Antworte auf Deutsch
- Vermeide Wiederholungen
- Strukturiere deine Antworten klar und verständlich

WICHTIG für deine Antworten:
- Schreibe immer in ganzen Sätzen und fließendem Text
- Nutze niemals Markdown-Formatierung (keine Sternchen *, keine Unterstriche _, keine Backticks \`)
- Vermeide Sonderzeichen wie =, +, # die von Text-to-Speech Systemen falsch vorgelesen werden
- Schreibe Zahlen als Worte wenn möglich für bessere Aussprache
- Deine Antworten müssen für Text-to-Speech optimiert sein`;
    }

    removeMarkdown(text) {
        if (!text) return "";

        // Entferne Markdown-Formatierung für TTS
        return text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/__/g, '')
            .replace(/_/g, '')
            .replace(/`/g, '')
            .replace(/```/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/=/g, ', ')
            .replace(/\+/g, ' und ')
            .replace(/\|/g, ', ');
    }
}
