"""OFFLINE LABELED FIXTURES: no Sarvam calls or native credential access."""

import argparse
import base64
import contextlib
import hashlib
import importlib.util
import io
import json
import math
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch
import urllib.error
import wave

spec = importlib.util.spec_from_file_location(
    "sarvam_fixture_subject", Path(__file__).with_name("generate-sarvam-narration.py")
)
subject = importlib.util.module_from_spec(spec)
spec.loader.exec_module(subject)


def wav_fixture(seconds=46, rate=48000):
    output = io.BytesIO()
    with wave.open(output, "wb") as audio:
        audio.setparams((1, 2, rate, 0, "NONE", "fixture only"))
        period = b"".join(struct.pack("<h", round(1000 * math.sin(2 * math.pi * i / 48)))
                          for i in range(48))
        count = round(seconds * rate)
        audio.writeframes((period * (count // 48 + 1))[:count * 2])
    return output.getvalue()


class SarvamTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.args = argparse.Namespace(input=self.root / "text.txt", output=self.root / "output",
                                       approval=self.root / "approval.json", execute=True,
                                       target="udaan-product-demo-video:offline-fixture:sarvam")
        text = "OFFLINE LABELED NARRATION FIXTURE"
        self.args.input.write_text(text)
        self.approval = {
            "max_requests": 1, "existing_credits_available": True,
            "commercial_output_approved": True, "no_retry": True, "no_topup_or_upgrade": True,
            "text_sha256": hashlib.sha256(text.encode()).hexdigest(),
            "model": "bulbul:v3", "speaker": "shubh", "language_code": "en-IN",
            "currency": "INR", "max_credit_debit_inr": "5.00", "reference": "OFFLINE FIXTURE",
        }
        self.save_approval()

    def save_approval(self):
        self.args.approval.write_text(json.dumps(self.approval))

    def test_default_no_call_never_reads_secret_or_creates_output(self):
        self.args.execute = False
        with patch.object(subject.credential, "read_secret") as secret, \
                patch.object(subject, "synthesize") as request, \
                contextlib.redirect_stdout(io.StringIO()):
            subject.run(self.args)
        secret.assert_not_called()
        request.assert_not_called()
        self.assertFalse(self.args.output.exists())

    def test_text_and_price_gates_run_before_secret_lookup(self):
        for change in ("hash", "cap"):
            with self.subTest(change=change):
                approval = dict(self.approval)
                approval["text_sha256" if change == "hash" else "max_credit_debit_inr"] = \
                    "not-the-fixture-hash" if change == "hash" else "0.001"
                self.args.approval.write_text(json.dumps(approval))
                with patch.object(subject.credential, "read_secret") as secret:
                    with self.assertRaises(subject.common.VoiceoverError):
                        subject.run(self.args)
                secret.assert_not_called()

    def test_strict_json_base64_and_wav_validation(self):
        valid = wav_fixture(.1)
        self.assertEqual(subject.decode_response(
            json.dumps({"audios": [base64.b64encode(valid).decode()]}).encode(),
            "application/json; charset=utf-8"), valid)
        for body in (
            b"not-json", b'{"audios":["%%%"]}', b'{"audios":[]}',
            json.dumps({"audios": [base64.b64encode(wav_fixture(.1, 24000)).decode()]}).encode(),
        ):
            with self.subTest(body_size=len(body)):
                with self.assertRaises(subject.common.VoiceoverError):
                    subject.decode_response(body, "application/json")

    def test_one_real_transport_invocation_boundary_and_cleanup(self):
        with patch.object(subject.credential, "read_secret", return_value="OFFLINE_FAKE_KEY"), \
                patch.object(subject.credential, "delete_secret") as delete, \
                patch.object(subject, "synthesize", return_value=wav_fixture()) as request, \
                contextlib.redirect_stdout(io.StringIO()):
            subject.run(self.args)
        request.assert_called_once()
        delete.assert_called_once_with(self.args.target)
        ledger = (self.args.output / "voice-usage.json").read_text()
        self.assertNotIn("OFFLINE_FAKE_KEY", ledger)
        self.assertEqual(json.loads(ledger)["status"], "complete")
        self.assertTrue((self.args.output / "narration.wav").exists())
        with patch.object(subject.credential, "read_secret") as secret:
            with self.assertRaises(FileExistsError):
                subject.run(self.args)
        secret.assert_not_called()

    def test_http_error_has_no_body_or_key_and_no_retry(self):
        error = urllib.error.HTTPError(subject.ENDPOINT, 403, "OFFLINE_PRIVATE_ERROR", {}, None)
        with patch.object(subject.urllib.request, "build_opener") as opener:
            opener.return_value.open.side_effect = error
            with self.assertRaisesRegex(subject.common.VoiceoverError, "Provider HTTP 403") as caught:
                subject.synthesize(subject.payload_for("OFFLINE FIXTURE"), "OFFLINE_FAKE_KEY")
            opener.return_value.open.assert_called_once()
            request = opener.return_value.open.call_args.args[0]
            self.assertEqual(request.headers, {})
            self.assertNotIn("OFFLINE_PRIVATE_ERROR", str(caught.exception))
            self.assertNotIn("OFFLINE_FAKE_KEY", str(caught.exception))

    def test_valid_returned_audio_preserved_on_pacing_failure(self):
        with patch.object(subject.credential, "read_secret", return_value="OFFLINE_FAKE_KEY"), \
                patch.object(subject.credential, "delete_secret"), \
                patch.object(subject, "synthesize", return_value=wav_fixture(4)) as request:
            with self.assertRaises(subject.common.VoiceoverError):
                subject.run(self.args)
        request.assert_called_once()
        self.assertTrue((self.args.output / "narration.wav").exists())

    def test_provider_target_mismatch_cannot_read_native_credentials(self):
        args = argparse.Namespace(target="udaan-product-demo-video:offline-fixture:gnani",
                                  provider="sarvam")
        with patch.object(subject.credential, "read_secret") as secret:
            with self.assertRaises(subject.credential.CredentialError):
                subject.credential.main(args)
        secret.assert_not_called()


if __name__ == "__main__":
    unittest.main()
