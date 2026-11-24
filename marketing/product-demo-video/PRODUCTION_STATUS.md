# Product demo production status

The current deliverable is an **approved 73-second Sarvam-narrated private final
video**, with portrait and landscape formats,
genuine local footage, SRT, cover and repeatable offline build. The user explicitly
switched providers and approved one request up to Rs5 of existing credits.
It succeeded: original narration is 59.232 seconds, published estimate Rs3.072
excluding GST, actual debit unverified. No further synthesis is authorized.
Both provider credentials were removed. See FINAL_REVIEW.md and SARVAM_RESEARCH.md.

The user selected **Approve the review copy** after the explicit listening and
caption-timing prompt. Final files are in `final-cut-01`; see FINAL_REVIEW.md.
Earlier silent-cut/Gnani sections below
are preserved historical evidence. Gnani's two attempts are exhausted and no
Gnani WAV exists; that is not a blocker to the successful Sarvam edit.
No further production application/database interaction, new paid infrastructure
or public video publication is authorized.

## Genuine source and recording

The source is tag `udaan-final-handoff-2026-11-23`, peeled commit
`de9283e1c8a1d08cf62fd9832e0d14df84749d43`. Post-build verification compared
all **388 archived files byte-for-byte: 388 identical, zero changed/missing**.
`source-integrity.json` preserves that comparison. Archive SHA-256:
`f764c50784b8dcaa47f58ad8703ace29524acafa9941241c62a8598ea838cc2d`.

Application files, schema and configuration were not edited. A compatible
dependency graph was installed outside the repository: 625 packages, with
documented SDK/Babel/Terser substitutions in LOCAL_PREPARATION.md. Prisma and
client remain 6.19.3. This is an **unchanged-source, dependency-compatible local
prototype**, not a lockfile-exact build or deployed evidence.

Original migration `20261122104500_postgres_foundation`, client generation and
Vite 7.3.7 frontend build succeeded. The actual API/frontend used isolated
PostgreSQL 18.6 on `127.0.0.1:55432`, database `udaan_demo_local`, API 4318 and
browser proxy 4317. Provider keys were absent, paid calls disabled, and backend
fetch rejected non-loopback origins. No app API responses or outcomes were
mocked. The owned services are stopped after capture; source and database files
are preserved.

Two complete takes exist. The refined take is **106.160 seconds**, native
432x768 VP9/25fps, 7,527,724 bytes, with 24 genuine screenshots:

`local-demo-02\raw-local-demo.webm`

SHA-256:
`ce7b64a383aa21ef97af36c18993f919926ac9d952467e42c8f829f5b18262cc`.

Its original Playwright file
`page@a601a8c1145a4018c6cb6a3608d9ad6c.webm` is separately preserved unchanged.
Upscaling the native footage does not create additional source detail.

The recorded journey is Discover -> Explore -> Evaluate -> Try -> Measure ->
Learn. Six deliberate local writes were preferences, Demo chat, draft, approve,
start and results; two chat rows and one completed experiment persisted.
Evaluation was a separate calculation request. Session middleware can also
create/update local session context during GET requests: these are not
production-safe reads. Reload confirmed persistence. No reset, profile edit,
paid-provider activation or follow-up experiment was submitted.

Actual native values:

| Item | Recorded value |
| --- | --- |
| Price / variable cost / promotion | Rs99 / Rs45 / Rs1,500 |
| Target and period | 100 total units across seven days |
| Expected contribution | `(99 - 45) * 100 - 1500 = Rs3,900` |
| Illustrative actual result | 70 units; 70% target achievement |
| Actual contribution | `(99 - 45) * 70 - 1500 = Rs2,280` |
| Promotion break-even | 28 total units across the experiment, not daily or extra units |
| Actual learning recommendation | Explore a smaller Rs600 local visibility experiment |

