# Udaan AI product demonstration - Stage 1 only

Planning prepared on 23 November 2026. **Production recording, voice synthesis,
final editing and delivery are not authorized or completed.**

| Review material | Purpose |
| --- | --- |
| [RECORDING_PLAN.md](RECORDING_PLAN.md) | Exact journey, payloads, database effects, no-write limitation and approvals |
| [STORYBOARD.md](STORYBOARD.md) | Proposed 72-second edit and production/rights plan |
| [SCRIPT.md](SCRIPT.md) | Draft narration, pronunciation and trust boundaries |
| [GNANI_RESEARCH.md](GNANI_RESEARCH.md) | Official API findings, pricing/licensing blockers and secure provisioning |
| [VALIDATION.md](VALIDATION.md) | Actual Stage 1 evidence; not final-video QA |
| [scripts/](scripts/) | Reproducible no-write recorder probe and offline-only voice request preparation |

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

## Approval decision needed

Approve **one new synthetic live visitor and the exact six mutation requests**
in RECORDING_PLAN.md, or choose the separately gated isolated-local alternative.
The live app cannot be normally opened under a strict no-database-write policy:
even its initial state GET can create a visitor row. Backend cold starts also
upsert 90 shared synthetic Sale dates; missing dates can be inserted.

Voice approval is separate: confirm account-specific billing and rights first,
then authorize one sample request with a numeric spending cap. Full narration
requires another approval after listening to the sample. No credentials are
requested now. No production AI, infrastructure, public publishing or final PR
is included in this stage.

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
The voice scaffold does not read a key, make requests or generate audio.

Probe binaries remain in session artifacts. Future raw/audio/output directories
are ignored to prevent accidental large-file or unreviewed-asset commits. Decide
binary delivery and verify Git LFS support/quota before production delivery.
