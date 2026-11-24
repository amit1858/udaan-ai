"""Sarvam REST narration: default no-call, one approved request, no retries."""

import argparse
import base64
import binascii
from decimal import Decimal, InvalidOperation
import hashlib
import http.client
import importlib.util
import json
from pathlib import Path
import ssl
import sys
import urllib.error
import urllib.request


spec = importlib.util.spec_from_file_location(
    "narration_common", Path(__file__).with_name("generate-narration-workflow.py")
)
workflow = importlib.util.module_from_spec(spec)
spec.loader.exec_module(workflow)
common = workflow.generator
credential = workflow.credential
ENDPOINT = "https://api.sarvam.ai/text-to-speech"
MAX_JSON_BYTES = 12 * 1024 * 1024


def payload_for(text):
    text = text.strip()
    if not 1 <= len(text) <= 2500:
        raise common.VoiceoverError("Sarvam text must contain 1-2500 characters.")
    return {
        "text": text, "language_code": "en-IN", "model": "bulbul:v3",
        "speaker": "shubh", "pace": 1.0, "pitch": 0.0, "loudness": 1.0,
        "speech_sample_rate": 48000, "output_audio_codec": "wav",
        "enable_preprocessing": False,
    }


def approved(approval, payload):
    if not isinstance(approval, dict) or type(approval.get("max_requests")) is not int \
            or approval["max_requests"] != 1:
        raise common.VoiceoverError("Exactly one Sarvam request must be approved.")
    for name in ("existing_credits_available", "commercial_output_approved", "no_retry",
                 "no_topup_or_upgrade"):
        if approval.get(name) is not True:
            raise common.VoiceoverError("Existing-credit, commercial-use and no-topup approval is required.")
    digest = hashlib.sha256(payload["text"].encode()).hexdigest()
    if approval.get("text_sha256") != digest or any(
        approval.get(name) != payload[name] for name in ("model", "speaker", "language_code")
    ):
        raise common.VoiceoverError("Approval does not match this text/model/speaker/language.")
    if approval.get("currency") != "INR" or not isinstance(approval.get("reference"), str) \
            or not approval["reference"].strip():
        raise common.VoiceoverError("Approval needs INR and a nonsecret authorization reference.")
    try:
        cap = Decimal(approval["max_credit_debit_inr"])
    except (KeyError, InvalidOperation, TypeError, ValueError):
        raise common.VoiceoverError("A decimal-string credit ceiling is required.") from None
    estimated = Decimal(len(payload["text"])) * Decimal("3") / Decimal("1000")
    if not isinstance(approval["max_credit_debit_inr"], str) or not cap.is_finite() \
            or cap <= 0 or cap > Decimal("5") or estimated > cap:
        raise common.VoiceoverError("Published-rate estimate exceeds the approved INR ceiling.")
    return digest, str(estimated), str(cap)


def decode_response(body, content_type):
    if content_type.split(";", 1)[0].strip().lower() != "application/json" \
            or not body or len(body) > MAX_JSON_BYTES:
        raise common.VoiceoverError("Sarvam response is not bounded application/json.")
    try:
        response = json.loads(body)
    except (json.JSONDecodeError, UnicodeError):
        raise common.VoiceoverError("Sarvam response JSON is invalid; details suppressed.") from None
    audios = response.get("audios") if isinstance(response, dict) else None
    if not isinstance(audios, list) or len(audios) != 1 or not isinstance(audios[0], str):
        raise common.VoiceoverError("Sarvam response must contain exactly one encoded audio.")
    try:
        audio = base64.b64decode(audios[0], validate=True)
    except (binascii.Error, ValueError):
        raise common.VoiceoverError("Sarvam audio is not strict base64; details suppressed.") from None
    common.validate_wav(audio, "audio/wav", 75)
    return audio


def synthesize(payload, key):
    request = urllib.request.Request(
        ENDPOINT, data=json.dumps(payload).encode(), method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json",
                 "api-subscription-key": key},
    )
    try:
        context = ssl.create_default_context()
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({}), urllib.request.HTTPSHandler(context=context),
            common.RejectRedirects(),
        )
        with opener.open(request, timeout=60) as response:
            if response.status != 200:
                raise common.VoiceoverError("Sarvam returned an unexpected HTTP success status.")
            length = response.headers.get("Content-Length")
            if length is not None and (not length.isdecimal() or int(length) > MAX_JSON_BYTES):
                raise common.VoiceoverError("Sarvam response size exceeds the approved limit.")
            body = response.read(MAX_JSON_BYTES + 1)
            if length is not None and int(length) != len(body):
                raise common.VoiceoverError("Sarvam response was incomplete.")
            return decode_response(body, response.headers.get("Content-Type", ""))
    except urllib.error.HTTPError as error:
        status = error.code
        error.close()
        raise common.VoiceoverError(f"Provider HTTP {status}; response details suppressed.") from None
    except (urllib.error.URLError, http.client.HTTPException, OSError):
        raise common.VoiceoverError("Provider transport/TLS failed; details suppressed.") from None
    finally:
        request.headers.clear()
        key = None