Contribution is **after promotion, before rent, salaries and other overheads**,
not net profit. Visibility is a hypothesis based on illustrative feedback, not
a proven cause. The native Recharts tooltip was opened through real mouse input
and asserted Rs3,900 expected / Rs2,280 actual before editing.

## Visual edit and supporting artifacts

This section documents the preserved **historical silent rough cut**. Current
narrated output and its actual checks are in FINAL_REVIEW.md.

Private artifacts are relative to this session's `files` directory:

| Path | Purpose |
| --- | --- |
| `local-demo-02\recording-evidence.json` | Scene timestamps, sanitized requests, genuine outcome and raw checksum |
| `local-demo-02\screenshots\21-modeled-contribution-tooltip.png` | Native expected/actual tooltip proof |
| `visual-cut-04\udaan-rough-cut-no-narration.mp4` | Current 72-second portrait silent rough cut |
| `visual-cut-04\cover-rough-cut.png` | Financial-model cover, clearly labeled rough/local |
| `visual-cut-04\rough-cut.srt` | Visual-timed captions, **not a spoken narration transcript** |
| `visual-cut-04\edit-decision-list.json` | Actual-source ranges, retiming and crop rectangles |
| `visual-cut-04\validation.json` | Codec, duration, complete-decode and original-preservation checks |
| `visual-cut-04\review.json` | Mobile frame review, visual-caption shape/timing and black-interval check |
| `visual-cut-04\qa-*.png` | Full-size and 390/320px review frames |
| `visual-cut-04\fonts\` | Unmodified OFL fonts and full licenses |
| `source-integrity.json` | Post-build original-source byte comparison |
| `local-runtime\evidence\runtime.json` | Actual loopback runtime/version/provider-isolation proof |

The compositor uses only real recorded scene ranges, temporally retimed.
App values and responses are not replaced. The contribution shot is a tight
crop of the original native tooltip for phone readability, not recreated UI.
Labels burned into every frame disclose **ROUGH CUT / VOICEOVER PENDING** and
**Local prototype / illustrative data**. Photo attribution is retained.
See CREDITS.md for the photograph, CC BY-SA adaptation and OFL notices.

Reviewed export: **72.000s, H.264, 1080x1350, 30fps, yuv420p, no audio**;
complete decode passed and no black intervals were detected at the documented
threshold. Context, finances, native tooltip and recommendation were reviewed
at 390px and 320px; all primary financial values and the Rs600 recommendation
are legible. The 23 visual-caption cues have at most two lines, 36 characters
per line and 18 characters/second.

MP4 SHA-256:
`78ca4634ee5a460a448d996f264e76f2eddfa986dd1f9a9e9c5b29f759d2d3e0`.

Repeatable build from the repository root, with existing Python/FFmpeg:

```powershell
$files = 'C:\absolute\private-session\files'
python marketing\product-demo-video\scripts\build-rough-cut.py `
  --recording "$files\local-demo-02" `
  --fonts "$files\video-fonts" `
  --output "$files\new-reviewed-rough-cut" `
  --ffmpeg 'C:\path\to\ffmpeg.exe'
