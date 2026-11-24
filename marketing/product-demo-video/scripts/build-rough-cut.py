"""Build a clearly labeled silent rough cut from verified genuine local footage."""

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import textwrap


# All ranges are resolved from the recorder's real scene timestamps.
SHOTS = [
    ("home", 3, "Context", 65, "Meet Ravi, a fictional cafe owner in Bengaluru."),
    ("fictional-shop-context", 5, "Context", 120, "Start with his business context and the next small decision."),
    ("discover", 4, "Discover", 85, "Discover business possibilities."),
    ("owner-question", 2, "Discover", 70, "Could a Rs99 breakfast combo help?"),
    ("demo-response", 3, "Discover", 90, "Genuine Demo guidance. No paid application AI call."),
    ("guided-opportunity", 3, "Explore", 180, "Move from a question to an opportunity."),
    ("explore-combo", 4, "Explore", 70, "Explore the breakfast combo."),
    ("evaluate-inputs", 5, "Evaluate", 160, "Selling price: Rs99. Variable cost: Rs45."),
    ("budget-and-seven-days", 4, "Evaluate", 190, "Promotion: Rs1,500. Target: 100 units. Seven days."),
    ("contribution-and-break-even", 8, "Evaluate", 70,
     "Rs3,900 contribution after promotion, before overheads. Promotion breaks even at 28 total units."),
    ("draft", 2, "Try", 85, "Create a draft experiment."),
    ("approval-confirmation", 2, "Try", 210, "Approval is a deliberate decision."),
    ("approved", 2, "Try", 100, "Approve first. Then start."),
    ("running-experiment", 2, "Try", 150, "Start the isolated local experiment."),
    ("illustrative-seventy-units", 3, "Measure", 200, "An illustrative result: 70 combos."),
    ("synthetic-disclosure", 2, "Measure", 210, "Clearly marked synthetic data."),
    ("actual-versus-expected", 2, "Measure", 80, "70% of target. Still positive."),
    ("modeled-contribution-tooltip", 3, "Measure", 80,
     "Rs2,280 after promotion, before overheads."),
    ("learning-from-illustrative-result", 3, "Learn", 125,
     "Visibility is a hypothesis, not a proven cause."),
    ("next-six-hundred-rupee-hypothesis", 5, "Learn", 210,
     "Explore a smaller Rs600 local visibility test."),
    ("persisted-learning", 1, "Learn", 125, "Learning saved."),
]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def stamp(seconds, ass=False):
    divisor = 100 if ass else 1000
    ticks = round(seconds * divisor)
    hours, ticks = divmod(ticks, 3600 * divisor)
    minutes, ticks = divmod(ticks, 60 * divisor)
    seconds, fraction = divmod(ticks, divisor)
    return (f"{hours}:{minutes:02}:{seconds:02}.{fraction:02}" if ass
            else f"{hours:02}:{minutes:02}:{seconds:02},{fraction:03}")


def chunks(text):
    result = []
    current = []
    for word in text.split():
        candidate = " ".join([*current, word])
        if len(textwrap.wrap(candidate, width=36, break_long_words=False, break_on_hyphens=False)) > 2:
            result.append(" ".join(current))
            current = []
        current.append(word)
    if current:
        result.append(" ".join(current))
    return result


def ass_text(text):
    return text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")


