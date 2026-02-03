#!/usr/bin/env python3
"""
Lokaler Proxy-Server für Sprachassistent
Leitet CORS-freie Anfragen an GLM 4.7 Proxy weiter
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
from datetime import datetime

# Konfiguration
GLM_PROXY_URL = "https://glmproxy.ccpn.cc/v1/messages"
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
        """Handle POST-Anfragen an GLM Proxy"""
        if self.path == '/api/chat':
            self._handle_glm_request()
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
            # HTTP Fehler vom GLM Proxy
            error_msg = f"GLM Proxy Error: {e.code} - {e.reason}"
            print(f"[{timestamp}] {error_msg}")

            self.send_response(e.code)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            error_response = {
                "error": {
                    "code": str(e.code),
                    "message": error_msg
                }
            }
            self.wfile.write(json.dumps(error_response).encode())

        except urllib.error.URLError as e:
            # Verbindungsfehler
            error_msg = f"Connection Error: {e.reason}"
            print(f"[{timestamp}] {error_msg}")

            self.send_response(503)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            error_response = {
                "error": {
                    "code": "503",
                    "message": error_msg
                }
            }
            self.wfile.write(json.dumps(error_response).encode())

        except Exception as e:
            # Unerwarteter Fehler
            error_msg = f"Unexpected Error: {str(e)}"
            print(f"[{timestamp}] {error_msg}")

            self.send_response(500)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            error_response = {
                "error": {
                    "code": "500",
                    "message": error_msg
                }
            }
            self.wfile.write(json.dumps(error_response).encode())

    def log_message(self, format, *args):
        """Überschreibe log_message für custom Logging"""
        # Nur Errors loggen, normale Requests werden oben geloggt
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
    print(f"Endpoint: http://localhost:{PORT}/api/chat")
    print(f"=" * 60)
    print(f"\nDrücke STRG+C zum Stoppen\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird gestoppt...")
        httpd.shutdown()


if __name__ == '__main__':
    run_proxy_server()
