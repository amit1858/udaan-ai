"""Create static derivatives of approved assets without application/provider access."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess

from PIL import Image
import pymupdf

ROOT = Path(__file__).resolve().parent
CAROUSEL_REF = "bb7843750a28a8f9cdc55290f68c8d4eb67b516a"
CAROUSEL = "marketing/linkedin-launch/"
SLIDES = (
    "01-big-possibility", "02-meet-ravi", "03-more-direction",
    "04-discover-to-learn", "05-combo-evaluation",
    "06-outcomes-and-learning", "07-explore-udaan",
)
SHOTS = {
    "discover": "04-discover.png",
    "explore": "08-explore-combo.png",
    "evaluate": "11-contribution-and-break-even.png",
    "try": "14-approved.png",
    "measure": "20-actual-versus-expected.png",
    "learn": "23-next-six-hundred-rupee-hypothesis.png",
}
APPROVED = {
    "udaan-linkedin.mp4": "d30ac65568a482ee2ea4e4b5b17dd5ddba71e6b488a8ebf78c6f9fb0c1ff220f",
    "cover.png": "c2e05f3ff5f865a5e21d0863dddc2131e016c26611a0253f580ac58f4d73a1b5",
    "narration.srt": "3e863fc659ae1965617adae6f6620d68d54f99a9e5e7bb3f06943d186d6203a1",
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def source(path):
    return subprocess.check_output(
        ["git", "show", f"{CAROUSEL_REF}:{CAROUSEL}{path}"], cwd=ROOT.parent
    )


def prepare(private):
    target = ROOT / "assets" / "resources"
    if target.exists():
        raise SystemExit("Resources already exist; inspect them before regenerating.")
    masters = {}
    for name, expected in APPROVED.items():
        data = (private / "final-cut-01" / name).read_bytes()
        if sha(data) != expected:
            raise SystemExit(f"Approved master checksum mismatch: {name}")
        masters[name] = data
    pdf = source("udaan-linkedin-carousel.pdf")
    with pymupdf.open(stream=pdf, filetype="pdf") as document:
        if len(document) != 7:
            raise SystemExit("Approved carousel must have seven pages.")
    target.mkdir(parents=True)
    records = []

    def write(name, data, origin, operation):
        path = target / name
        path.write_bytes(data)
        records.append({
            "file": name, "bytes": len(data), "sha256": sha(data),
            "source": origin, "operation": operation,
        })

    def webp(name, data, width, origin):
        with Image.open(io.BytesIO(data)) as image:
            image = image.convert("RGB")
            image.thumbnail((width, 10000), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            image.save(buffer, "WEBP", lossless=True, method=6)
            write(name, buffer.getvalue(), origin, "Uniform resize; lossless WebP, no crop.")

    write("udaan-demo.mp4", masters["udaan-linkedin.mp4"],
          "Approved final portrait MP4, 73.000 seconds", "Byte-identical approved master; fast-start MP4.")
    write("udaan-cover.png", masters["cover.png"],
          "Approved final portrait video poster", "Byte-identical approved master.")
    webp("udaan-cover.webp", masters["cover.png"], 1080, "Approved final portrait video poster")
    promotion = source("linkedin-cover.png")
    write("udaan-promotional-cover.png", promotion,
          f"{CAROUSEL_REF}:{CAROUSEL}linkedin-cover.png", "Byte-identical approved promotional cover.")
    webp("udaan-promotional-cover.webp", promotion, 1080,
         f"{CAROUSEL_REF}:{CAROUSEL}linkedin-cover.png")
    write("udaan-carousel.pdf", pdf, f"{CAROUSEL_REF}:{CAROUSEL}udaan-linkedin-carousel.pdf",
          "Byte-identical seven-page approved PDF.")
    write("carousel-credits.md", source("CREDITS.md"), f"{CAROUSEL_REF}:{CAROUSEL}CREDITS.md",
          "Original attribution preserved.")
    srt = masters["narration.srt"].decode("utf-8-sig")
    write("udaan-captions.srt", masters["narration.srt"], "Approved final SRT",
          "Byte-identical approved subtitles.")
    vtt = "WEBVTT\n\n" + "\n".join(
        line.replace(",", ".") if " --> " in line else line
        for line in srt.splitlines()
    ) + "\n"
    write("udaan-captions.vtt", vtt.encode("utf-8"), "Approved final SRT",
          "Lossless timestamp-format conversion to WebVTT.")
    for slide in SLIDES:
        data = source(f"slides/{slide}.png")
        for width in (540, 1080):
            webp(f"{slide}-{width}.webp", data, width,
                 f"{CAROUSEL_REF}:{CAROUSEL}slides/{slide}.png")
    for phase, name in SHOTS.items():
        data = (private / "local-demo-02" / "screenshots" / name).read_bytes()
        for width in (432, 864):
            webp(f"{phase}-{width}.webp", data, width,
                 f"local-demo-02/screenshots/{name}; handoff de9283e")
    manifest = {
        "approval": "24 Nov 2026: owner requests approved media in GitHub Pages showcase; deployment not performed.",
        "source_handoff": "de9283e1c8a1d08cf62fd9832e0d14df84749d43",
        "disclosure": "Genuine isolated local prototype; illustrative business data; not deployed customer evidence.",
        "carousel_ref": CAROUSEL_REF,
        "files": records,
    }
    (target / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(records)} approved static assets; {sum(item['bytes'] for item in records):,} bytes.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--private-artifacts", required=True, type=Path)
    prepare(parser.parse_args().private_artifacts.resolve())
