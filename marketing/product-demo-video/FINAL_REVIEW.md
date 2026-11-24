# Narrated product demo review

The genuine local footage now has a **73-second narrated review copy**.
This is Sarvam narration following the user's explicit provider switch, not a
successful Gnani export. It remains labeled `NARRATED CUT / REVIEW COPY` pending
listening and final sign-off. No final video has been publicly published.

## Private assets

Paths are relative to this conversation's private session `files` directory:

| Path | Asset |
| --- | --- |
| `narrated-cut-01\udaan-narrated-review-cut.mp4` | 1080x1350 H.264/AAC, 30fps, 73.000s |
| `narrated-cut-01\cover.png` | Genuine financial-model cover |
| `narrated-cut-01\narration.srt` | 28 spoken-text cues with equivalent numeral notation |
| `narrated-cut-01\mixed-narration.wav` | Edited/loudness-normalized narration derivative |
| `sarvam-voice-01\narration.wav` | Unmodified genuine provider WAV |
| `sarvam-voice-01\voice-usage.json` | One-request receipt, estimate/cap and unknown actual debit |
| `local-demo-02\raw-local-demo.webm` | Unmodified original Playwright recording |
| `narrated-cut-01\validation.json` | Actual source ranges, checksums and encoded audio measurements |
| `narrated-cut-01\qa-*.png` | Full-size, 390px and 320px review frames |
| `udaan-narrated-private-review-02.zip` | Downloadable private supporting bundle, including originals, SRT, fonts/licenses, scripts and receipts |

The original handoff source remains byte-identical across all 388 archived
files. The environment used external compatible dependencies and isolated
PostgreSQL, not the deployed database. The raw footage is real application
interaction; business context/results are explicitly illustrative.
Recorded Rs3,900/Rs2,280 are contribution after promotion, before overheads.
The genuine next recommendation is a Rs600 local visibility experiment,
not proof of the shortfall's cause.

## Editing and checks

Original audio and footage are preserved. The derivative slows narration 6%
with pitch-preserving `atempo`, inserts four seconds of quiet after approval
for the real Draft -> Approved -> Running screens, adds a short branded
opening/closing, and uses 100ms dissolves. No speech, application response or
financial value was invented/replaced. No music or test waveform is included.

Full decode passed. Portrait export is H.264/yuv420p, 1080x1350, 30fps, with
48kHz AAC. Encoded integrated loudness is **-16.01 LUFS**, true peak **-3.13
dBTP**. The SRT has at most two 36-character lines and **17.86 maximum CPS**.
Financial meaning, actual tooltip values, Rs600 recommendation, caption layout
and closing URL were visually reviewed at 320px and 390px.

**Listening review remains open.** Caption content uses the approved script
with clearly equivalent spoken-number notation. Phrase timing was curated
using real audio pauses and low-confidence offline Microsoft recognition,
not verified word-perfect forced alignment. Native recognizer absolute stream
positions were unavailable; its relative timing output must not be treated
as a global transcript. Check pronunciation (Ravi, Udaan, Bengaluru), financial
numbers, phrase/scene timing and the intentional approval pause while playing
the review copy. No further synthesis is currently authorized or necessary.

MP4 SHA-256:
`addd75e842bed5aedc34fa2be57e2eba336167fe21aac4590b26c18151fb7831`.

## Reproduce without network or provider calls

Use existing Python and FFmpeg; no application runtime/database is needed.
Input folders contain the original recording/evidence, genuine WAV/receipt and
unmodified OFL fonts. The output must be new and outside the repository.

```powershell
$assets = 'C:\absolute\private-session\files'
python marketing\product-demo-video\scripts\build-narrated-cut.py `
  --recording "$assets\local-demo-02" `
  --voice "$assets\sarvam-voice-01" `
  --fonts "$assets\video-fonts" `
  --timing marketing\product-demo-video\narration-timing.json `
  --output "$assets\new-narrated-review" `
  --ffmpeg 'C:\path\to\ffmpeg.exe'
```

Matching `ffprobe.exe` must be beside FFmpeg. `narration-timing.json` binds this
edit to the genuine audio/request hashes; it is an editorial timing reference,
not a new provider approval. See SARVAM_RESEARCH.md and CREDITS.md for costs,
credential privacy and rights. The original narration script is
`narration-draft.txt`.

## Delivery boundary

This repository is public. The original brief forbids publishing the final
video publicly; therefore generated media stays in the private conversation
and downloadable review bundle, not in public Git commits or attachments.
The delivery PR remains deferred until listening/final review; it can contain
the reusable scripts, credits and retrieval instructions without publishing
the video. Do not auto-publish to LinkedIn.

Suggested caption, for later authorized publication:

> Small decisions deserve better support. Udaan AI connects business context,
> exploration, financial evaluation and learning through small experiments.
> This illustrative local-prototype walkthrough follows a Rs99 breakfast
> combo from idea to a measured result and a smaller next test. Contribution
> shown is after promotion, before overheads; no real customer impact is claimed.
