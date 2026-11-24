"""Validate and package only the public, dependency-free static showcase."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import struct
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
SECTIONS = (
    "hero", "problem", "purpose", "thesis", "loop", "use-cases", "market",
    "lang", "finance", "arch", "trust", "built", "roadmap", "product", "try", "resources",
)
PUBLIC_DOCS = ("README.md", "BUILD_BRIEF.md", "CONTENT_REVIEW.md", "VALIDATION.md")


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = set()
        self.links = []
        self.sections = set()
        self.demo_disabled = False
        self.demo_links = []
        self.errors = []
        self.videos = []
        self.downloads = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if identifier := attr.get("id"):
            if identifier in self.ids:
                self.errors.append(f"{self.path.name}: duplicate id {identifier}")
            self.ids.add(identifier)
            if tag == "section":
                self.sections.add(identifier)
        if tag == "button" and attr.get("aria-describedby") == "appStatus":
            self.demo_disabled = "disabled" in attr
        if tag == "a" and attr.get("aria-describedby") == "appStatus":
            self.demo_links.append(attr.get("href", ""))
        if tag == "img":
            for key in ("alt", "width", "height"):
                if not attr.get(key):
                    self.errors.append(f"{self.path.name}: image missing {key}")
        if tag == "video":
            self.videos.append(attr)
        if tag == "a" and "download" in attr:
            self.downloads.append(attr.get("href", ""))
        for name in ("href", "src", "poster"):
            if value := attr.get(name):
                self.links.append(value)
        if value := attr.get("srcset"):
            self.links.extend(item.strip().split()[0] for item in value.split(","))


def markdown_ids(path):
    return {
        re.sub(r"[^\w -]", "", line.lstrip("#").strip().lower()).replace(" ", "-")
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("#")
    }


def fast_start(path):
    atoms = []
    with path.open("rb") as stream:
        offset = 0
        length = path.stat().st_size
        while offset < length:
            stream.seek(offset)
            header = stream.read(8)
            if len(header) != 8:
                return False
            size, kind = struct.unpack(">I4s", header)
            if size == 1:
                size = struct.unpack(">Q", stream.read(8))[0]
            elif size == 0:
                size = length - offset
            if size < 8 or offset + size > length:
                return False
            atoms.append(kind)
            offset += size
    return b"moov" in atoms and b"mdat" in atoms and atoms.index(b"moov") < atoms.index(b"mdat")


def validate():
    pages = {path: Page(path) for path in ROOT.glob("*.html")}
    errors = [error for page in pages.values() for error in page.errors]
    for page in pages.values():
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            if url.path.startswith("/"):
                errors.append(f"{page.path.name}: root-relative path breaks Pages: {link}")
                continue
            target = (page.path.parent / unquote(url.path)).resolve() if url.path else page.path
            if not target.is_relative_to(ROOT) or not target.is_file():
                errors.append(f"{page.path.name}: missing or out-of-scope resource: {link}")
                continue
            if url.fragment:
                anchors = pages[target].ids if target in pages else markdown_ids(target) if target.suffix == ".md" else set()
                if unquote(url.fragment) not in anchors:
                    errors.append(f"{page.path.name}: missing anchor: {link}")
    index = pages[ROOT / "index.html"]
    if index.sections != set(SECTIONS):
        errors.append("Showcase must contain fifteen story sections plus Product Demo & Resources")
    if len(index.videos) != 1 or any(
        "controls" not in video or "playsinline" not in video or
        "autoplay" in video or video.get("preload") != "none"
        for video in index.videos
    ):
        errors.append("Demo must have controls, inline playback, no autoplay and preload=none")
    for name in ("udaan-demo.mp4", "udaan-carousel.pdf", "udaan-cover.png", "udaan-promotional-cover.png", "udaan-captions.srt", "udaan-captions.vtt"):
        if f"assets/resources/{name}" not in index.downloads:
            errors.append(f"Missing direct resource download: {name}")
    resources = ROOT / "assets" / "resources"
    manifest = json.loads((resources / "manifest.json").read_text(encoding="utf-8"))
    for asset in manifest["files"]:
        path = (resources / asset["file"]).resolve()
        if not path.is_relative_to(resources) or not path.is_file():
            errors.append(f"Missing or out-of-scope approved asset: {asset['file']}")
        elif hashlib.sha256(path.read_bytes()).hexdigest() != asset["sha256"]:
            errors.append(f"Approved resource checksum mismatch: {asset['file']}")
    if not fast_start(resources / "udaan-demo.mp4"):
        errors.append("Video must be a valid fast-start MP4 with metadata before media")
    if not index.demo_disabled:
        review = (ROOT / "CONTENT_REVIEW.md").read_text(encoding="utf-8")
        if not index.demo_links or any(not link.startswith("https://") or link not in review for link in index.demo_links):
            errors.append("Live CTA needs a verified HTTPS application URL recorded in CONTENT_REVIEW.md")
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    for required in ("₹99", "₹45", "₹1,500", "100 units", "7 days", "₹2,280", "₹3,900", "₹5,520", "28 units", "Contribution is not net profit"):
        if required not in html:
            errors.append(f"Financial walkthrough missing {required}")
    for units, expected in ((70, 2280), (100, 3900), (130, 5520)):
        if ((9900 - 4500) * units - 150000) // 100 != expected:
            errors.append(f"Invalid {units}-unit scenario")
    for match in re.finditer(r"assets/[a-zA-Z0-9-]+\.webp", (ROOT / "script.js").read_text(encoding="utf-8")):
        if not (ROOT / match.group()).is_file():
            errors.append(f"Missing scripted resource {match.group()}")
    for lang in ("en", "hinglish", "hi", "kn"):
        if not (ROOT / "assets" / f"home-{lang}-390.webp").is_file():
            errors.append(f"Missing {lang} screenshot")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"PASS: {len(pages)} HTML pages; 16 sections; local/srcset/poster links; {len(manifest['files'])} asset checksums; no autoplay; downloads; image metadata; CTA; 3 financial outcomes.")


def build(output):
    if output.exists():
        raise SystemExit("Use a new empty output path; existing directories are never removed or overwritten.")
    if output.is_relative_to(ROOT) or ROOT.is_relative_to(output):
        raise SystemExit("Build output must be outside website source.")
    files = [ROOT / name for name in ("index.html", "credits.html", "styles.css", "script.js", "favicon.svg", *PUBLIC_DOCS)]
    files.extend(path for path in (ROOT / "assets").iterdir() if path.suffix in (".webp", ".svg", ".md") or path.name == "social-cover.jpg")
    files.extend(path for path in (ROOT / "assets" / "resources").iterdir()
                 if path.suffix in (".webp", ".png", ".mp4", ".pdf", ".srt", ".vtt", ".md", ".json"))
    missing = [str(path) for path in files if not path.is_file()]
    if missing:
        raise SystemExit("Missing public resources: " + ", ".join(missing))
    output.mkdir(parents=True)
    (output / ".nojekyll").touch()
    for source in files:
        target = output / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    print(f"BUILD: {len(files)} public files; {sum(path.stat().st_size for path in files):,} bytes; output {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    validate()
    if args.output:
        build(args.output.resolve())
