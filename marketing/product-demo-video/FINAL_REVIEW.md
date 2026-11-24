# Private product demo delivery

The genuine local footage now has a **73-second final narrated video**.
This is Sarvam narration following the user's explicit provider switch, not a
successful Gnani export. The user selected **Approve the review copy** after
the listening/pronunciation and caption-timing prompt on 24 November 2026.
Final exports retain local/illustrative disclosures and identify Sarvam as
post-production narration. No video has been publicly published.

## Private assets

Paths are relative to this conversation's private session `files` directory:

| Path | Asset |
| --- | --- |
| `final-cut-01\udaan-linkedin.mp4` | 1080x1350 H.264/AAC, 30fps, 73.000s |
| `final-cut-01\udaan-landscape.mp4` | 1920x1080 H.264/AAC; aspect-preserved picture with branded side panels |
| `final-cut-01\cover.png` | Genuine financial-model cover |
| `final-cut-01\narration.srt` | 28 spoken-text cues with equivalent numeral notation |
| `final-cut-01\mixed-narration.wav` | Edited/loudness-normalized narration derivative |
| `sarvam-voice-01\narration.wav` | Unmodified genuine provider WAV |
| `sarvam-voice-01\voice-usage.json` | One-request receipt, estimate/cap and unknown actual debit |
| `local-demo-02\raw-local-demo.webm` | Unmodified original Playwright recording |
| `final-cut-01\validation.json` | Actual source ranges, checksums, user approval and encoded audio measurements |
| `final-cut-01\qa-*.png` | Full-size, 390px/320px and landscape review frames |
| `udaan-final-private-delivery.zip` | Downloadable final bundle, including originals, both videos, SRT, fonts/licenses, scripts and receipts |

The earlier `narrated-cut-01` review, silent cuts and their private review ZIPs
remain unchanged historical artifacts, not the current final files.

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

Full decode passed for both formats. Portrait export is H.264/yuv420p, 1080x1350, 30fps, with
48kHz AAC. Encoded integrated loudness is **-16.01 LUFS**, true peak **-3.13
dBTP**. The SRT has at most two 36-character lines and **17.86 maximum CPS**.
Financial meaning, actual tooltip values, Rs600 recommendation, caption layout
and closing URL were visually reviewed at 320px and 390px.
The 16:9 version preserves the 4:5 picture at 864x1080 with quiet branded side
panels; no stretching/distortion. Its audio is copied unchanged from the
approved portrait. Landscape layout and final portrait labels were reviewed.
The final portrait's black-interval scan exited successfully with zero intervals
at `d=0.15`, `pix_th=0.02`, `pic_th=0.995`.

**User listening review is approved.** Caption content uses the approved script
with clearly equivalent spoken-number notation. Phrase timing was curated
using real audio pauses and low-confidence offline Microsoft recognition,
not verified word-perfect forced alignment. Native recognizer absolute stream
positions were unavailable; its relative timing output must not be treated
as a global transcript. The user approved pronunciation and caption timing
after the explicit review prompt. Final changes remove only the review label
and add the aspect-preserved secondary format; approved audio/timing is retained.
No further synthesis is authorized or necessary.

MP4 SHA-256:
`d30ac65568a482ee2ea4e4b5b17dd5ddba71e6b488a8ebf78c6f9fb0c1ff220f`.

Landscape SHA-256:
`2619e85641f27352e2cd24d13db20b8e0402f4143ebaeedcca22ac105fd5c062`.

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
  --output "$assets\new-private-final" `
  --ffmpeg 'C:\path\to\ffmpeg.exe' --final-approved --landscape
```

Matching `ffprobe.exe` must be beside FFmpeg. `narration-timing.json` binds this
edit to the genuine audio/request hashes; it is an editorial timing reference,
not a new provider approval. `--final-approved` must only be used after actual
listening approval; omit it for review exports. See SARVAM_RESEARCH.md and CREDITS.md for costs,
credential privacy and rights. The original narration script is
`narration-draft.txt`.

## Delivery boundary

This repository is public. The original brief forbids publishing the final
video publicly; therefore generated media stays in the private conversation
and downloadable review bundle, not in public Git commits or attachments.
The source-only delivery PR contains reusable scripts, credits and retrieval
instructions without publishing the video. Media is delivered through private
conversation attachments. Do not auto-publish to LinkedIn.

Suggested caption, for later authorized publication:

> Small decisions deserve better support. Udaan AI connects business context,
> exploration, financial evaluation and learning through small experiments.
> This illustrative local-prototype walkthrough follows a Rs99 breakfast
> combo from idea to a measured result and a smaller next test. Contribution
> shown is after promotion, before overheads; no real customer impact is claimed.
>
> Visual adaptation: CC BY-SA 4.0. Cropped illustrative serving photo by
> Saind147: [source](https://commons.wikimedia.org/wiki/File:South_Indian_Breakast_Idli_Vada_Sambar_Chutney.JPG).
> [License](https://creativecommons.org/licenses/by-sa/4.0/).
