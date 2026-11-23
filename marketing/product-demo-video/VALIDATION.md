# Stage 1 evidence and limits

Checked 23 November 2026. **This is not final-video QA.** No product recording,
Gnani sample/full narration, SRT, final MP4 or production build is claimed.

## Verified work

| Check | Result |
| --- | --- |
| Raw brief | Read all 669 lines; original attachment retained; byte-preserving `MASTER_BRIEF.txt` copy in session files; SHA-256 in README |
| Git source | Remote tag resolves to tag object `1c828b2379fb91e4b281ecb7519390da77c587a2`, peeled commit `de9283e1c8a1d08cf62fd9832e0d14df84749d43`; main and carousel refs checked separately |
| Scope | New files only under `marketing/product-demo-video/`; no application, API, schema, deployment, Pages, release-tag or existing carousel edits |
| Actual static deployment | HTTPS root 200, title Udaan AI; current JS/CSS retrieved; workflow markers present |
| Strict no-write browser pass | Only root, same-origin JS/CSS/favicon forwarded; application APIs and external calls blocked; no clicks; no fabricated API responses |
| Recorder | Real neutral offline card recorded, full decode succeeded; final probe 432 x 768 VP9, 25 fps, 4.080 seconds, 101,386 bytes |
| Visual probe review | Extracted frame at 2 seconds inspected; clear "RECORDER PROBE / Not Udaan application footage / No product outcomes" and changing counter; no padding after correction |
| Local encoder availability | Installed FFmpeg 9.1 exposes `libx264` and AAC; ffprobe works; no final H.264/AAC export performed |
| Offline voice scaffold | Three tests pass: WAV request preparation, invalid cross-model voice, empty script; sample request JSON prepared locally without reading credentials/network |
| Script pacing | 142 words / 1,024 trimmed characters; sample 18 words / 109 characters; speech-duration estimates only |
| Financial verification | 54/unit; 70/100/130 -> 2,280/3,900/5,520 after promotion; 27 -> -42, 28 -> +12; source uses integer paise and excludes overhead |

## Persisted session-only evidence

All paths below are relative to this session's `files` directory. They are
available to the coordinating session for review; not public delivery links:

- `MASTER_BRIEF.txt` - complete raw instruction preservation.
- `recording-proof/probe-evidence.json` - allowed/blocked network paths,
  frontend markers, UTC inspection time and neutral-probe metadata.
- `recording-proof/api-blocked-entry.png` - intentionally restricted app
  loading/warning screenshot; **not a normal deployed onboarding capture**.
- `recording-proof/recorder-probe.webm` - genuine local technical probe,
  **not Udaan product footage**.
- `recording-proof/probe-frame.png` - visually reviewed decoded probe frame.
- `sample-request-draft.json` - offline, credential-free API request design.
- `source-review/` - selected read-only files extracted from the handoff tag;
  not a runnable checkout or database backup.

Final neutral WebM SHA-256:
`3d81cf3c75645e4910a5154d7670a317b20e02a736f4ee9844ae5f265b4e00b6`.

Probe evidence JSON SHA-256:
`b557bf4082a0b73fbd050496a67e5ae443f50195cec1f9478ed1bfd55ee7bae8`.

Combined retrieved JS text (main bundle plus Workbox helper) SHA-256:
`5ae083e893f06f57f3b8686cd478d14ca17cf628f08af804fe3f92930c47debf`.
This is the probe's aggregate fingerprint, **not** a serving commit identity.
The absent frontend string `spending_disabled` does not prove provider status.
No application API/mutation request was forwarded. Database internals and
platform background/startup activity were not observed: the tagged API seeds
90 Sale dates at process startup, so the evidence does not establish zero
incidental server-side writes or zero infrastructure cost.

## Reproducible checks performed

`scripts/recording-probe.mjs` ran with existing Chromium and its output outside
the repository. Playwright was initially missing; only the isolated scripts
package was installed after that failure, with install scripts disabled.
Application dependencies were not installed and application tests were not run
against the live site.

```powershell
python marketing\product-demo-video\scripts\test-prepare-voiceover.py
python marketing\product-demo-video\scripts\prepare-voiceover.py --input marketing\product-demo-video\sample.txt --output C:\private-artifacts\sample-request.json
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -show_entries format=duration,size -of json C:\private-artifacts\recorder-probe.webm
ffmpeg -v error -i C:\private-artifacts\recorder-probe.webm -f null NUL
```

Paths in the command examples are operator-selected placeholders; the actual
probe used this session's `files/recording-proof` directory. No daemon/helper
server remains running.

## Not verified / next approval gates

- Current backend provider configuration, ordinary fresh onboarding and full
  deployed journey remain untested because even status GETs initialize sessions.
- Tagged backend/deployed frontend markers are consistent, not a serving-SHA
  attestation. Stop on any actual flow divergence after authorization.
- High-resolution native mobile video is not established by deviceScaleFactor.
  Later product mobile readability must pass; local probe text is not a proxy
  for real dense product UI.
- No local PostgreSQL, same-origin hosting wrapper or full local app was
  provisioned. The local alternative is a gated plan, not completed restoration.
- Gnani credit eligibility, numeric billing rate/cap, commercial audio rights,
  applicable terms, actual pronunciation, latency, request length and account
  limits require confirmation. Terminal secret-input privacy is unverified.
- Photo/video share-alike scope and compatibility with audio-distribution terms
  require a rights decision before reusing licensed assets in final production.
- Stage 2 live-data approval does not authorize paid inference, a new take,
  reset/cleanup, production configuration, public publishing or full narration.
