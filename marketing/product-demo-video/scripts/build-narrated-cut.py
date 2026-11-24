"""Build a private narrated edit without network or provider calls."""

import argparse
import importlib.util
import json
from pathlib import Path
import re
import shutil
import subprocess
import textwrap

spec = importlib.util.spec_from_file_location("rough", Path(__file__).with_name("build-rough-cut.py"))
rough = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rough)


def edit_time(raw, timing):
    return (timing["intro_seconds"] + raw / timing["tempo"] +
            (timing["inserted_pause_seconds"] if raw >= timing["pause_at_raw_seconds"] else 0))


def captions(timing):
    result = []
    previous = 0
    for start, end, text in timing["cues"]:
        lines = textwrap.wrap(text, width=36, break_long_words=False, break_on_hyphens=False)
        a, b = edit_time(start, timing), edit_time(end, timing)
        if start < previous or end <= start or len(lines) > 2 or \
                len(text) / (b - a) > 18 or b > timing["duration_seconds"]:
            raise ValueError("Invalid, overlapping or unreadable narration caption.")
        result.append((a, b, "\n".join(lines)))
        previous = end
    return result


def scenes(timing):
    # These are genuine raw-scene identifiers, not replacement application screens.
    stops = [
        ("home", 3.01), ("fictional-shop-context", 7.53),
        ("discover", 12.88), ("owner-question", 14.85), ("demo-response", 17.35),
        ("guided-opportunity", 18.64), ("explore-combo", 19.98),
        ("evaluate-inputs", 22.05), ("budget-and-seven-days", 24.06),
        ("contribution-and-break-even", 33.36),
    ]
    result = [("opening", timing["intro_seconds"], "Possibility")]
    for name, stop in stops:
        result.append((name, edit_time(stop, timing), None))
    try_start, try_end = edit_time(33.36, timing), edit_time(35.0, timing)
    for i, name in enumerate(("draft", "approval-confirmation", "approved", "running-experiment"), 1):
        result.append((name, try_start + (try_end - try_start) * i / 4, None))
    for name, stop in (
        ("illustrative-seventy-units", 37.40), ("synthetic-disclosure", 38.60),
        ("actual-versus-expected", 39.71), ("modeled-contribution-tooltip", 43.31),
        ("learning-from-illustrative-result", 45.05),
        ("next-six-hundred-rupee-hypothesis", 49.35), ("persisted-learning", 50.58),
        ("discover", 51.535), ("explore-combo", 52.481),
        ("contribution-and-break-even", 53.425), ("approved", 54.126),
        ("modeled-contribution-tooltip", 54.925), ("next-six-hundred-rupee-hypothesis", 55.747),
    ):
        result.append((name, edit_time(stop, timing), None))
    result.append(("closing", timing["duration_seconds"], "Possibility"))
    return [(name, round(stop * 30) / 30, phase) for name, stop, phase in result]


def invoke(ffmpeg, arguments, output, capture=False):
    command = [str(ffmpeg), "-nostdin", *arguments]
    if capture:
        return subprocess.run(command, cwd=output, check=True, capture_output=True, text=True).stderr
    subprocess.run(command, cwd=output, check=True)


def loudness(stderr):
    blocks = re.findall(r'\{\s*"input_i".*?\}', stderr, re.S)
    if not blocks:
        raise ValueError("FFmpeg did not return loudness measurements.")
    return json.loads(blocks[-1])


