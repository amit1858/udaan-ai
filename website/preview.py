"""Loopback-only Pages-prefix preview, including narrow responsive frames."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
from urllib.parse import parse_qs, urlsplit

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map, ".webp": "image/webp",
        ".svg": "image/svg+xml", ".mp4": "video/mp4",
        ".pdf": "application/pdf", ".vtt": "text/vtt", ".srt": "application/x-subrip",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def send_head(self):
        self.range_remaining = None
        requested = self.headers.get("Range")
        path = Path(self.translate_path(self.path))
        if not requested or path.suffix != ".mp4" or not path.is_file():
            return super().send_head()
        match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested)
        size = path.stat().st_size
        if not match or not any(match.groups()) or not size:
            self.send_error(416, "Unsupported byte range")
            return None
        first, last = match.groups()
        start = int(first) if first else max(0, size - int(last))
        end = min(int(last), size - 1) if first and last else size - 1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None
        stream = path.open("rb")
        stream.seek(start)
        self.range_remaining = end - start + 1
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(self.range_remaining))
        self.end_headers()
        return stream

    def copyfile(self, source, output):
        if self.range_remaining is None:
            return super().copyfile(source, output)
        while self.range_remaining:
            data = source.read(min(65536, self.range_remaining))
            if not data:
                break
            output.write(data)
            self.range_remaining -= len(data)

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path in ("/mobile", "/desktop"):
            width = parse_qs(url.query).get("width", ["1280" if url.path == "/desktop" else "390"])[0]
            if width not in ("360", "390", "1280"):
                self.send_error(400, "Supported widths: 360, 390 or 1280")
                return
            html = f"""<!doctype html><html lang="en"><meta charset="utf-8">
            <title>Udaan responsive preview — {width}px</title>
            <link rel="stylesheet" href="/udaan-ai/styles.css">
            <style>body{{margin:24px;font-size:14px}}
            iframe{{display:block;border:1px solid var(--cp-border);margin:24px auto;border-radius:16px;transform-origin:top left}}</style>
            <p>{width}px responsive layout preview — not physical-device verification</p>
            <iframe title="Udaan responsive showcase" src="/udaan-ai/" width="{width}" height="1000"></iframe>
            <script>const frame=document.querySelector('iframe');if({width}>window.innerWidth-48){{frame.style.transform='scale('+((window.innerWidth-48)/{width})+')';frame.style.marginLeft='0';}}</script></html>"""
            data = html.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if url.path == "/udaan-ai":
            self.send_response(302)
            self.send_header("Location", "/udaan-ai/")
            self.end_headers()
            return
        if not url.path.startswith("/udaan-ai/"):
            self.send_error(404)
            return
        self.path = url.path.removeprefix("/udaan-ai") + ("?" + url.query if url.query else "")
        super().do_GET()

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--directory", type=Path, default=ROOT)
    args = parser.parse_args()
    directory = args.directory.resolve()
    if not (directory / "index.html").is_file():
        raise SystemExit("Preview directory must contain the built static index.html.")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=str(directory)))
    print(f"Ready: http://127.0.0.1:{args.port}/udaan-ai/", flush=True)
    server.serve_forever()
