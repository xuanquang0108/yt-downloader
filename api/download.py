from http.server import BaseHTTPRequestHandler
import subprocess
import sys
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        url = params.get('url', [None])[0]
        quality = params.get('quality', ['192'])[0]

        if not url:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error": "URL is required"}')
            return

        try:
            cmd = [
                sys.executable, '-m', 'yt_dlp',
                '-x', '--audio-format', 'mp3',
                '--audio-quality', f'{quality}K',
                '--no-playlist', '--no-warnings',
                '-o', '-',
                '--', url
            ]

            self.send_response(200)
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Content-Disposition', 'attachment; filename="nhac.mp3"')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            process = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )

            for chunk in iter(lambda: process.stdout.read(8192), b''):
                self.wfile.write(chunk)

            process.wait()

        except Exception as e:
            if not self.headers.get('Content-Type'):
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, format, *args):
        pass
