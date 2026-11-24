"""Package whitelisted private review assets; exclude credentials and runtimes."""

import argparse
import hashlib
import json
from pathlib import Path
import zipfile


def run(artifacts, output, final=False):
    repo = Path(__file__).resolve().parents[3]
    if output.exists() or output.resolve() == repo or repo in output.resolve().parents:
        raise ValueError("Use a new ZIP outside the repository.")
    evidence = json.loads((artifacts / "local-demo-02" / "recording-evidence.json").read_text())
    name = evidence["video"]["file"]
    if Path(name).name != name:
        raise ValueError("Invalid recording filename.")
    entries = [
        (artifacts / "local-demo-02" / name, "recording/" + name),
        (artifacts / "local-demo-02" / "recording-evidence.json", "recording/recording-evidence.json"),
        (artifacts / "sarvam-voice-01" / "narration.wav", "voice/narration.wav"),
        (artifacts / "sarvam-voice-01" / "voice-usage.json", "voice/voice-usage.json"),
        (artifacts / "gnani-voice" / "voice-usage.json", "usage/gnani-sample-usage.json"),
        (artifacts / "gnani-voice-final" / "voice-usage.json", "usage/gnani-full-usage.json"),
    ]
    edit = "final-cut-01" if final else "narrated-cut-01"
    video = "udaan-linkedin.mp4" if final else "udaan-narrated-review-cut.mp4"
    validation = json.loads((artifacts / edit / "validation.json").read_text())
    if final and validation["status"] != "final-private-narrated-user-reviewed":
        raise ValueError("Final packaging requires the approved final export.")
    if hashlib.sha256((artifacts / edit / video).read_bytes()).hexdigest() != validation["output_sha256"]:
        raise ValueError("Video differs from its validated export.")
    videos = [video, "udaan-landscape.mp4"] if final else [video]
    for name in (*videos, "cover.png", "narration.srt", "mixed-narration.wav", "validation.json"):
        entries.append((artifacts / edit / name, "narrated/" + name))
    for name in ("Sora.ttf", "DMSans.ttf", "Sora-OFL.txt", "DMSans-OFL.txt"):
        entries.append((artifacts / "video-fonts" / name, "fonts/" + name))
    for image in sorted((artifacts / edit).glob("qa-*-320.png")):
        entries.append((image, "review/" + image.name))
    for source in sorted((repo / "marketing" / "product-demo-video").rglob("*")):
        if source.is_file() and source.suffix in (".py", ".ps1", ".mjs", ".md", ".txt", ".json") \
                and not any(part in ("node_modules", "__pycache__") for part in source.parts):
            entries.append((source, source.relative_to(repo).as_posix()))
    manifest = {"status": ("final-private-delivery-user-reviewed" if final
                            else "private-narrated-review-listening-approval-pending"), "files": []}
    with zipfile.ZipFile(output, "x", compression=zipfile.ZIP_DEFLATED) as archive:
        for source, name in entries:
            data = source.read_bytes()
            archive.writestr(name, data)
            manifest["files"].append({"path": name, "bytes": len(data),
                                      "sha256": hashlib.sha256(data).hexdigest()})
        archive.writestr("manifest.json", json.dumps(manifest, indent=2) + "\n")
        archive.writestr("READ-ME.txt",
            ("PRIVATE FINAL DELIVERY: user listening approval received. No public video publication.\n"
             if final else "PRIVATE REVIEW COPY: listening/final sign-off pending. No public video publication.\n") +
            "Genuine local prototype; fictional business and illustrative results.\n"
            "See marketing/product-demo-video/FINAL_REVIEW.md and CREDITS.md.\n"
            "Original recorder filename and evidence are preserved in recording/.\n"
            "Original Sarvam WAV/receipt are in voice/; mixed derivative/video/SRT in narrated/.\n"
            "Rebuild with scripts/build-narrated-cut.py using --recording recording --voice voice\n"
            "--fonts fonts --timing marketing/product-demo-video/narration-timing.json,\n"
            "--output a NEW OUTSIDE directory and --ffmpeg your existing ffmpeg.exe.\n"
            + ("Use --final-approved --landscape only after obtaining listening approval.\n" if final else "") +
            "No API call is needed. Existing synthesis approvals are exhausted.\n"
            "No credentials, private entry diagnostics, database, runtime or node_modules included.\n")
    with zipfile.ZipFile(output) as archive:
        for item in manifest["files"]:
            if hashlib.sha256(archive.read(item["path"])).hexdigest() != item["sha256"]:
                raise ValueError("Packaged file integrity failed.")
    print(json.dumps({"status": "verified-private-review-bundle", "files": len(entries),
                      "bytes": output.stat().st_size,
                      "sha256": hashlib.sha256(output.read_bytes()).hexdigest()}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifacts", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--final", action="store_true")
    args = parser.parse_args()
    run(args.artifacts.resolve(), args.output.resolve(), args.final)