def overlays(duration, phase, caption, closing=False, status_label="ROUGH CUT / VOICEOVER PENDING"):
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1350
WrapStyle: 2
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Brand,Sora,76,&H00F5EDE8,&H00F5EDE8,&H000D0705,&H000D0705,-1,0,0,0,100,100,0,0,1,0,0,7,48,48,24,1
Style: Caption,DM Sans,44,&H00F5EDE8,&H00F5EDE8,&H000D0705,&H000D0705,0,0,0,0,100,100,0,0,1,0,0,2,64,64,42,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []

    def event(start, end, style, text):
        events.append(f"Dialogue: 0,{stamp(start, True)},{stamp(end, True)},{style},,0,0,0,,{text}")

    event(0, duration, "Brand", r"{\an7\pos(48,25)}Udaan {\c&HFFC65C&}AI")
    event(0, duration, "Brand", r"{\an9\pos(1032,47)\fs32\c&HFFC65C&}" + ass_text(phase.upper()))
    event(0, duration, "Brand", r"{\an9\pos(1032,96)\fs28\c&HA6938C&}" + ass_text(status_label))
    event(0, duration, "Caption", r"{\an5\pos(540,1108)\fs40\b1}Local prototype / illustrative data")
    event(0, duration, "Caption", r"{\an5\pos(540,1161)\fs27\c&HA6938C&}Photo: Saind147 / CC BY-SA 4.0")
    cues = []
    parts = chunks(caption)
    total = sum(len(part) for part in parts)
    cursor = 0
    for index, part in enumerate(parts):
        end = duration if index == len(parts) - 1 else cursor + duration * len(part) / total
        lines = textwrap.wrap(part, width=36, break_long_words=False, break_on_hyphens=False)
        if len(lines) > 2:
            raise ValueError("Caption exceeds the reviewed two-line layout.")
        event(cursor, end, "Caption", r"\N".join(ass_text(line) for line in lines))
        cues.append((cursor, end, "\n".join(lines)))
        cursor = end
    if closing:
        event(0, duration, "Brand", r"{\an5\pos(540,340)\fs106}Udaan {\c&HFFC65C&}AI")
        event(0, duration, "Caption", r"{\an5\pos(540,535)\fs46}Every small business deserves")
        event(0, duration, "Caption", r"{\an5\pos(540,607)\fs66\b1}a big possibility.")
        event(0, duration, "Caption", r"{\an5\pos(540,805)\fs52\c&HFFC65C&}Explore the prototype")
        event(0, duration, "Caption", r"{\an5\pos(540,891)\fs34}udaan-ai-builder.replit.app")
    return header + "\n".join(events) + "\n", cues