def run(args):
    timing = json.loads(args.timing.read_text(encoding="utf-8"))
    cues = captions(timing)
    audio = args.voice / "narration.wav"
    usage = json.loads((args.voice / "voice-usage.json").read_text(encoding="utf-8"))
    evidence = json.loads((args.recording / "recording-evidence.json").read_text(encoding="utf-8"))
    if usage["status"] != "complete" or usage["provider"] != "Sarvam" or \
            rough.digest(audio) != timing["audio_sha256"] or \
            usage["requests"][0]["audio_sha256"] != timing["audio_sha256"] or \
            usage["requests"][0]["text_sha256"] != timing["script_sha256"]:
        raise ValueError("Narration must match the successful authorized request and timing reference.")
    if evidence["status"] != "complete" or evidence["environment"] != "isolated-local-prototype" or \
            evidence["outcome"]["actualContribution"] != 2280 or \
            not evidence["outcome"]["nativeContributionTooltipVerified"]:
        raise ValueError("A completed, verified genuine local take is required.")
    filename = evidence["video"]["file"]
    if Path(filename).name != filename:
        raise ValueError("Invalid raw recording filename.")
    raw = args.recording / filename
    if rough.digest(raw) != evidence["video"]["sha256"]:
        raise ValueError("Original recording integrity failed.")
    output = args.output.resolve()
    repo = Path(__file__).resolve().parents[3]
    if output == repo or repo in output.parents:
        raise ValueError("Generated media must remain outside the repository.")
    output.mkdir()
    (output / "segments").mkdir()
    shutil.copytree(args.fonts, output / "fonts")
    shutil.copy2(args.timing, output / "narration-timing.json")
    source_scenes = {scene["label"]: scene for scene in evidence["scenes"]}
    settings = {name: (phase, y) for name, _, phase, y, _ in rough.SHOTS}
    timeline = []
    files = []
    cursor = 0
    for index, (name, stop, phase) in enumerate(scenes(timing)):
        target = stop - cursor
        duration = target + (0.1 if name != "closing" else 0)
        phase, y = settings.get(name, (phase, 0))
        ass, _ = rough.overlays(duration, phase, "", closing=name == "closing",
                                status_label=("SARVAM POST-PRODUCTION NARRATION" if args.final_approved
                                              else "NARRATED CUT / REVIEW COPY"))
        if name == "opening":
            ass += (f"Dialogue: 0,0:00:00.00,{rough.stamp(duration, True)},Brand,,0,0,0,,"
                    r"{\an5\pos(540,390)\fs106}Udaan {\c&HFFC65C&}AI" + "\n" +
                    f"Dialogue: 0,0:00:00.00,{rough.stamp(duration, True)},Caption,,0,0,0,,"
                    r"{\an5\pos(540,620)\fs60}A better next step." + "\n")
        overlay = f"scene-{index:02}.ass"
        (output / overlay).write_text(ass, encoding="utf-8-sig")
        file = f"segments\\{index:02}.mp4"
        common = ["-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                  "-pix_fmt", "yuv420p", "-threads", "2", "-t", str(duration), file]
        item = {"scene": name, "edit_start": cursor, "edit_end": stop, "phase": phase}
        if name in ("opening", "closing"):
            invoke(args.ffmpeg, ["-v", "error", "-f", "lavfi", "-i",
                   f"color=c=0x05070D:s=1080x1350:r=30:d={duration}",
                   "-vf", f"ass={overlay}:fontsdir=fonts", *common], output)
        else:
            scene = source_scenes[name]
            start, end = max(0, scene["startSeconds"] - .2), scene["endSeconds"] - .1
            crop = (150, 300, 170, 160) if name == "modeled-contribution-tooltip" else (12, y, 408, 384)
            x, y, width, height = crop
            filters = (f"crop={width}:{height}:{x}:{y},scale=984:-2:flags=lanczos,setsar=1,"
                       f"setpts={duration / (end - start):.9f}*(PTS-STARTPTS),fps=30,"
                       f"pad=1080:1350:48:140:color=0x05070D,ass={overlay}:fontsdir=fonts")
            invoke(args.ffmpeg, ["-v", "error", "-ss", str(start), "-t", str(end - start),
                                "-i", str(raw), "-vf", filters, *common], output)
            item.update(raw_start=start, raw_end=end, source_crop=list(crop))
        timeline.append(item)
        files.append(file)
        cursor = stop
    header, _ = rough.overlays(timing["duration_seconds"], "Possibility", "")
    header = header.split("[Events]")[0] + "[Events]\n" + \
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    for a, b, text in cues:
        header += (f"Dialogue: 0,{rough.stamp(a, True)},{rough.stamp(b, True)},Caption,,0,0,0,,"
                   + r"\N".join(rough.ass_text(line) for line in text.splitlines()) + "\n")
    (output / "spoken-captions.ass").write_text(header, encoding="utf-8-sig")
    (output / "narration.srt").write_text("\n\n".join(
        f"{i}\n{rough.stamp(a)} --> {rough.stamp(b)}\n{text}" for i, (a, b, text) in enumerate(cues, 1)
    ) + "\n", encoding="utf-8")
    pause, tempo = timing["pause_at_raw_seconds"], timing["tempo"]
    mix = (f"[0:a]asplit[a][b];[a]atrim=end={pause},asetpts=PTS-STARTPTS,atempo={tempo}[first];"
           f"[b]atrim=start={pause},asetpts=PTS-STARTPTS,atempo={tempo}[last];"
           f"anullsrc=r=48000:cl=mono,atrim=duration={timing['inserted_pause_seconds']}[gap];"
           f"[first][gap][last]concat=n=3:v=0:a=1,adelay={round(timing['intro_seconds'] * 1000)}:all=1,"
           f"apad,atrim=duration={timing['duration_seconds']}[mix]")
    invoke(args.ffmpeg, ["-v", "error", "-i", str(audio), "-filter_complex", mix,
                        "-map", "[mix]", "-ar", "48000", "-c:a", "pcm_s16le", "paced-narration.wav"], output)
    measured = loudness(invoke(args.ffmpeg, ["-v", "info", "-i", "paced-narration.wav",
        "-af", "loudnorm=I=-16:TP=-2:LRA=11:print_format=json", "-f", "null", "-"], output, True))
    normalizer = ("loudnorm=I=-16:TP=-2:LRA=11:linear=true:print_format=json:"
                  f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:"
                  f"measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}:"
                  f"offset={measured['target_offset']}")
    invoke(args.ffmpeg, ["-v", "error", "-i", "paced-narration.wav", "-af", normalizer,
                        "-ar", "48000", "-c:a", "pcm_s16le", "mixed-narration.wav"], output)
    command = ["-v", "error", "-filter_complex_threads", "2"]
    for file in files:
        command += ["-threads", "1", "-i", file]
    command += ["-i", "mixed-narration.wav"]
    filters = []
    for i in range(len(files)):
        filters.append(f"[{i}:v]settb=AVTB,setpts=PTS-STARTPTS[v{i}]")
    previous = "v0"
    for i in range(1, len(files)):
        label = f"fade{i}"
        filters.append(f"[{previous}][v{i}]xfade=transition=fade:duration=0.1:"
                       f"offset={timeline[i]['edit_start']:.6f}[{label}]")
        previous = label
    filters.append(f"[{previous}]ass=spoken-captions.ass:fontsdir=fonts[video]")
    target = "udaan-linkedin.mp4" if args.final_approved else "udaan-narrated-review-cut.mp4"
    invoke(args.ffmpeg, [*command, "-filter_complex", ";".join(filters),
        "-map", "[video]", "-map", f"{len(files)}:a", "-t", str(timing["duration_seconds"]),
        "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-threads", "2",
        "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart", target], output)
    invoke(args.ffmpeg, ["-v", "error", "-i", target, "-f", "null", "-"], output)
    probe = json.loads(subprocess.check_output([str(args.ffmpeg.with_name("ffprobe.exe")),
        "-v", "error", "-show_format", "-show_streams", "-of", "json", str(output / target)]))
    video = next(s for s in probe["streams"] if s["codec_type"] == "video")
    sound = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    if (video["width"], video["height"], video["codec_name"], video["pix_fmt"], video["r_frame_rate"]) \
            != (1080, 1350, "h264", "yuv420p", "30/1") or \
            sound["codec_name"] != "aac" or sound["sample_rate"] != "48000" or \
            abs(float(probe["format"]["duration"]) - timing["duration_seconds"]) > .06:
        raise ValueError("Narrated codec/duration validation failed.")
    final_audio = loudness(invoke(args.ffmpeg, ["-v", "info", "-i", target,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-vn", "-f", "null", "-"], output, True))
    if abs(float(final_audio["input_i"]) + 16) > .5 or float(final_audio["input_tp"]) > -1.5:
        raise ValueError("Encoded loudness/true peak is outside the delivery range.")
    for second, label in ((3, "context"), (31, "finance"), (49, "actual"), (56, "learning"), (67, "closing")):
        for width in (1080, 390, 320):
            invoke(args.ffmpeg, ["-v", "error", "-ss", str(second), "-i", target,
                   "-vf", f"scale={width}:-2", "-frames:v", "1", f"qa-{label}-{width}.png"], output)
    shutil.copy2(output / "qa-finance-1080.png", output / "cover.png")
    report = {"status": ("final-private-narrated-user-reviewed" if args.final_approved
                         else "narrated-review-copy-listening-review-pending"),
              "listening_approval": ("User selected Approve the review copy on 24 November 2026."
                                    if args.final_approved else "pending"),
              "duration": probe["format"]["duration"],
              "provider_requests_during_edit": 0, "raw_video_sha256": rough.digest(raw),
              "raw_audio_sha256": rough.digest(audio), "output_sha256": rough.digest(output / target),
              "caption_method": timing["method"], "encoded_loudness": final_audio,
              "caption_count": len(cues), "max_caption_cps": max(len(t.replace("\n", " ")) / (b-a) for a,b,t in cues),
              "decoded_complete": True, "timeline": timeline,
              "editing": "6% pitch-preserving tempo reduction; four-second approval pause; 100ms dissolves; original media untouched."}
    if args.landscape:
        landscape_ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Side,Sora,40,&H00F5EDE8,&H00F5EDE8,&H000D0705,&H000D0705,0,0,0,0,100,100,0,0,1,0,0,7,64,64,64,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        finish = rough.stamp(timing["duration_seconds"], True)
        for text in (
            r"{\pos(64,140)\fs68}Udaan {\c&HFFC65C&}AI",
            r"{\pos(64,330)}Small decisions.\NInformed experiments.",
            r"{\pos(1455,155)\fs36\c&HFFC65C&}DISCOVER\N\NEXPLORE\N\NEVALUATE\N\NTRY\N\NMEASURE\N\NLEARN",
        ):
            landscape_ass += f"Dialogue: 0,0:00:00.00,{finish},Side,,0,0,0,,{text}\n"
        (output / "landscape.ass").write_text(landscape_ass, encoding="utf-8-sig")
        invoke(args.ffmpeg, ["-v", "error", "-i", target, "-vf",
            "scale=864:1080:flags=lanczos,pad=1920:1080:528:0:color=0x05070D,ass=landscape.ass:fontsdir=fonts",
            "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-threads", "2",
            "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", "udaan-landscape.mp4"], output)
        invoke(args.ffmpeg, ["-v", "error", "-i", "udaan-landscape.mp4", "-f", "null", "-"], output)
        landscape_info = json.loads(subprocess.check_output([
            str(args.ffmpeg.with_name("ffprobe.exe")), "-v", "error", "-show_streams",
            "-show_format", "-of", "json", str(output / "udaan-landscape.mp4")]))
        picture = next(s for s in landscape_info["streams"] if s["codec_type"] == "video")
        if (picture["width"], picture["height"], picture["codec_name"], picture["pix_fmt"]) \
                != (1920, 1080, "h264", "yuv420p") or \
                abs(float(landscape_info["format"]["duration"]) - timing["duration_seconds"]) > .06:
            raise ValueError("Landscape geometry/codec/timing failed.")
        report["landscape"] = {"sha256": rough.digest(output / "udaan-landscape.mp4"),
                               "aspect": "4:5 picture preserved at 864x1080; branded side panels, no stretching",
                               "decoded_complete": True}
        invoke(args.ffmpeg, ["-v", "error", "-ss", "49", "-i", "udaan-landscape.mp4",
                            "-frames:v", "1", "qa-landscape.png"], output)
    (output / "validation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k != "timeline"}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("recording", "voice", "fonts", "timing", "output", "ffmpeg"):
        parser.add_argument("--" + name, type=Path, required=True)
    parser.add_argument("--final-approved", action="store_true",
                        help="Only after the operator has obtained listening/final review approval.")
    parser.add_argument("--landscape", action="store_true")
    run(parser.parse_args())
