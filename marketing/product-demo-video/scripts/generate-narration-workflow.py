"""Gated Gnani narration with a two-attempt cumulative limit and no retries."""

import argparse
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import struct
import sys
import time
import wave


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generator = load("voice_generator", "generate-voiceover.py")
credential = load("voice_credential", "gnani-credential.py")


def quality(body, minimum_seconds, maximum_seconds):
    result = generator.validate_wav(body, "audio/wav", maximum_seconds)
    if result["duration_seconds"] < minimum_seconds:
        raise generator.VoiceoverError("Audio is shorter than the approved pacing range.")
    with wave.open(io.BytesIO(body), "rb") as audio:
        samples = struct.unpack("<" + "h" * audio.getnframes(), audio.readframes(audio.getnframes()))
    peak = max(abs(value) for value in samples)
    mean = sum(samples) / len(samples)
    rms = max(0, sum(value * value for value in samples) / len(samples) - mean * mean) ** 0.5
    if rms < 20 or peak >= 32767:
        raise generator.VoiceoverError("Audio is silent/near-silent or contains full-scale clipping.")
    return {**result, "pcm_peak": peak, "pcm_rms": round(rms, 3)}


def run(args):
    texts = {
        "sample": args.sample.read_text(encoding="utf-8").strip(),
        "full": args.narration.read_text(encoding="utf-8").strip(),
    }
    payloads = {stage: generator._offline.build_payload(text, "timbre-v2.5", "Shlok")
                for stage, text in texts.items()}
    hashes = {stage: hashlib.sha256(text.encode("utf-8")).hexdigest() for stage, text in texts.items()}
    if not args.execute:
        print(json.dumps({"dry_run": True, "requests": 0,
                          "characters": {stage: len(text) for stage, text in texts.items()},
                          "text_sha256": hashes}, indent=2))
        return
    approval = json.loads(args.approval.read_text(encoding="utf-8"))
    if not isinstance(approval, dict) or any(approval.get(field) is not True for field in (
        "commercial_wav_generation_and_sharing", "available_credit_use",
        "autonomous_sample_to_full", "no_repeated_calls",
    )) or type(approval.get("max_requests")) is not int or approval["max_requests"] != 2:
        raise generator.VoiceoverError("Two-call credits/rights/autonomy approval is required.")
    if not isinstance(approval.get("reference"), str) or not approval["reference"].strip():
        raise generator.VoiceoverError("A nonsecret authorization reference is required.")
    if approval.get("text_sha256") != hashes:
        raise generator.VoiceoverError("The approved sample/narration text has changed.")
    if not args.target.startswith("udaan-product-demo-video:"):
        raise generator.VoiceoverError("Credential target must be scoped to this video.")
    previous_attempts = 0
    if args.previous_attempt is not None:
        previous = json.loads(args.previous_attempt.read_text(encoding="utf-8"))
        requests = previous.get("requests", []) if isinstance(previous, dict) else []
        if not isinstance(previous, dict) or previous.get("provider") != "Gnani.ai" \
                or previous.get("endpoint") != generator.ENDPOINT \
                or previous.get("status") != "stopped-without-retry" \
                or not isinstance(requests, list) or len(requests) != 1 or not isinstance(requests[0], dict) \
                or requests[0].get("stage") != "sample" \
                or requests[0].get("text_sha256") != hashes["sample"]:
            raise generator.VoiceoverError("Continuation requires this exact single failed sample ledger.")
        previous_attempts = 1
        payloads = {"full": payloads["full"]}
    args.output.mkdir()
    ledger = args.output / "voice-usage.json"
    evidence = {
        "provider": "Gnani.ai", "endpoint": generator.ENDPOINT,
        "model": "timbre-v2.5", "voice": "Shlok", "language": "en-IN",
        "authorization": approval["reference"], "credit_use_authorized": True,
        "additional_paid_infrastructure": False, "automatic_retries": 0,
        "actual_billing_units": "not returned/verified", "actual_monetary_cost": "not quoted",
        "previous_synthesis_attempts": previous_attempts, "maximum_cumulative_attempts": 2,
        "requests": [], "status": "started",
    }
    ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    key = None
    try:
        key = credential.read_secret(args.target)
        if key is None:
            raise credential.CredentialError("Temporary Windows credential is not configured.")
        for stage, payload in payloads.items():
            entry = {
                "stage": stage, "characters": len(payload["text"]),
                "text_sha256": hashes[stage], "status": "dispatch-prepared",
                "attempt": 1,
            }
            evidence["requests"].append(entry)
            ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
            started = time.monotonic()
            body, _ = generator.synthesize(payload, key, 10 if stage == "sample" else 75)
            filename = "sample.wav" if stage == "sample" else "narration.wav"
            generator.save_exclusively(args.output / filename, body)
            entry.update(status="valid-wav-quality-pending", output=filename,
                         audio_sha256=hashlib.sha256(body).hexdigest())
            ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
            metrics = quality(body, 5 if stage == "sample" else 45, 10 if stage == "sample" else 75)
            entry.update(metrics, status="validated", output=filename,
                         audio_sha256=hashlib.sha256(body).hexdigest(),
                         elapsed_seconds=round(time.monotonic() - started, 3))
            ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
        evidence["status"] = "complete"
    except (generator.VoiceoverError, credential.CredentialError, OSError, ValueError) as error:
        evidence["status"] = "stopped-without-retry"
        if evidence["requests"]:
            evidence["requests"][-1]["status"] = "failed"
        evidence["failure"] = str(error) if isinstance(
            error, (generator.VoiceoverError, credential.CredentialError)
        ) else "Local operation failed; details suppressed."
        if isinstance(error, credential.CredentialError):
            evidence["failure_category"] = "local-credential"
        elif isinstance(error, generator.VoiceoverError):
            evidence["failure_category"] = (
                "http" if str(error).startswith("Provider HTTP") else
                "transport-tls" if "transport/TLS" in str(error) else "format-or-quality"
            )
        else:
            evidence["failure_category"] = "local-operation"
        raise
    finally:
        key = None
        credential.delete_secret(args.target)
        evidence["temporary_credential_deleted"] = True
        ledger.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(evidence, indent=2))


def main():
    parser = generator.PrivateArgumentParser(description=__doc__)
    parser.add_argument("--sample", type=Path, required=True)
    parser.add_argument("--narration", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--approval", type=Path)
    parser.add_argument("--target")
    parser.add_argument("--previous-attempt", type=Path,
                        help="Preserved failed sample ledger; permits only the remaining full-text attempt.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", help="Explicit no-secret, no-network preparation.")
    mode.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    if args.execute and (args.approval is None or args.target is None):
        parser.error("Execution needs explicit approval and scoped secret target.")
    try:
        run(args)
    except (generator.VoiceoverError, credential.CredentialError, OSError, ValueError, UnicodeError):
        print("Narration workflow stopped; sensitive details suppressed. No request retried.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
