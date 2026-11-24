"""Offline labeled WAV fixtures only; no provider or Windows credential calls."""

import argparse
import contextlib
import hashlib
import importlib.util
import io
import json
import math
from pathlib import Path
import tempfile
import struct
import unittest
from unittest.mock import patch
import wave

spec = importlib.util.spec_from_file_location(
    "workflow", Path(__file__).with_name("generate-narration-workflow.py")
)
workflow = importlib.util.module_from_spec(spec)
spec.loader.exec_module(workflow)


def fixture_wav(seconds, amplitude=1000):
    output = io.BytesIO()
    with wave.open(output, "wb") as audio:
        audio.setparams((1, 2, 48000, 0, "NONE", "not compressed"))
        period = b"".join(struct.pack("<h", round(amplitude * math.sin(2 * math.pi * phase / 48)))
                          for phase in range(48))
        frames = int(seconds * 48000)
        audio.writeframes((period * (frames // 48 + 1))[:frames * 2])
    return output.getvalue()


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        root = Path(self.temporary.name)
        self.args = argparse.Namespace(
            sample=root / "sample.txt", narration=root / "narration.txt",
            approval=root / "approval.json", output=root / "audio",
            target="udaan-product-demo-video:offline-unit-fixture", execute=True, previous_attempt=None,
        )
        texts = {"sample": "OFFLINE UNIT TEST SAMPLE", "full": "OFFLINE UNIT TEST NARRATION"}
        self.args.sample.write_text(texts["sample"], encoding="utf-8")
        self.args.narration.write_text(texts["full"], encoding="utf-8")
        self.approval = {
            "commercial_wav_generation_and_sharing": True, "available_credit_use": True,
            "autonomous_sample_to_full": True, "no_repeated_calls": True,
            "max_requests": 2, "reference": "OFFLINE UNIT TEST ONLY",
            "text_sha256": {
                stage: hashlib.sha256(text.encode()).hexdigest() for stage, text in texts.items()
            },
        }
        self.write_approval()

    def write_approval(self):
        self.args.approval.write_text(json.dumps(self.approval), encoding="utf-8")

    def test_dry_run_has_no_secret_network_or_output(self):
        self.args.execute = False
        with patch.object(workflow.credential, "read_secret") as secret, \
                patch.object(workflow.generator, "synthesize") as request, \
                contextlib.redirect_stdout(io.StringIO()):
            workflow.run(self.args)
        secret.assert_not_called()
        request.assert_not_called()
        self.assertFalse(self.args.output.exists())

    def test_changed_text_refused_before_secret_lookup(self):
        self.args.sample.write_text("DIFFERENT OFFLINE FIXTURE", encoding="utf-8")
        with patch.object(workflow.credential, "read_secret") as secret:
            with self.assertRaises(workflow.generator.VoiceoverError):
                workflow.run(self.args)
        secret.assert_not_called()

    def test_exactly_two_validated_requests_and_credential_cleanup(self):
        with patch.object(workflow.credential, "read_secret", return_value="OFFLINE_FIXTURE"), \
                patch.object(workflow.credential, "delete_secret") as delete, \
                patch.object(workflow.generator, "synthesize", side_effect=[
                    (fixture_wav(6), {}), (fixture_wav(46), {}),
                ]) as request, contextlib.redirect_stdout(io.StringIO()):
            workflow.run(self.args)
        self.assertEqual(request.call_count, 2)
        delete.assert_called_once_with(self.args.target)
        ledger = json.loads((self.args.output / "voice-usage.json").read_text())
        self.assertEqual(ledger["status"], "complete")
        self.assertEqual([entry["duration_seconds"] for entry in ledger["requests"]], [6, 46])
        self.assertTrue(ledger["temporary_credential_deleted"])

    def test_failed_sample_stops_and_preserves_safe_failure(self):
        failures = (
            ("http", "Provider HTTP 401; response details suppressed."),
            ("transport-tls", "Provider transport/TLS failed; details suppressed."),
            ("format-or-quality", "Provider response is not a validated WAV."),
        )
        root = self.args.output.parent
        for category, message in failures:
            with self.subTest(category=category):
                self.args.output = root / category
                with patch.object(workflow.credential, "read_secret", return_value="OFFLINE_FIXTURE"), \
                        patch.object(workflow.credential, "delete_secret") as delete, \
                        patch.object(workflow.generator, "synthesize", side_effect=
                                     workflow.generator.VoiceoverError(message)) as request:
                    with self.assertRaises(workflow.generator.VoiceoverError):
                        workflow.run(self.args)
                self.assertEqual(request.call_count, 1)
                delete.assert_called_once_with(self.args.target)
                ledger = json.loads((self.args.output / "voice-usage.json").read_text())
                self.assertEqual(ledger["requests"][0]["status"], "failed")
                self.assertEqual(ledger["failure_category"], category)
                self.assertEqual(ledger["failure"], message)
                self.assertFalse((self.args.output / "narration.wav").exists())

    def test_missing_credential_has_no_dispatch_and_local_category(self):
        with patch.object(workflow.credential, "read_secret", return_value=None), \
                patch.object(workflow.credential, "delete_secret"), \
                patch.object(workflow.generator, "synthesize") as request:
            with self.assertRaises(workflow.credential.CredentialError):
                workflow.run(self.args)
        request.assert_not_called()
        ledger = json.loads((self.args.output / "voice-usage.json").read_text())
        self.assertEqual(ledger["requests"], [])
        self.assertEqual(ledger["failure_category"], "local-credential")

    def test_credential_diagnostics_never_serialize_input_errors(self):
        root = self.args.output.parent
        for index, error in enumerate((
            workflow.credential.CredentialError("Native credential entry failed.", 87),
            UnicodeEncodeError("ascii", "OFFLINE_PRIVATE_INPUT_FIXTURE\u200b", 0, 1, "fixture"),
        )):
            with self.subTest(index=index):
                args = argparse.Namespace(diagnostics=root / f"credential-{index}.json")
                self.assertTrue(workflow.credential.diagnostic_result(args, "failed", error))
                text = args.diagnostics.read_text()
                report = json.loads(text)
                self.assertEqual(report["api_requests"], 0)
                self.assertFalse(report["key_logged"])
                self.assertNotIn("OFFLINE_PRIVATE_INPUT_FIXTURE", text)
                self.assertEqual(report["windows_error_code"], 87 if index == 0 else None)

    def test_failed_sample_continuation_has_only_one_full_attempt(self):
        self.args.previous_attempt = self.args.output.parent / "previous.json"
        self.args.previous_attempt.write_text(json.dumps({
            "provider": "Gnani.ai", "endpoint": workflow.generator.ENDPOINT,
            "status": "stopped-without-retry", "requests": [{
                "stage": "sample", "text_sha256": self.approval["text_sha256"]["sample"],
            }],
        }), encoding="utf-8")
        with patch.object(workflow.credential, "read_secret", return_value="OFFLINE_FIXTURE"), \
                patch.object(workflow.credential, "delete_secret"), \
                patch.object(workflow.generator, "synthesize",
                             return_value=(fixture_wav(46), {})) as request, \
                contextlib.redirect_stdout(io.StringIO()):
            workflow.run(self.args)
        self.assertEqual(request.call_count, 1)
        ledger = json.loads((self.args.output / "voice-usage.json").read_text())
        self.assertEqual(ledger["previous_synthesis_attempts"], 1)
        self.assertEqual([entry["stage"] for entry in ledger["requests"]], ["full"])

    def test_returned_wav_preserved_when_pacing_check_fails(self):
        with patch.object(workflow.credential, "read_secret", return_value="OFFLINE_FIXTURE"), \
                patch.object(workflow.credential, "delete_secret"), \
                patch.object(workflow.generator, "synthesize",
                             return_value=(fixture_wav(4), {})) as request:
            with self.assertRaises(workflow.generator.VoiceoverError):
                workflow.run(self.args)
        self.assertEqual(request.call_count, 1)
        self.assertTrue((self.args.output / "sample.wav").exists())

    def test_silent_clipped_or_too_short_audio_refused(self):
        for body, minimum in (
            (fixture_wav(.1, 0), .05), (fixture_wav(.1, 32767), .05),
            (fixture_wav(.1), 5),
        ):
            with self.subTest(minimum=minimum):
                with self.assertRaises(workflow.generator.VoiceoverError):
                    workflow.quality(body, minimum, 10)


if __name__ == "__main__":
    unittest.main()