def run(args):
    payload = payload_for(args.input.read_text(encoding="utf-8"))
    digest = hashlib.sha256(payload["text"].encode()).hexdigest()
    estimate = str(Decimal(len(payload["text"])) * Decimal("3") / Decimal("1000"))
    if not args.execute:
        print(json.dumps({
            "dry_run": True, "api_requests": 0, "provider": "Sarvam",
            "endpoint": ENDPOINT, "model": payload["model"], "speaker": payload["speaker"],
            "characters": len(payload["text"]), "text_sha256": digest,
            "published_estimate_inr_excluding_gst": estimate,
        }, indent=2))
        return
    approval = json.loads(args.approval.read_text(encoding="utf-8"))
    digest, estimate, cap = approved(approval, payload)
    if not args.target.startswith("udaan-product-demo-video:") or not args.target.endswith(":sarvam"):
        raise common.VoiceoverError("Use a separate scoped Sarvam credential, never the Gnani target.")
    output = args.output.resolve()
    repository = Path(__file__).resolve().parents[3]
    if output == repository or repository in output.parents:
        raise common.VoiceoverError("Narration output must stay outside the repository.")
    output.mkdir()
    ledger = output / "voice-usage.json"
    evidence = {
        "provider": "Sarvam", "endpoint": ENDPOINT, "model": payload["model"],
        "speaker": payload["speaker"], "language": payload["language_code"],
        "authorization": approval["reference"], "maximum_requests": 1,
        "automatic_retries": 0, "topups_or_upgrades": False,
        "published_estimate_inr_excluding_gst": estimate, "approved_credit_ceiling_inr": cap,
        "actual_credit_debit": "not returned/verified", "requests": [],
        "status": "started", "previous_gnani_attempts": "separate exhausted ledger; not reset",
    }
    key = None
    try:
        key = credential.read_secret(args.target)
        if key is None:
            raise credential.CredentialError("Temporary Sarvam credential is not configured.")
        entry = {"stage": "full", "characters": len(payload["text"]), "text_sha256": digest,
                 "status": "dispatch-prepared", "attempt": 1}
        evidence["requests"].append(entry)
        ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
        audio = synthesize(payload, key)
        common.save_exclusively(output / "narration.wav", audio)
        entry.update(status="valid-wav-quality-pending", output="narration.wav",
                     audio_sha256=hashlib.sha256(audio).hexdigest())
        ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
        entry.update(workflow.quality(audio, 45, 75), status="validated")
        evidence["status"] = "complete"
    except (common.VoiceoverError, credential.CredentialError, OSError, ValueError) as error:
        evidence["status"] = "stopped-without-retry"
        if evidence["requests"]:
            evidence["requests"][-1]["status"] = "failed"
        evidence["failure"] = str(error) if isinstance(
            error, (common.VoiceoverError, credential.CredentialError)
        ) else "Local operation failed; sensitive details suppressed."
        evidence["failure_category"] = (
            "local-credential" if isinstance(error, credential.CredentialError) else
            "http" if evidence["failure"].startswith("Provider HTTP") else
            "transport-tls" if "transport/TLS" in evidence["failure"] else "format-quality-or-local"
        )
        raise
    finally:
        key = None
        try:
            credential.delete_secret(args.target)
            evidence["temporary_credential_deleted"] = True
        except credential.CredentialError:
            evidence["temporary_credential_deleted"] = False
            evidence["credential_cleanup"] = "Windows deletion failed; operator cleanup required."
            raise
        finally:
            ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(evidence, indent=2))


if __name__ == "__main__":
    parser = common.PrivateArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--approval", type=Path)
    parser.add_argument("--target")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    if args.execute and (args.approval is None or args.target is None):
        parser.error("Execution requires explicit one-request approval and a scoped Sarvam target.")
    try:
        run(args)
    except (common.VoiceoverError, credential.CredentialError, OSError, ValueError, UnicodeError):
        print("Sarvam narration stopped; inspect the nonsecret usage ledger. No retry.", file=sys.stderr)
        raise SystemExit(1)
