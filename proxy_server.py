#!/usr/bin/env python3
"""
Lokaler Proxy-Server für Sprachassistent
Leitet CORS-freie Anfragen an GLM 4.7, Perplexity und JINA Proxys weiter
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
from datetime import datetime

# Konfiguration
GLM_PROXY_URL = "https://glmproxy.ccpn.cc/v1/messages"
PERPLEXITY_PROXY_URL = "https://ppproxy.ccpn.cc/chat/completions"
JINA_PROXY_URL = "https://jinaproxy.ccpn.cc/v1/chat/completions"
PORT = 8001


class ProxyHandler(BaseHTTPRequestHandler):
    """Handler für Proxy-Anfragen"""

    def _set_cors_headers(self):
        """Setze CORS-Header für alle Anfragen"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        """Handle OPTIONS Preflight-Anfragen"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_POST(self):
        """Handle POST-Anfragen"""
        if self.path == '/api/chat':
            self._handle_glm_request()
        elif self.path == '/api/search/perplexity':
            self._handle_perplexity_request()
        elif self.path == '/api/search/jina':
            self._handle_jina_request()
        elif self.path == '/api/search':
            self._handle_intelligent_search()
        else:
            self.send_error(404, "Not Found")

    def _handle_glm_request(self):
        """Leite Anfrage an GLM Proxy weiter"""
        try:
            # Lese Request Body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            # Logge Anfrage
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] Anfrage an GLM Proxy")

            # Erstelle Request an GLM Proxy
            req = urllib.request.Request(
                GLM_PROXY_URL,
                data=post_data,
                headers={
                    'Content-Type': 'application/json',
                    'x-api-key': 'dummy-key'
                }
            )

            # Sende Request und bekomme Antwort
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read()

            # Sende Antwort an Client mit CORS-Headern
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response_data)

            # Logge Erfolg
            print(f"[{timestamp}] Antwort erhalten: {len(response_data)} Bytes")

        except urllib.error.HTTPError as e:
            self._send_error_response(e.code, f"GLM Proxy Error: {e.code} - {e.reason}")
        except urllib.error.URLError as e:
            self._send_error_response(503, f"Connection Error: {e.reason}")
        except Exception as e:
            self._send_error_response(500, f"Unexpected Error: {str(e)}")

    def _handle_perplexity_request(self):
        """Leite Anfrage an Perplexity Proxy weiter (schnelle Suche)"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] Anfrage an Perplexity Proxy")

            # Erstelle Request an Perplexity Proxy
            req = urllib.request.Request(
                PERPLEXITY_PROXY_URL,
                data=post_data,
                headers={'Content-Type': 'application/json'}
            )

            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read()

            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response_data)

            print(f"[{timestamp}] Perplexity Antwort: {len(response_data)} Bytes")

        except urllib.error.HTTPError as e:
            self._send_error_response(e.code, f"Perplexity Error: {e.code} - {e.reason}")
        except urllib.error.URLError as e:
            self._send_error_response(503, f"Connection Error: {e.reason}")
        except Exception as e:
            self._send_error_response(500, f"Unexpected Error: {str(e)}")

    def _handle_jina_request(self):
        """Leite Anfrage an JINA Proxy weiter (Deep Research)"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] Anfrage an JINA Proxy")

            # Erstelle Request an JINA Proxy
            req = urllib.request.Request(
                JINA_PROXY_URL,
                data=post_data,
                headers={'Content-Type': 'application/json'}
            )

            with urllib.request.urlopen(req, timeout=120) as response:
                response_data = response.read()

            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response_data)

            print(f"[{timestamp}] JINA Antwort: {len(response_data)} Bytes")

        except urllib.error.HTTPError as e:
            self._send_error_response(e.code, f"JINA Error: {e.code} - {e.reason}")
        except urllib.error.URLError as e:
            self._send_error_response(503, f"Connection Error: {e.reason}")
        except Exception as e:
            self._send_error_response(500, f"Unexpected Error: {str(e)}")

    def _handle_intelligent_search(self):
        """
        Intelligente Suche: Wählt automatisch zwischen Perplexity und JINA
        basierend auf der Komplexität der Anfrage
        """
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))

            query = request_data.get('query', '')
            force_deep = request_data.get('force_deep', False)

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{timestamp}] Intelligente Suche: {query}")

            # Entscheide zwischen Perplexity und JINA
            use_jina = force_deep or self._needs_deep_research(query)

            if use_jina:
                print(f"[{timestamp}] Nutze JINA Deep Research")
                proxy_url = JINA_PROXY_URL
                # JINA benötigt spezielle Parameter
                request_data['model'] = 'jina-deepsearch-v1'
                request_data['budget_tokens'] = 8000
                request_data['max_returned_urls'] = 10
                request_data['reasoning_effort'] = 'high'
            else:
                print(f"[{timestamp}] Nutze Perplexity (schnell)")
                proxy_url = PERPLEXITY_PROXY_URL
                request_data['model'] = 'sonar'

            # Erstelle Request
            req = urllib.request.Request(
                proxy_url,
                data=json.dumps(request_data).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )

            with urllib.request.urlopen(req, timeout=120 if use_jina else 30) as response:
                response_data = response.read()

            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response_data)

            print(f"[{timestamp}] Such-Antwort: {len(response_data)} Bytes")

        except urllib.error.HTTPError as e:
            self._send_error_response(e.code, f"Search Error: {e.code} - {e.reason}")
        except urllib.error.URLError as e:
            self._send_error_response(503, f"Connection Error: {e.reason}")
        except Exception as e:
            self._send_error_response(500, f"Unexpected Error: {str(e)}")

    def _needs_deep_research(self, query: str) -> bool:
        """
        Entscheide ob Deep Research (JINA) oder schnelle Suche (Perplexity) benötigt wird.
        """
        deep_keywords = [
            'erkläre ausführlich', 'erkläre detailliert', 'analysiere',
            'vergleiche detailliert', 'geschichte von', 'hintergrund',
            'tiefgehend', 'umfassend', 'detailliert',
            'wie funktioniert', 'wissenschaftlich', 'technisch erklärt'
        ]

        query_lower = query.lower()
        return any(keyword in query_lower for keyword in deep_keywords)

    def _send_error_response(self, code, message):
        """Sende einheitliche Fehler-Antwort"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] ERROR: {message}")

        self.send_response(code)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        error_response = {
            "error": {
                "code": str(code),
                "message": message
            }
        }
        self.wfile.write(json.dumps(error_response).encode())

    def log_message(self, format, *args):
        """Überschreibe log_message für custom Logging"""
        if args[1] != '200':
            print(f"[ERROR] {args[0]} - {args[1]}")


def run_proxy_server():
    """Starte den Proxy-Server"""
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, ProxyHandler)

    print(f"=" * 60)
    print(f"Proxy-Server gestartet")
    print(f"=" * 60)
    print(f"Port: {PORT}")
    print(f"GLM Proxy: {GLM_PROXY_URL}")
    print(f"Perplexity: {PERPLEXITY_PROXY_URL}")
    print(f"JINA: {JINA_PROXY_URL}")
    print(f"=" * 60)
    print(f"Endpoints:")
    print(f"  - http://localhost:{PORT}/api/chat")
    print(f"  - http://localhost:{PORT}/api/search/perplexity")
    print(f"  - http://localhost:{PORT}/api/search/jina")
    print(f"  - http://localhost:{PORT}/api/search (intelligent)")
    print(f"=" * 60)
    print(f"\nDrücke STRG+C zum Stoppen\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird gestoppt...")
        httpd.shutdown()


if __name__ == '__main__':
    run_proxy_server()
