from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
slides = sorted((ROOT / "slides").glob("[0-9][0-9]-*.png"))
if len(slides) != 7:
    raise ValueError("Exactly seven slides are required.")

pdf = canvas.Canvas(str(ROOT / "udaan-linkedin-carousel.pdf"), pagesize=(540, 675))
pdf.setTitle("Udaan AI - Every small business deserves a big possibility")
pdf.setAuthor("Udaan AI")
for index, slide in enumerate(slides):
    pdf.drawImage(ImageReader(str(slide)), 0, 0, width=540, height=675)
    if index == 6:
        pdf.linkURL("https://udaan-ai-builder.replit.app/", (36, 160, 286, 280), relative=0)
    pdf.showPage()
pdf.save()

story = canvas.Canvas(str(ROOT / "demo-storyboard.pdf"), pagesize=(960, 540))
story.setTitle("Udaan AI - 55-second demonstration storyboard (not a generated video)")
frames = [
    ("00-07s", "Ravi's problem", "02-meet-ravi", [
        "Meet Ravi, a fictional breakfast cafe owner.",
        "Fewer weekday customers. No strategy team.",
    ], "Context photo, not a customer testimonial."),
    ("07-15s", "Discover one possibility", "04-discover-to-learn", [
        "Udaan starts with one idea for his shop.",
        "Explore a small, seven-day breakfast test.",
    ], "Release-candidate Home capture; synthetic data."),
    ("15-24s", "Evaluate the INR 99 combo", "05-combo-evaluation", [
        "INR 99 price. INR 45 making cost. INR 54 per combo.",
        "100 combos. INR 1,500 promotion.",
    ], "Release-candidate finance crop; illustrative assumptions."),
    ("24-33s", "See the trade-off", "05-combo-evaluation", [
        "INR 3,900 modeled contribution after promotion.",
        "Break-even: 28 combos across all seven days.",
        "Not net profit; overhead is excluded.",
    ], "Do not call break-even a daily target."),
    ("33-45s", "Let outcomes guide the next test", "06-outcomes-and-learning", [
        "70 combos: INR 2,280. Test local visibility.",
        "130 combos: INR 5,520. Test repeat customers.",
        "100: INR 3,900; repeat cautiously is editorial advice.",
    ], "Modeled scenarios, not real customer impact."),
    ("45-55s", "Invitation", "07-explore-udaan", [
        "Built during Product (Un)Conference 2026 Builders' Day.",
        "Every small business deserves a big possibility.",
        "Explore udaan-ai-builder.replit.app.",
    ], "Genuine live onboarding. No award or endorsement claim."),
]
for time, title, slug, narration, disclosure in frames:
    story.setFillColor(HexColor("#080D18"))
    story.rect(0, 0, 960, 540, fill=1, stroke=0)
    story.drawImage(str(ROOT / "slides" / f"{slug}.png"), 32, 24, width=384, height=480)
    story.setFillColor(HexColor("#55C8FF"))
    story.setFont("Helvetica-Bold", 18)
    story.drawString(456, 485, f"{time}  /  STORYBOARD")
    story.setFillColor(HexColor("#F2F5FA"))
    story.setFont("Helvetica-Bold", 23)
    story.drawString(456, 437, title)
    story.setFont("Helvetica", 14)
    for line_number, line in enumerate(narration):
        story.drawString(456, 373 - line_number * 29, line)
    story.setFillColor(HexColor("#B0BCD0"))
    story.setFont("Helvetica", 11)
    story.drawString(456, 117, disclosure)
    story.drawString(456, 83, "Still-frame recording plan. No product video has been generated.")
    story.showPage()
story.save()
