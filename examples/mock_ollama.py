#!/usr/bin/env python3
"""Fake Ollama server for testing the bridge's *real* Ollama code path.

Run it on port 11434, then start the bridge WITHOUT P2L_MOCK_LLM so the async
Ollama client talks to this instead of a real model. Replies echo the last
user message in Ollama's JSON shape (stream and non-stream supported).
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
import json


class Handler(BaseHTTPRequestHandler):
    def _reply(self, stream: bool):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        model = body.get("model", "?")
        user = ""
        for m in body.get("messages", []):
            if m.get("role") == "user":
                user = m.get("content", "")
        text = f"[mock-ollama:{model}] Tu as écrit : {user}"

        self.send_response(200)
        if stream:
            self.send_header("Content-Type", "application/x-ndjson")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {"message": {"role": "assistant", "content": text}, "done": True}
                ).encode()
            )
        else:
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {"message": {"role": "assistant", "content": text}, "done": True}
                ).encode()
            )

    def do_POST(self):
        if self.path.rstrip("/") in (":11434/api/chat", "/api/chat"):
            stream = "stream" in self.path or self.headers.get(
                "Content-Type", ""
            ).startswith("application/x-ndjson")
            self._reply(stream=False)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, *args):  # silence
        pass


if __name__ == "__main__":
    print("Mock Ollama on http://127.0.0.1:11434/api/chat")
    HTTPServer(("127.0.0.1", 11434), Handler).serve_forever()
