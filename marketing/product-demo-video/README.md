# Udaan AI product demonstration

The genuine local journey now has a **73-second Sarvam-narrated review copy**,
cover, spoken-text SRT and repeatable offline FFmpeg build. The user explicitly
switched providers; one approved request produced a genuine 59.232-second WAV.
No further API call is authorized or needed. Listening/final sign-off remains
open; the video is not publicly published. The earlier silent cut and exhausted
Gnani attempts are preserved, not overwritten.

See [PRODUCTION_STATUS.md](PRODUCTION_STATUS.md) for current evidence, artifact
paths and blockers. Earlier planning gates below are historical where later
direct user authorization superseded them.

See [FINAL_REVIEW.md](FINAL_REVIEW.md) for the current narrated assets, actual QA,
private delivery boundary and build command, and
[SARVAM_RESEARCH.md](SARVAM_RESEARCH.md) for the official API, cost and rights.

| Review material | Purpose |
| --- | --- |
| [RECORDING_PLAN.md](RECORDING_PLAN.md) | Exact journey, payloads, database effects, no-write limitation and approvals |
| [STORYBOARD.md](STORYBOARD.md) | Proposed 72-second edit and production/rights plan |
| [SCRIPT.md](SCRIPT.md) | Draft narration, pronunciation and trust boundaries |
| [GNANI_RESEARCH.md](GNANI_RESEARCH.md) | Official API findings, pricing/licensing blockers and secure provisioning |
| [VALIDATION.md](VALIDATION.md) | Actual Stage 1 evidence; not final-video QA |
| [LOCAL_PREPARATION.md](LOCAL_PREPARATION.md) | Option B source integrity, historical blocker and successful external dependency adaptation |
| [PRODUCTION_STATUS.md](PRODUCTION_STATUS.md) | Actual runtime, footage, rough-cut evidence and remaining voice blocker |
| [CREDITS.md](CREDITS.md) | Photograph, artwork and OFL typography attribution |
| [scripts/](scripts/) | Genuine local runtime/recorder, rough-cut compositor and default-no-call Gnani generator |

## Source of truth

- Requested tag `udaan-final-handoff-2026-11-23`: tag object
  `1c828b2379fb91e4b281ecb7519390da77c587a2`; peeled commit
  **`de9283e1c8a1d08cf62fd9832e0d14df84749d43`**.
- Read [final handoff](https://github.com/amit1858/udaan-ai/blob/de9283e1c8a1d08cf62fd9832e0d14df84749d43/docs/FINAL_HANDOFF.md)
  and [external restoration](https://github.com/amit1858/udaan-ai/blob/de9283e1c8a1d08cf62fd9832e0d14df84749d43/docs/RESTORE_OUTSIDE_REPLIT.md).
  They supersede older "unpublished"/SQLite/provider statements elsewhere.
- Current branch starts from main `a477deec7ffa85474365b36a05ddc65369e1e8da`,
  **not** from that handoff. Tagged application files were inspected separately,
  without merging or changing application source. A later local demo must use the
  exact handoff tree, not accidentally run main.
- Carousel source: [PR #2](https://github.com/amit1858/udaan-ai/pull/2),
  `bb7843750a28a8f9cdc55290f68c8d4eb67b516a`, branch
  `amit1858-udaan-linkedin-launch-kit`. Its README, storyboard, credits, evidence
  and validation were reviewed read-only. No carousel worktree changes or merge.
- The complete supplied 669-line brief remains attached to this session, with
  a byte-preserving session-files copy named `MASTER_BRIEF.txt`.
  SHA-256: `d37e0be9b0f2a1b8e264639cd39626745781e99ef028f6996501cb53ed22d275`.

The requested branch was `feature/udaan-product-demo-video`. App-managed rename
enforced **`amit1858-feature/udaan-product-demo-video`**. No raw Git rename,
history rewrite, release-tag change or deployment was performed.

## Current boundary

The latest user direction prohibits further production application/database
changes and new paid infrastructure. The successful local build uses unchanged
tagged source and an external compatibility dependency graph; it is **not a
lockfile-exact or deployed artifact**. No application API responses were mocked.

The paragraphs below preserve the **earlier Gnani authorization/history**, not
the current Sarvam result. For Sarvam, the explicit one-request ceiling was
Rs5 of existing credits; the published estimate is Rs3.072 excluding GST and
actual debit is unverified. Both scoped credentials were removed.

The user separately authorized Gnani account-credit use, commercial narration sharing
and autonomous sample/full production. No Gnani tariff, account balance or monetary
ceiling is claimed verified. One sample attempt failed without a saved WAV;
its HTTP/billing outcome is unknown and it was not retried. The subsequent
full-text attempt returned HTTP 403 and produced no WAV. Corrected diagnostics
now preserve safe categories, and a validated WAV is preserved before additional
pacing checks. A continuation permits only the remaining full-text attempt,
not another sample, within two cumulative synthesis attempts. Those attempts
are now used; no further request is authorized by that approval.

The separate masked Windows dialog stores an entered key in temporary encrypted
Windows Credential Manager. No key goes into chat, arguments, `.env`, source
or assets. Entry makes no API call. The scoped key was deleted after the
forbidden response. The final narrated MP4 and delivery PR remain
incomplete; there is no LinkedIn autopublishing.

## Reproduce Stage 1 checks

Use an existing Node 20+ runtime and Chromium. Install only this isolated tool
package, not application dependencies:

```powershell
npm.cmd --prefix marketing\product-demo-video\scripts ci --ignore-scripts --no-audit --no-fund
$env:CHROMIUM_PATH = 'C:\path\to\chrome.exe'
$env:PROBE_OUTPUT = 'C:\absolute\private-artifacts\recording-proof'
node marketing\product-demo-video\scripts\recording-probe.mjs
python marketing\product-demo-video\scripts\test-prepare-voiceover.py
python marketing\product-demo-video\scripts\prepare-voiceover.py --input marketing\product-demo-video\sample.txt --output C:\absolute\private-artifacts\sample-request.json
```

The probe allows only same-origin static app files, blocks **all APIs**, external
requests and service workers, and records a separate offline recorder test card.
It never fulfills an app API with synthetic data or enters Demo. Its app image
is a deliberately restricted loading/warning state, **not production footage**.
The Stage 1 offline preparer does not read a key, make requests or generate audio.
The reusable `generate-voiceover.py` also defaults to no-call preparation; its
opt-in execution and private-console approval requirements are documented in
GNANI_RESEARCH.md. Its historical no-call evidence predates the later failed
sample attempt described in PRODUCTION_STATUS.md.

Probe binaries remain in session artifacts. Future raw/audio/output directories
are ignored to prevent accidental large-file or unreviewed-asset commits. Decide
binary delivery and verify Git LFS support/quota before production delivery.
