import importlib.util
from pathlib import Path
import unittest


spec = importlib.util.spec_from_file_location(
    "prepare_voiceover", Path(__file__).with_name("prepare-voiceover.py")
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PrepareVoiceoverTests(unittest.TestCase):
    def test_selected_voice_produces_reviewable_wav_request(self):
        body = module.build_payload(" Meet Ravi. ", "timbre-v2.5", "Shlok")
        self.assertEqual(body["text"], "Meet Ravi.")
        self.assertEqual(body["language"], "en-IN")
        self.assertEqual(
            body["audio_config"],
            {"sample_rate": 48000, "num_channels": 1, "sample_width": 2,
             "encoding": "linear_pcm", "container": "wav"},
        )

    def test_cross_model_voice_is_rejected(self):
        with self.assertRaises(ValueError):
            module.build_payload("Meet Ravi.", "timbre-v3.0", "Shlok")

    def test_empty_script_is_rejected(self):
        with self.assertRaises(ValueError):
            module.build_payload(" \n ", "timbre-v2.5", "Shlok")


if __name__ == "__main__":
    unittest.main()
