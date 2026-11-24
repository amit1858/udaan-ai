import hashlib
import json
import math
from pathlib import Path
import xml.etree.ElementTree as ET

import fitz
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
manifest = json.loads((ROOT / "source" / "design.json").read_text(encoding="utf-8"))
checks = []


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    checks.append(message)


slides = sorted((ROOT / "slides").glob("[0-9][0-9]-*.png"))
check(len(slides) == 7, "Exactly seven carousel PNGs")
for slide in slides:
    with Image.open(slide) as image:
        check(image.size == (2160, 2700), f"{slide.name}: 2160 x 2700, 4:5")
        image.verify()
with Image.open(ROOT / "linkedin-cover.png") as image:
    check(image.size == (2400, 1254), "Feed cover: 2400 x 1254")
for width in [390, 320]:
    mobile = sorted((ROOT / "previews" / f"mobile-{width}").glob("[0-9][0-9]-*.png"))
    check(len(mobile) == 7, f"Seven native-size {width}px mobile proofs")
    for file in mobile:
        with Image.open(file) as image:
            check(image.size == (width, round(width * 5 / 4)), f"{file.parent.name}/{file.name}: correct mobile aspect")

sources = sorted((ROOT / "source").glob("*.svg"))
check(len(sources) == 8, "Seven editable SVG slides plus editable cover")
svg_text = []
for source in sources:
    tree = ET.parse(source)
    svg_text.extend(node.text or "" for node in tree.iter("{http://www.w3.org/2000/svg}text"))
    check(bool(list(tree.iter("{http://www.w3.org/2000/svg}text"))), f"{source.name}: editable text retained")
    check("data:image/webp" not in source.read_text(encoding="utf-8"), f"{source.name}: compatible raster embedding")

def slide_text(name):
    return " ".join(node.text or "" for node in ET.parse(ROOT / "source" / name).iter("{http://www.w3.org/2000/svg}text"))


check("I built an AI companion to help small businesses decide what to try next." in slide_text("01-big-possibility.svg"), "Slide 1: complete first-person product hook")
check("Every small business deserves a big possibility." in slide_text("01-big-possibility.svg"), "Slide 1: brand promise retained")
check(all(term in slide_text("03-more-direction.svg") for term in ["Business context", "AI reasoning", "Deterministic finances", "Outcome-driven learning", "DEMO MODE"]), "Slide 3: four-part differentiation with honest Demo evidence")
journey = slide_text("04-discover-to-learn.svg")
check(all(term in journey for term in ["₹99 breakfast combo", "ILLUSTRATIVE", "Discover", "Explore", "Evaluate", "Try", "Measure", "Learn"]), "Slide 4: illustrative owner question and complete six-step journey")
check("udaan-ai-builder.replit.app" in slide_text("07-explore-udaan.svg"), "Slide 7: complete URL in one readable text object")
check("https://udaan-ai-builder.replit.app/" in slide_text("07-explore-udaan.svg"), "Slide 7: full HTTPS destination displayed")

for name in ["home-en-390.png", "07-demo-conversation.png", "10-learning-low.png", "11-learning-high.png"]:
    original = (REPO / "website" / "assets" / name).read_bytes()
    copied = (ROOT / "screenshots" / "release-candidate" / name).read_bytes()
    check(original == copied, f"{name}: byte-identical inherited screenshot")
for crop in manifest["crops"]:
    with Image.open(ROOT / crop["source"]) as original, Image.open(ROOT / crop["file"]) as actual:
        expected = original.crop((crop["x"], crop["y"], crop["x"] + crop["width"], crop["y"] + crop["height"]))
        check(ImageChops.difference(expected.convert("RGB"), actual.convert("RGB")).getbbox() is None, f"{crop['file']}: exact authentic pixel crop")

