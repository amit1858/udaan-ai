"""Offline unit-test fixtures only: synthetic silence is not narration evidence."""

import argparse
import contextlib
import getpass
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch
import urllib.error
import wave
import warnings


_spec = importlib.util.spec_from_file_location(
    "generator", Path(__file__).with_name("generate-voiceover.py")
)
generator = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(generator)


def fixture_wav(rate=48000, channels=1, frames=4800):
    """UNIT TEST FIXTURE: in-memory silent PCM, never a product/media asset."""
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as audio:
        audio.setnchannels(channels)
        audio.setsampwidth(2)
        audio.setframerate(rate)
        audio.writeframes(b"\0" * frames * channels * 2)
    return buffer.getvalue()


def fixture_approval(payload, stage="sample"):
    return {
        "approval_reference": "UNIT TEST FIXTURE - NOT REAL APPROVAL",
        "stage": stage, "text_sha256": hashlib.sha256(payload["text"].encode()).hexdigest(),
        "model": payload["model"], "voice": payload["voice"],
        "rights_confirmed": True, "voice_selection_approved": True,
        "billing_verified_and_bounded": True, "max_requests": 1,
        "max_cost": "0.00", "currency": "INR",
    }


class GeneratorTests(unittest.TestCase):
    def setUp(self):
        self.payload = generator._offline.build_payload(
            "UNIT TEST FIXTURE ONLY", "timbre-v2.5", "Shlok"
        )

    def test_default_dry_run_has_no_key_network_or_output(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            text = root / "fixture.txt"
            text.write_text(self.payload["text"], encoding="utf-8")
            args = argparse.Namespace(
                input=text, output=root / "fixture.wav", model="timbre-v2.5",
                voice="Shlok", execute=False, stage="sample", approval=None,
            )
            with patch.object(generator, "read_private_key") as key, \
                    patch.object(generator, "synthesize") as transport, \
                    contextlib.redirect_stdout(io.StringIO()):
                generator.run(args)
            key.assert_not_called()
            transport.assert_not_called()
            self.assertFalse(args.output.exists())

    def test_gates_reject_missing_rights_billing_voice_and_changed_text(self):
        for field, value in (
            ("rights_confirmed", False), ("billing_verified_and_bounded", False),
            ("voice_selection_approved", False), ("text_sha256", "unreviewed"),
            ("max_requests", True), ("max_cost", "NaN"), ("max_cost", "-1"),
        ):
            with self.subTest(field=field, value=value):
                approval = fixture_approval(self.payload)
                approval[field] = value
                with self.assertRaises(generator.VoiceoverError):
                    generator.validate_approval(approval, self.payload, "sample")

    def test_full_requires_previous_sample_approval(self):
        approval = fixture_approval(self.payload, "full")
        with self.assertRaises(generator.VoiceoverError):
            generator.validate_approval(approval, self.payload, "full")
        approval["sample_approved"] = True
        generator.validate_approval(approval, self.payload, "full")

    def test_key_entry_refuses_non_tty_and_warning_fallback(self):
        with patch.object(generator.sys.stdin, "isatty", return_value=False), \
                patch.object(generator.getpass, "getpass") as prompt:
            with self.assertRaises(generator.VoiceoverError):
                generator.read_private_key()
            prompt.assert_not_called()
        def fallback(*args, **kwargs):
            warnings.warn("UNIT TEST fallback", getpass.GetPassWarning)
            return "UNIT-TEST-NONSECRET"
        with patch.object(generator.sys.stdin, "isatty", return_value=True), \
                patch.object(generator.sys.stderr, "isatty", return_value=True), \
                patch.object(generator.getpass, "getpass", side_effect=fallback):
            with self.assertRaises(generator.VoiceoverError):
                generator.read_private_key()

    def test_cli_rejects_credential_arguments_without_echoing_them(self):
        errors = io.StringIO()
        with patch.object(generator.sys, "argv", [
            "generate-voiceover.py", "--input", "fixture.txt", "--output", "fixture.wav",
            "--key", "UNIT-TEST-NONSECRET",
        ]), contextlib.redirect_stderr(errors):
            with self.assertRaises(SystemExit) as failure:
                generator.main()
        self.assertEqual(failure.exception.code, 2)
        self.assertNotIn("UNIT-TEST-NONSECRET", errors.getvalue())

    def test_wav_validation_rejects_wrong_format_truncation_and_duration(self):
        valid = fixture_wav()
        self.assertEqual(generator.validate_wav(valid, "audio/wav", 10)["frames"], 4800)
        for body, content_type, limit in (
            (b'{"audio":"UNIT TEST"}', "application/json", 10),
            (valid, "application/octet-stream", 10),
            (valid[:-1], "audio/wav", 10),
            (fixture_wav(rate=24000), "audio/wav", 10),
            (fixture_wav(channels=2), "audio/wav", 10),
            (fixture_wav(frames=0), "audio/wav", 10),
            (valid, "audio/wav", 0.05),
        ):
            with self.subTest(content_type=content_type, size=len(body), limit=limit):
                with self.assertRaises(generator.VoiceoverError):
                    generator.validate_wav(body, content_type, limit)

    def test_official_transport_binary_output_and_header_cleanup(self):
        body = fixture_wav()
        response = Mock(status=200, headers={"Content-Type": "audio/wav", "Content-Length": str(len(body))})
        response.read.return_value = body
        response.__enter__ = Mock(return_value=response)
        response.__exit__ = Mock(return_value=False)
        opener = Mock()
        def open_fixture(request, timeout):
            self.assertEqual(request.get_header("X-api-key-id"), "UNIT-TEST-NONSECRET")
            self.assertEqual(request.get_header("Content-type"), "application/json")
            self.assertEqual(timeout, 30)
            return response
        opener.open.side_effect = open_fixture
        with patch.object(generator.urllib.request, "build_opener", return_value=opener):
            result, evidence = generator.synthesize(self.payload, "UNIT-TEST-NONSECRET", 10)
        request = opener.open.call_args.args[0]
        self.assertEqual(request.full_url, generator.ENDPOINT)
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(json.loads(request.data), self.payload)
        self.assertEqual(request.headers, {})
        self.assertEqual(result, body)
        self.assertEqual(evidence["frames"], 4800)
        opener.open.assert_called_once()

    def test_http_failure_is_sanitized_and_never_retried(self):
        opener = Mock()
        opener.open.side_effect = urllib.error.HTTPError(
            generator.ENDPOINT, 429, "UNIT-TEST-NONSECRET must not leak", {},
            io.BytesIO(b"UNIT TEST private response body"),
        )
        with patch.object(generator.urllib.request, "build_opener", return_value=opener):
            with self.assertRaises(generator.VoiceoverError) as failure:
                generator.synthesize(self.payload, "UNIT-TEST-NONSECRET", 10)
        self.assertIn("HTTP 429", str(failure.exception))
        self.assertNotIn("NONSECRET", str(failure.exception))
        opener.open.assert_called_once()
        self.assertEqual(opener.open.call_args.args[0].headers, {})

    def test_redirect_is_rejected(self):
        with self.assertRaises(generator.VoiceoverError):
            generator.RejectRedirects().redirect_request(None, None, 302, "", {}, "https://example.invalid/")

    def test_output_cannot_overwrite_existing_audio(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "fixture.wav"
            generator.save_exclusively(output, fixture_wav())
            original = output.read_bytes()
            with self.assertRaises(FileExistsError):
                generator.save_exclusively(output, b"UNIT TEST replacement")
            self.assertEqual(output.read_bytes(), original)
            self.assertEqual(list(Path(directory).iterdir()), [output])

    def test_execute_once_keeps_attempt_to_prevent_same_output_retry(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            text = root / "fixture.txt"
            text.write_text(self.payload["text"], encoding="utf-8")
            approval = root / "fixture-approval.json"
            approval.write_text(json.dumps(fixture_approval(self.payload)), encoding="utf-8")
            args = argparse.Namespace(
                input=text, output=root / "fixture.wav", model="timbre-v2.5",
                voice="Shlok", execute=True, stage="sample", approval=approval,
            )
            body = fixture_wav()
            with patch.object(generator, "read_private_key", return_value="UNIT-TEST-NONSECRET"), \
                    patch.object(generator, "synthesize", return_value=(
                        body, generator.validate_wav(body, "audio/wav", 10)
                    )) as transport, contextlib.redirect_stdout(io.StringIO()):
                generator.run(args)
                with self.assertRaises(generator.VoiceoverError):
                    generator.run(args)
            transport.assert_called_once()
            metadata = json.loads((root / "fixture.wav.attempt.json").read_text())
            self.assertEqual(metadata["status"], "validated")
            self.assertEqual(metadata["actual_cost"], "unknown")
            self.assertNotIn("UNIT-TEST-NONSECRET", json.dumps(metadata))

    def test_failed_attempt_stays_blocked_without_audio_or_second_key_prompt(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            text = root / "fixture.txt"
            text.write_text(self.payload["text"], encoding="utf-8")
            approval = root / "fixture-approval.json"
            approval.write_text(json.dumps(fixture_approval(self.payload)), encoding="utf-8")
            args = argparse.Namespace(
                input=text, output=root / "fixture.wav", model="timbre-v2.5",
                voice="Shlok", execute=True, stage="sample", approval=approval,
            )
            with patch.object(generator, "read_private_key", return_value="UNIT-TEST-NONSECRET") as key, \
                    patch.object(generator, "synthesize", side_effect=generator.VoiceoverError(
                        "UNIT TEST transport failure"
                    )) as transport:
                with self.assertRaises(generator.VoiceoverError):
                    generator.run(args)
                with self.assertRaises(generator.VoiceoverError):
                    generator.run(args)
            key.assert_called_once()
            transport.assert_called_once()
            self.assertFalse(args.output.exists())
            metadata = json.loads((root / "fixture.wav.attempt.json").read_text())
            self.assertEqual(metadata["status"], "dispatch-prepared")
            self.assertEqual(metadata["actual_cost"], "unknown")


if __name__ == "__main__":
    unittest.main()
