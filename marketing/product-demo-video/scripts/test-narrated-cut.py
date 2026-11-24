"""Offline edit-policy tests; no provider requests or generated narration."""

import copy
import json
from pathlib import Path
import runpy
import unittest

ROOT = Path(__file__).resolve().parent
EDIT = runpy.run_path(str(ROOT / "build-narrated-cut.py"))


class NarratedEditTests(unittest.TestCase):
    def setUp(self):
        self.timing = json.loads((ROOT.parent / "narration-timing.json").read_text())

    def test_approval_pause_preserves_pre_and_post_speech_mapping(self):
        t = self.timing
        pause = t["pause_at_raw_seconds"]
        before = EDIT["edit_time"](pause - .001, t)
        after = EDIT["edit_time"](pause + .001, t)
        self.assertAlmostEqual(after - before, t["inserted_pause_seconds"] + .002 / t["tempo"])

    def test_unreadable_and_overlapping_cues_fail(self):
        for cue in ([0, .1, "Too much text to read"], [0, 3, "A"], [.5, 2, "Overlap"]):
            t = copy.deepcopy(self.timing)
            t["cues"] = [[0, 1, "First"], cue]
            with self.assertRaises(ValueError):
                EDIT["captions"](t)

    def test_review_copy_uses_real_shots_and_keeps_finance_before_results(self):
        timeline = EDIT["scenes"](self.timing)
        names = [name for name, _, _ in timeline]
        self.assertLess(names.index("contribution-and-break-even"), names.index("illustrative-seventy-units"))
        self.assertLess(names.index("approval-confirmation"), names.index("running-experiment"))
        self.assertLess(names.index("modeled-contribution-tooltip"), names.index("next-six-hundred-rupee-hypothesis"))
        self.assertTrue(all(b[1] > a[1] for a, b in zip(timeline, timeline[1:])))
        self.assertLessEqual(timeline[-1][1], 75)
        for a, b, text in EDIT["captions"](self.timing):
            self.assertLessEqual(len(text.replace("\n", " ")) / (b-a), 18)
            self.assertLessEqual(len(text.splitlines()), 2)

    def test_rough_marker_is_not_removed_from_existing_rough_outputs(self):
        overlays = EDIT["rough"].overlays
        self.assertIn("VOICEOVER PENDING", overlays(3, "Context", "")[0])
        narrated = overlays(3, "Context", "", status_label="NARRATED CUT / REVIEW COPY")[0]
        self.assertNotIn("VOICEOVER PENDING", narrated)
        self.assertIn("Local prototype / illustrative data", narrated)


if __name__ == "__main__":
    unittest.main()
