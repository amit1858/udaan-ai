"""Build a documented Gnani request locally; deliberately has no API transport."""

import argparse
import json
from pathlib import Path
import sys


VOICES = {
    "timbre-v2.5": ("Kaveri", "Trupti", "Devika", "Pranav", "Shlok", "Girish"),
    "timbre-v3.0": ("Arko", "Mahendra", "Priyasharm", "Sohini", "Sunaina"),
}
ENDPOINT = "https://api.vachana.ai/api/v1/tts/inference"


def build_payload(text, model, voice):
    if not text.strip():
        raise ValueError("Narration must not be empty.")
    if model not in VOICES or voice not in VOICES[model]:
        raise ValueError("Select a documented English voice belonging to this model.")
    return {
        "text": text.strip(),
        "voice": voice,
        "model": model,
        "language": "en-IN",
        "speed": 1.0,
        "audio_config": {
            "sample_rate": 48000,
            "num_channels": 1,
            "sample_width": 2,
            "encoding": "linear_pcm",
            "container": "wav",
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--model", choices=VOICES, default="timbre-v2.5")
    parser.add_argument("--voice", default="Shlok")
    args = parser.parse_args()
    payload = build_payload(args.input.read_text(encoding="utf-8"), args.model, args.voice)
    # Exclusive creation protects reviewed request material from accidental overwrite.
    with args.output.open("x", encoding="utf-8") as handle:
        json.dump({"method": "POST", "endpoint": ENDPOINT, "body": payload}, handle, indent=2)
        handle.write("\n")
    print("Offline request prepared. No key read; no network request; no audio generated.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(f"Preparation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