```

The output directory must be new and outside the repository. Matching
`ffprobe.exe` must be beside FFmpeg. All earlier cuts and raw footage remain
unchanged. No audio, music, sound effect or test waveform is in this export.

## Historical Gnani voice usage, secure input and exhausted gate

### Latest result: 24 November 2026

Browser control was reconfirmed: the local rough-cut video is present, duration
72 seconds, ready state 4, no playback error. No production page was reopened.

The operator completed the separate masked Windows dialog. Its nonsecret
diagnostic report `credential-entry-status-20261124-01.json` confirmed
`configured`, zero API requests during entry and no key logging. The helper now
optionally records only status, controlled failure reason and Windows error
code in a new external JSON file; it never serializes the input or terminal
history. Nine offline workflow tests cover this as well as the earlier gates.

The authorized full-text continuation then returned **HTTP 403 (Forbidden)**.
It used 1,024 characters and saved no WAV:
`gnani-voice-final\voice-usage.json`. Failure category is `http`; no arbitrary
server body, request headers or key were printed/saved. The scoped Windows
credential was deleted after the request. No retry occurred.

Both conservatively counted synthesis attempts are now used: the original
109-character sample with unknown outcome, and the 1,024-character full attempt
with confirmed HTTP 403. Billing remains unverified. HTTP 403 alone does not
establish whether the cause is account/model permission, key scope or a gateway
policy. Gnani API/model access must be checked by the operator before authorizing
any further attempt; the existing approval permits no additional request.

The narrative below preserves the earlier preparation state; pending-key and
one-remaining-attempt statements are historical, not current authorization.

One authorized sample synthesis attempt used 109 characters. It stopped without
a saved WAV; the original HTTP/transport/format cause and billing outcome were
not retained and remain **unknown**. It was not retried. The earlier scoped
Windows credential was deleted. Credential-free HTTPS checks of the provider
root returned HTTP 405 (HEAD) and 403 (GET): these demonstrate reachability only,
not key validity, synthesis success or available credits.

No second synthesis request or full narration exists. The current workflow
preserves safe HTTP/transport-TLS/format-quality categories, refuses redirects
and retries, and saves a valid returned WAV before additional pacing checks.
Eight labeled offline workflow tests and the original 15 offline voice tests
pass; fixtures are never presented as narration. Four local recorder-policy
tests also pass. No actual request or credential collection occurs during tests.

The user authorized commercial generation/sharing, available account-credit use
and autonomous production. Neither a public tariff, account balance nor numeric
monetary cap is independently verified. No new paid infrastructure is allowed.
The ledger permits **two cumulative attempts maximum**: only one remaining
full-text attempt, not another sample. The original failed ledger is immutable.

The separate masked native Windows dialog is awaiting operator input. Paste
only into its **Password** field, not chat or the app. It stores a scoped
logon-session Windows credential; entering it makes no provider request. The
terminal canvas is not certified as a private raw-input/transcript channel.
The operator should review the script and desktop/clipboard privacy beforehand;
Python immutable-string erasure cannot be guaranteed.

To open the reviewed paste-capable native dialog from a **private native Windows
console outside app tool/input history**, run:

```powershell
python marketing\product-demo-video\scripts\gnani-credential.py `
  --target udaan-product-demo-video:c6578777-ac31-408e-b5c8-9b4caa167052:gnani `
  --dialog
```

Omitting `--dialog` uses non-echoing console getpass and fails fatally if TTY or
non-echo input is unavailable. Never pass the key as an argument, write a key/
`.env` file, inspect the clipboard or put the key into chat. `--status` reports
only configured/not-configured, not provider validity.

Default no-call preparation, also supporting explicit `--dry-run`:

```powershell
python marketing\product-demo-video\scripts\generate-narration-workflow.py `
  --sample marketing\product-demo-video\sample.txt `
  --narration marketing\product-demo-video\narration-draft.txt `
  --output 'C:\absolute\private-artifacts\unused-output' --dry-run
```

Only after private entry, use the existing nonsecret task approval and exact
failed-sample ledger with `--previous-attempt` for the one remaining full-text
call. Execution removes the scoped credential even on failure. No automatic
call will occur merely because the operator enters a key.

Remaining work: genuine Gnani WAV, actual speech-synchronized subtitles and
visual timing, audio mix/loudness and pronunciation review, final narrated MP4
and delivery PR. The current rough cut is not claimed to satisfy those items.

## Historical production take

A previously user-authorized production attempt reached evaluation, then draft
creation timed out. Its partial raw video and 11 screenshots remain separately
preserved in `production-demo-20261123-01`; no completed production journey or
finalized production evidence exists. None is used in this local edit. Latest
instructions prohibit further production interaction, including cleanup/reset
requests. No such request was made after that restriction.
