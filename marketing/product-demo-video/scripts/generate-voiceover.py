"""Prepare Gnani REST requests by default; execute once only with reviewed gates."""

import argparse
from decimal import Decimal, InvalidOperation
import getpass
import hashlib
import http.client
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import ssl
import struct
import sys
import tempfile
import time
import urllib.error
import urllib.request
import warnings
import wave


_spec = importlib.util.spec_from_file_location(
    "offline_voiceover", Path(__file__).with_name("prepare-voiceover.py")
)
_offline = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_offline)
ENDPOINT = _offline.ENDPOINT
MAX_RESPONSE_BYTES = 8 * 1024 * 1024


class VoiceoverError(Exception):
    pass


class PrivateArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        self.exit(2, "Invalid arguments; see --help. Never supply credentials as arguments.\n")


class RejectRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        raise VoiceoverError("Provider redirect refused; credentials were not forwarded.")


def validate_approval(approval, payload, stage):
    if not isinstance(approval, dict):
        raise VoiceoverError("Approval must be a reviewed JSON object.")
    digest = hashlib.sha256(payload["text"].encode("utf-8")).hexdigest()
    for field, expected in (
        ("stage", stage), ("text_sha256", digest),
        ("model", payload["model"]), ("voice", payload["voice"]),
    ):
        if approval.get(field) != expected:
            raise VoiceoverError("Approval does not match this stage, text, model or voice.")
    for field in ("rights_confirmed", "voice_selection_approved", "billing_verified_and_bounded"):
        if approval.get(field) is not True:
            raise VoiceoverError("Rights, selected voice and bounded billing must be approved.")
    if stage == "full" and approval.get("sample_approved") is not True:
        raise VoiceoverError("Full narration requires approval of the generated sample.")
    if type(approval.get("max_requests")) is not int or approval["max_requests"] != 1:
        raise VoiceoverError("This invocation must authorize exactly one request.")
    cap = approval.get("max_cost")
    if not isinstance(cap, str):
        raise VoiceoverError("The monetary cap must be a decimal string.")
    try:
        amount = Decimal(cap)
    except InvalidOperation:
        raise VoiceoverError("The monetary cap must be finite and nonnegative.") from None
    if not amount.is_finite() or amount < 0:
        raise VoiceoverError("The monetary cap must be finite and nonnegative.")
    currency = approval.get("currency")
    reference = approval.get("approval_reference")
    if not isinstance(currency, str) or not re.fullmatch(r"[A-Z]{3}", currency):
        raise VoiceoverError("Approval must specify a three-letter currency.")
    if not isinstance(reference, str) or not reference.strip():
        raise VoiceoverError("Approval must include a nonsecret review reference.")
    return {
        "stage": stage, "text_sha256": digest, "model": payload["model"],
        "voice": payload["voice"], "max_cost": cap, "currency": currency,
        "approval_reference": reference,
    }


def read_private_key():
    if not sys.stdin.isatty() or not sys.stderr.isatty():
        raise VoiceoverError("Use a private interactive native console; redirected input is refused.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", getpass.GetPassWarning)
            key = getpass.getpass("Gnani API key (private console only): ", stream=sys.stderr)
    except (getpass.GetPassWarning, EOFError, KeyboardInterrupt):
        raise VoiceoverError("Non-echoing key entry failed; no fallback input is allowed.") from None
    if not key or any(ord(char) < 33 or ord(char) > 126 for char in key):
        raise VoiceoverError("Key must be a nonempty printable ASCII header value.")
    return key


def validate_wav(body, content_type, max_seconds):
    if content_type.split(";", 1)[0].strip().lower() != "audio/wav":
        raise VoiceoverError("Provider response is not the requested audio/wav.")
    if len(body) < 44 or len(body) > MAX_RESPONSE_BYTES:
        raise VoiceoverError("Provider audio is empty, malformed or too large.")
    if body[:4] != b"RIFF" or body[8:12] != b"WAVE":
        raise VoiceoverError("Provider response has no valid WAV signature.")
    if struct.unpack("<I", body[4:8])[0] + 8 != len(body):
        raise VoiceoverError("Provider WAV length is inconsistent or truncated.")
    try:
        with wave.open(io.BytesIO(body), "rb") as audio:
            if (audio.getnchannels(), audio.getsampwidth(), audio.getframerate(), audio.getcomptype()) != (
                1, 2, 48000, "NONE"
            ):
                raise VoiceoverError("Provider WAV must be mono 48kHz 16-bit PCM.")
            frames = audio.getnframes()
            if frames <= 0 or frames / 48000 > max_seconds:
                raise VoiceoverError("Provider audio duration is outside the approved stage limit.")
            if len(audio.readframes(frames + 1)) != frames * 2:
                raise VoiceoverError("Provider WAV contains incomplete audio frames.")
    except (wave.Error, EOFError, struct.error):
        raise VoiceoverError("Provider WAV could not be decoded.") from None
    return {"duration_seconds": frames / 48000, "bytes": len(body), "frames": frames}