model = manifest["model"]
check(model["price"] - model["variableCost"] == 54, "Contribution per unit: INR 54")
for outcome, expected in zip(model["outcomes"], [2280, 3900, 5520], strict=True):
    units = outcome["units"]
    calculated = (model["price"] - model["variableCost"]) * units - model["promotion"]
    check(calculated == expected == outcome["contributionAfterPromotion"], f"{units} units: INR {expected} after promotion")
    check(outcome["revenue"] == 99 * units and outcome["variableCosts"] == 45 * units, f"{units} units: revenue and variable costs agree")
check(math.ceil(model["promotion"] / 54) == model["breakEvenTotalUnits"] == 28, "28-unit total promotion break-even")
check(27 * 54 - 1500 == -42 and 28 * 54 - 1500 == 12, "Exact break-even threshold: 27 negative, 28 positive")
check(model["days"] == 7 and model["target"] == 100, "Seven-day scope and 100-unit target")
check(any(".replit.app" in text for text in svg_text), "Complete live destination is present")
check(any("not net profit" in text.casefold() for text in svg_text), "Net-profit exclusion is present")

live = json.loads((ROOT / "screenshots" / "live" / "capture.json").read_text(encoding="utf-8"))
check(len(live["captures"]) == 2, "Two fresh live entry captures")
for capture in live["captures"]:
    content = (ROOT / capture["file"]).read_bytes()
    check(hashlib.sha256(content).hexdigest() == capture["sha256"], f"{capture['file']}: capture SHA-256 matches")
    check(capture["status"] == 200 and "Fictional business, synthetic data" in capture["renderedText"], f"{capture['file']}: successful genuine entry with disclosure")

with fitz.open(ROOT / "udaan-linkedin-carousel.pdf") as pdf:
    check((ROOT / "udaan-linkedin-carousel.pdf").stat().st_size < 100_000_000, "Carousel PDF below LinkedIn's 100 MB document ceiling")
    check(len(pdf) == 7, "LinkedIn PDF has seven pages")
    for index, page in enumerate(pdf):
        check(abs(page.rect.width / page.rect.height - 4 / 5) < 0.0001, f"PDF page {index + 1}: 4:5")
        check(len(page.get_images()) == 1, f"PDF page {index + 1}: exported slide is embedded")
    check(any(link.get("uri") == live["url"] for link in pdf[-1].get_links()), "Final PDF page has clickable product link")
    target = fitz.Rect(36, 538, 504, 588)
    check(any(link.get("uri") == live["url"] and fitz.Rect(link["from"]).contains(target) for link in pdf[-1].get_links()), "PDF invitation link covers the revised visible CTA")

with fitz.open(ROOT / "demo-storyboard.pdf") as pdf:
    check(len(pdf) == 6, "Six-page 55-second storyboard")
    preview = Image.new("RGB", (1440, 580), "#182338")
    for index, page in enumerate(pdf):
        check("No product video has been generated." in page.get_text(), f"Storyboard page {index + 1}: honest video boundary")
        overflowing = [word[4] for word in page.get_text("words") if word[0] < 24 or word[2] > page.rect.width - 24]
        check(not overflowing, f"Storyboard page {index + 1}: text within horizontal bounds; overflow={overflowing}")
        pixmap = page.get_pixmap(matrix=fitz.Matrix(0.48, 0.48), alpha=False)
        preview.paste(Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples), ((index % 3) * 480 + 9, (index // 3) * 285 + 12))
    preview.save(ROOT / "previews" / "storyboard-contact-sheet.png")

inventory = []
for file in sorted(ROOT.rglob("*")):
    if not file.is_file() or "node_modules" in file.parts or "__pycache__" in file.parts or file.name == "validation.json":
        continue
    inventory.append({"file": file.relative_to(ROOT).as_posix(), "bytes": file.stat().st_size, "sha256": hashlib.sha256(file.read_bytes()).hexdigest()})
report = {"result": "PASS", "checks": len(checks), "summary": checks, "inventory": inventory}
(ROOT / "validation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(f"PASS: {len(checks)} artifact, provenance, financial and PDF checks")
