/**
 * Proxy Manager - Kommunikation mit GLM 4.7 und Such-Proxys
 * Anthropic API Format (basierend auf Crowdbot)
 */

export class ProxyManager {
    constructor(proxyUrl = "http://localhost:8001/api/chat") {
        this.proxyUrl = proxyUrl;
        this.searchUrl = "http://localhost:8001/api/search";
    }

    async sendToGLM(transcript, conversationHistory = []) {
        try {
            // Schritt 1: Intention analysieren
            const needsSearch = await this._analyzeIntention(transcript);

            let searchResults = null;
            if (needsSearch) {
                console.log("Intention: Suche benötigt");
                searchResults = await this._performSearch(transcript);
            } else {
                console.log("Intention: Keine Suche benötigt");
            }

            // Schritt 2: Anfrage an GLM mit oder ohne Suchergebnisse
            const messages = [];

            // Konversationshistorie
            for (const msg of conversationHistory) {
                if (msg.role === "user" || msg.role === "assistant") {
                    messages.push({
                        role: msg.role,
                        content: msg.content
                    });
                }
            }

            // Aktuelle Nachricht mit oder ohne Suchergebnisse
            let finalMessage = transcript;
            if (searchResults) {
                finalMessage = this._combineMessageWithSearch(transcript, searchResults);
            }

            messages.push({
                role: "user",
                content: finalMessage
            });

            const payload = {
                model: "glm-4.7",
                max_tokens: 500,
                system: this._getSystemPrompt(searchResults !== null),
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

            // Anthropic API Format
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

    async _analyzeIntention(userMessage) {
        """
        Analysiert ob eine Suche benötigt wird.
        Verwendet einfache Keyword-Erkennung (schneller als zusätzliche KI-Anfrage)
        */
        const searchKeywords = [
            'wer ist', 'was ist', 'wie', 'warum', 'wann', 'wo',
            'aktuell', 'neueste', 'heute', 'gerade', 'jetzt',
            'nachrichten', 'politik', 'wetter', 'sport',
            'suche', 'finde', 'information', 'erkläre',
            'werden', 'passiert', 'ereignis', 'statt'
        ];

        const messageLower = userMessage.toLowerCase();

        // Prüfe auf Such-Keywords
        for (const keyword of searchKeywords) {
            if (messageLower.includes(keyword)) {
                return true;
            }
        }

        // Prüfe auf Fragen (endet mit "?")
        if (messageLower.trim().endsWith('?')) {
            return true;
        }

        return false;
    }

    async _performSearch(query) {
        """Führt eine Suche durch (intelligente Wahl zwischen Perplexity und JINA)"""
        try {
            const payload = {
                query: query,
                messages: [
                    {
                        role: "user",
                        content: query
                    }
                ],
                max_tokens: 2000
            };

            const response = await fetch(this.searchUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error("Suche fehlgeschlagen:", response.status);
                return null;
            }

            const data = await response.json();

            // OpenAI-kompatibles Format (Perplexity/JINA)
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                console.error("Keine Suchergebnisse:", data);
                return null;
            }

        } catch (error) {
            console.error("Fehler bei der Suche:", error);
            return null;
        }
    }

    _combineMessageWithSearch(userMessage, searchResults) {
        """Kombiniert Benutzerfrage mit Suchergebnissen"""
        const currentDate = new Date().toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `Heute ist der ${currentDate}. Der Benutzer fragt: ${userMessage}

WICHTIG: Ich habe durch eine Internetsuche aktuelle Informationen erhalten. Diese Informationen sind FAKTEN und müssen EXAKT wiedergegeben werden:

${searchResults}

ANWEISUNG: Beantworte die Frage des Benutzers ausschließlich mit den Informationen aus den Suchergebnissen. Gib die Fakten WORTGETREU wieder. ERFINDE NICHTS.`;
    }

    _getSystemPrompt(withSearch = false) {
        const basePrompt = `Du bist ein hilfreicher deutscher Sprachassistent.

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

        if (withSearch) {
            return basePrompt + `

KRITISCH: Umgang mit Such-Ergebnissen:
- Wenn du Informationen aus Such-Ergebnissen erhältst, gib diese EXAKT und WORTGETREU wieder
- Erfinne NIEMALS Informationen oder Details, die nicht in den Suchergebnissen stehen
- Bei faktischen Daten: Nenne GENAU das, was in den Suchergebnissen steht
- Lieber weniger sagen als etwas Falsches erfinden`;
        }

        return basePrompt;
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