def synthesize(payload, key, max_seconds):
    request = urllib.request.Request(
        ENDPOINT, data=json.dumps(payload).encode("utf-8"), method="POST",
        headers={"Content-Type": "application/json", "Accept": "audio/wav", "X-API-Key-ID": key},
    )
    try:
        context = ssl.create_default_context()
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({}), urllib.request.HTTPSHandler(context=context), RejectRedirects()
        )
        with opener.open(request, timeout=30) as response:
            if response.status != 200:
                raise VoiceoverError("Provider returned an unexpected HTTP success status.")
            length = response.headers.get("Content-Length")
            if length is not None and (not length.isdecimal() or int(length) > MAX_RESPONSE_BYTES):
                raise VoiceoverError("Provider response length is invalid or exceeds the limit.")
            body = response.read(MAX_RESPONSE_BYTES + 1)
            if length is not None and int(length) != len(body):
                raise VoiceoverError("Provider response length does not match its header.")
            evidence = validate_wav(body, response.headers.get("Content-Type", ""), max_seconds)
            return body, evidence
    except urllib.error.HTTPError as error:
        status = error.code
        error.close()
        raise VoiceoverError(f"Provider HTTP {status}; response details suppressed.") from None
    except (urllib.error.URLError, http.client.HTTPException, OSError):
        raise VoiceoverError("Provider transport/TLS failed; sensitive details suppressed.") from None
    finally:
        request.headers.clear()
        key = None


def save_exclusively(output, body):
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=output.parent, prefix=".gnani-audio-", delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(body)
            handle.flush()
            os.fsync(handle.fileno())
        # Linking publishes a complete file atomically and refuses an existing output.
        os.link(temporary, output)
    finally:
        if temporary is not None:
            temporary.unlink()


def run(args):
    payload = _offline.build_payload(args.input.read_text(encoding="utf-8"), args.model, args.voice)
    if not args.execute:
        print(json.dumps({
            "dry_run": True, "network_requests": 0, "method": "POST",
            "endpoint": ENDPOINT, "body": payload,
            "text_sha256": hashlib.sha256(payload["text"].encode("utf-8")).hexdigest(),
        }, indent=2))
        return
    if args.approval is None:
        raise VoiceoverError("Execution requires a reviewed approval JSON; no key was requested.")
    approval = json.loads(args.approval.read_text(encoding="utf-8"))
    evidence = validate_approval(approval, payload, args.stage)
    output = args.output
    attempt = output.with_name(output.name + ".attempt.json")
    if output.suffix.lower() != ".wav" or not output.parent.is_dir() or output.exists() or attempt.exists():
        raise VoiceoverError("Use a new WAV path in an existing private audio directory.")
    key = None
    try:
        os.environ.pop("GNANI_API_KEY", None)
        key = read_private_key()
        evidence.update(status="dispatch-prepared", requests_authorized=1, actual_cost="unknown")
        with attempt.open("x", encoding="utf-8") as handle:
            json.dump(evidence, handle, indent=2)
        started = time.monotonic()
        body, audio = synthesize(payload, key, 10 if args.stage == "sample" else 75)
        evidence.update(audio, latency_seconds=time.monotonic() - started, status="validated")
        save_exclusively(output, body)
        evidence["audio_sha256"] = hashlib.sha256(body).hexdigest()
        attempt.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
        print(f"Saved validated WAV: {audio['duration_seconds']:.3f}s, {audio['bytes']} bytes.")
        print("One request only. Actual billing remains unknown; reconcile privately before any next request.")
    finally:
        key = None
        os.environ.pop("GNANI_API_KEY", None)


def main():
    parser = PrivateArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--model", choices=_offline.VOICES, default="timbre-v2.5")
    parser.add_argument("--voice", default="Shlok")
    parser.add_argument("--stage", choices=("sample", "full"), default="sample")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--execute", action="store_true")
    parser.add_argument("--approval", type=Path)
    args = parser.parse_args()
    try:
        run(args)
    except VoiceoverError as error:
        print(f"Voiceover failed: {error}", file=sys.stderr)
        print("No automatic retry. If an attempt file exists, billing may have occurred.", file=sys.stderr)
        return 1
    except (OSError, ValueError, UnicodeError):
        print("Voiceover failed: local input, approval or output operation failed; details suppressed.", file=sys.stderr)
        print("No automatic retry. If an attempt file exists, billing may have occurred.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
