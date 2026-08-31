from http.server import BaseHTTPRequestHandler
import json
import subprocess
import sys

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        url = params.get('url', [None])[0]

        if not url:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "URL is required"}).encode())
            return

        try:
            result = subprocess.run(
                [sys.executable, '-m', 'yt_dlp', '--dump-json', '--no-download', '--no-warnings', '--no-playlist', url],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode != 0:
                raise Exception(result.stderr or "yt-dlp failed")

            data = json.loads(result.stdout)
            duration = data.get('duration', 0)
            mins = duration // 60
            secs = duration % 60

            response = {
                "title": data.get('title', 'Unknown'),
                "thumbnail": data.get('thumbnail', None),
                "duration": f"{mins}:{secs:02d}",
                "author": data.get('uploader', data.get('channel', 'Unknown'))
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, format, *args):
        pass
