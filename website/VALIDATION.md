# Showcase validation

Current showcase validation is separate from the recorded application release-candidate results.

The application report at source checkpoint `ebe3c64` records 71 unit/persistence tests, seven browser journeys, lint/typecheck and two production builds. Those historical results were reviewed, not rerun here. No paid provider or speech calls were made.

## Executed showcase checks

- `python website/build.py --check`: passed for both HTML pages, fifteen story sections, local links/anchors, image metadata, documented live URL and the three required financial outcomes.
- Static package build: passed; allowlisted public files only. No application code, runtime database, secrets, scripts or original PNG sources in the deployment package.
- Python/Pillow verified every WebP file; XML parser verified every SVG.
- Pages workflow YAML parsed successfully; PR build has read-only permissions, and publication is a separate manual job requiring the exact confirmation plus `main` ref and the `github-pages` environment.
- `git diff --check`: passed. Changes confined to `website/` and `.github/workflows/pages.yml`.
- Loopback Pages-prefix preview returned HTTP 200 at `/udaan-ai/`, `/desktop` and `/mobile`.
- Built-in browser assertions passed at 1279px desktop, 389px mobile and 359px narrow mobile content widths (nominal 1280/390/360 frames minus frame borders). Checked three exact contributions and different recommendations, four language selections/assets, six journey steps, exclusive pressed states, menu/Escape/anchor closing, verified live CTA and no page-wide horizontal overflow.
- All fourteen image resources were fetched and decoded sequentially in the browser. Sequential resource checks avoid the shared preview transport's concurrent-request failures; these are byte-decode checks, not a performance benchmark.
- Desktop and mobile hero screenshots captured and visually reviewed. Architecture remains horizontally scrollable within its own figure on narrow screens, not the whole page.
- Owner-supplied live product URL `https://udaan-ai-builder.replit.app/` rendered actual Udaan onboarding, all four language choices, “Start the demo” and the synthetic-data notice. Only entry-point availability was verified; no production workflow or paid request was initiated.

## Limits and tooling

Standalone Playwright installation failed first through the configured package feed, then through public PyPI due to network/TLS errors. No certificate checks were disabled. The built-in browser was used instead. Image downloads succeeded from licensed Commons thumbnails; no fake imagery or screenshot generation was used.

Responsive frames are not physical iPhone/Android verification. No full accessibility audit, Lighthouse timing, production storage audit or new paid-provider test was performed. Gallery screenshots remain inherited prototype captures, not newly captured deployed-release screens. Private repository source links require access.

## Publication

No merge, Pages dispatch or visibility change performed. The local preview is available for review; configure required owner reviewers on the Pages environment before an approved publication.