def run(args):
    repo = Path(__file__).resolve().parents[3]
    output = args.output.resolve()
    if output == repo or repo in output.parents:
        raise ValueError("Generated media must stay outside the repository.")
    evidence = json.loads((args.recording / "recording-evidence.json").read_text(encoding="utf-8"))
    if evidence["status"] != "complete" or evidence["environment"] != "isolated-local-prototype":
        raise ValueError("Only a completed genuine isolated local recording is accepted.")
    if evidence["outcome"]["actualContribution"] != 2280 or not evidence["outcome"].get("nativeContributionTooltipVerified"):
        raise ValueError("The native contribution tooltip must be verified before editing.")
    name = evidence["video"]["file"]
    if Path(name).name != name:
        raise ValueError("Invalid recorder video filename.")
    raw = args.recording / name
    if digest(raw) != evidence["video"]["sha256"]:
        raise ValueError("Original recording checksum does not match its evidence.")
    for _, duration, phase, _, caption in SHOTS:
        if len(caption) / duration > 18:
            raise ValueError("A caption exceeds the reviewed 18 characters/second limit.")
        overlays(duration, phase, caption)
    output.mkdir()
    (output / "fonts").mkdir()
    (output / "segments").mkdir()
    for name in ("Sora.ttf", "DMSans.ttf", "Sora-OFL.txt", "DMSans-OFL.txt"):
        source = args.fonts / name
        if source.suffix == ".ttf" and source.read_bytes()[:4] not in (b"\x00\x01\x00\x00", b"OTTO"):
            raise ValueError("Invalid font binary.")
        shutil.copy2(source, output / "fonts" / name)
    scenes = {scene["label"]: scene for scene in evidence["scenes"]}
    timeline = []
    subtitles = []
    cursor = 0
    for index, (label, target, phase, crop_y, caption) in enumerate(SHOTS):
        scene = scenes[label]
        start = max(0, scene["startSeconds"] - .2)
        stop = scene["endSeconds"] - .1
        native = stop - start
        ass, cues = overlays(target, phase, caption)
        overlay = f"overlay-{index:02}.ass"
        (output / overlay).write_text(ass, encoding="utf-8-sig")
        segment = f"segments\\{index:02}.mp4"
        crop = (150, 300, 170, 160) if label == "modeled-contribution-tooltip" else (12, crop_y, 408, 384)
        x, y, width, height = crop
        filters = (f"crop={width}:{height}:{x}:{y},scale=984:-2:flags=lanczos,"
                   f"setsar=1,setpts={target / native:.9f}*(PTS-STARTPTS),fps=30,"
                   f"pad=1080:1350:48:140:color=0x05070D,ass={overlay}:fontsdir=fonts")
        subprocess.run([str(args.ffmpeg), "-v", "error", "-nostdin", "-ss", str(start),
                        "-t", str(native), "-i", str(raw), "-an", "-vf", filters,
                        "-t", str(target), "-c:v", "libx264", "-preset", "fast",
                        "-crf", "20", "-pix_fmt", "yuv420p", segment], cwd=output, check=True)
        timeline.append({"scene": label, "raw_start": start, "raw_end": stop,
                         "edit_start": cursor, "edit_end": cursor + target,
                         "source_crop": {"x": x, "y": y, "width": width, "height": height}})
        subtitles.extend((cursor + a, cursor + b, text) for a, b, text in cues)
        cursor += target
    closing = 4
    ass, cues = overlays(closing, "Possibility", "Discover. Explore. Evaluate. Try. Measure. Learn.", closing=True)
    (output / "closing.ass").write_text(ass, encoding="utf-8-sig")
    subprocess.run([str(args.ffmpeg), "-v", "error", "-nostdin", "-f", "lavfi",
                    "-i", f"color=c=0x05070D:s=1080x1350:r=30:d={closing}",
                    "-vf", "ass=closing.ass:fontsdir=fonts", "-an", "-c:v", "libx264",
                    "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
                    "segments\\closing.mp4"], cwd=output, check=True)
    subtitles.extend((cursor + a, cursor + b, text) for a, b, text in cues)
    cursor += closing
    files = [f"segments\\{index:02}.mp4" for index in range(len(SHOTS))] + ["segments\\closing.mp4"]
    (output / "concat.txt").write_text("\n".join(f"file '{file}'" for file in files) + "\n", encoding="ascii")
    target = output / "udaan-rough-cut-no-narration.mp4"
    subprocess.run([str(args.ffmpeg), "-v", "error", "-nostdin", "-f", "concat",
                    "-safe", "0", "-i", "concat.txt", "-c", "copy", "-movflags", "+faststart",
                    target.name], cwd=output, check=True)
    (output / "rough-cut.srt").write_text("\n\n".join(
        f"{index}\n{stamp(start)} --> {stamp(end)}\n{text}"
        for index, (start, end, text) in enumerate(subtitles, 1)
    ) + "\n", encoding="utf-8")
    (output / "edit-decision-list.json").write_text(json.dumps({
        "status": "rough-cut-without-narration", "duration_seconds": cursor,
        "original_video_sha256": evidence["video"]["sha256"], "timeline": timeline,
        "captions": "Synchronized to the visual rough cut, not a generated voice transcript.",
        "retiming": "Genuine source footage temporally retimed; no app responses or UI values replaced.",
    }, indent=2) + "\n", encoding="utf-8")
    probe = args.ffmpeg.with_name("ffprobe.exe")
    info = json.loads(subprocess.check_output([str(probe), "-v", "error",
        "-show_entries", "format=duration:stream=codec_name,width,height,pix_fmt,r_frame_rate,codec_type",
        "-of", "json", str(target)]))
    stream = info["streams"][0]
    duration = float(info["format"]["duration"])
    if (stream["width"], stream["height"], stream["codec_name"], stream["pix_fmt"],
        stream["r_frame_rate"]) != (1080, 1350, "h264", "yuv420p", "30/1") \
            or not 60 <= duration <= 75 or abs(duration - cursor) > .05 \
            or any(item["codec_type"] == "audio" for item in info["streams"]):
        raise ValueError("Rough-cut codec, timing or no-audio validation failed.")
    subprocess.run([str(args.ffmpeg), "-v", "error", "-nostdin", "-i", str(target),
                    "-f", "null", "-"], check=True)
    for second, stem in ((2, "context"), (36, "finance"), (57, "actual-contribution"), (64, "recommendation")):
        subprocess.run([str(args.ffmpeg), "-v", "error", "-nostdin", "-ss", str(second),
                        "-i", str(target), "-frames:v", "1", str(output / f"qa-{stem}.png")], check=True)
        for width in (390, 320):
            subprocess.run([str(args.ffmpeg), "-v", "error", "-nostdin", "-ss", str(second),
                            "-i", str(target), "-vf", f"scale={width}:-1", "-frames:v", "1",
                            str(output / f"qa-{stem}-{width}px.png")], check=True)
    shutil.copy2(output / "qa-finance.png", output / "cover-rough-cut.png")
    validation = {"status": "rough-cut-only-not-final-Gnani-video", "duration": duration,
                  "codec": stream, "decoded_complete": True, "audio_streams": 0,
                  "output_sha256": digest(target), "raw_preserved": digest(raw) == evidence["video"]["sha256"]}
    (output / "validation.json").write_text(json.dumps(validation, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(validation, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--recording", type=Path, required=True)
    parser.add_argument("--fonts", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--ffmpeg", type=Path, required=True)
    run(parser.parse_args())
