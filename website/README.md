# Udaan showcase

Separate static product case study. No application, API, Prisma, database or PWA changes.

## Source and boundaries

GitHub main contained the complete reviewed application source at `ebe3c64ba7db318749e4839478a5074d59f7a886` when work began. The repository was verified **private**. The owner later supplied **https://udaan-ai-builder.replit.app/**, and its actual Udaan onboarding screen was browser-verified on 22 November 2026. The final demo CTA now uses that exact URL. No deployed commit or end-to-end production readiness is claimed. The application release-candidate source is preserved unchanged.

The original requested instructions are attached in [BUILD_BRIEF.md](BUILD_BRIEF.md). The app manages this isolated branch as `amit1858-github-pages-showcase`, rather than the brief's suggested `feature/github-pages-showcase`. No merge, Pages publication or repository visibility change is authorized.

Reference reviewed: [VentureOS case study](https://amit1858.github.io/ventureos-signal-to-action-agent/). Its evidence labeling, technical storytelling and progression from philosophy to working surfaces inspired the structure; branding, layout, copy and diagrams were not copied.

The owner explicitly selected Udaan's cyan/lime brand palette over the artifact skill's default theme. Colors use `--cp-*` tokens; the branded editorial palette remains dark. Typography uses local Segoe UI/Aptos/Calibri fallbacks: no external font requests.

## Build and local preview

No npm packages or application build are required. Python 3.10+ standard library is sufficient:

```sh
python website/build.py --check
python website/build.py --output <empty-output-directory>
python website/preview.py --port 8765
```

Open `http://127.0.0.1:8765/udaan-ai/`. The preview mounts the exact GitHub Pages project prefix, not the application root. `http://127.0.0.1:8765/mobile` wraps the same page in a 390px iframe; `/mobile?width=360` checks a narrower layout. `/desktop` uses a 1280px frame scaled to fit a narrow preview panel. These are responsive layout previews, not physical-device QA. Stop the server when done.

`browser-check.js` provides repeatable behavioral assertions for the local preview. Load it as a script in the showcase frame, then run `await checkUdaanShowcase()` in that frame's browser console. It tests three financial outcome selections, four actual language assets, six journey buttons, the mobile menu/Escape behavior, CTA gate, decoded images and page overflow. It is not included in the public package.

The build checks local file links and anchors, duplicate IDs, fifteen required sections, image alternative text and dimensions, documented live CTA, and financial input/outcome content. It copies only public static resources and selected review documents; application source, build scripts and original screenshot PNGs are not deployed. SVGs remain downloadable.

Images are local WebP; screenshot encodes are lossless. Existing PNG source captures remain unchanged. Hero image is preloaded; below-fold imagery loads lazily. Scripts are deferred. No analytics, API requests, speech requests, application credentials or external font/CDN dependencies.

## Updating real screenshots without an application rebuild

1. Obtain the owner's approved live application URL after deployment. Verify the running release in a browser; do not treat a successful generic HTTP response as product verification.
2. Use an isolated fictional demonstration. Remove cookies, keys, real business details and personal information before capture. Record the URL, date, release and scenario in this document and `CONTENT_REVIEW.md`.
3. Capture genuine Home, Demo conversation, 70-unit and 130-unit learning surfaces. Never generate replacement screens or claim prototype captures are deployed-release evidence.
4. Replace `assets/home-en-390.webp`, `assets/07-demo-conversation.webp`, `assets/10-learning-low.webp` and `assets/11-learning-high.webp` with optimized actual captures. Language assets follow `home-{en,hinglish,hi,kn}-390.webp`. Preserve original captures in source and encode losslessly where legibility matters.
5. Update image dimensions, alt text, captions and credits if they change. Device frames intentionally crop the top; each gallery link opens the full-length image. Update the reserved slot's status only when captures are verified.
6. Run `python website/build.py --check` and preview at desktop/390/360 widths. These are asset replacements; no React application rebuild or backend change is required. The files still need an approved static upload/Pages deployment to become visible on the published website.

The demo is now enabled for the owner-supplied, verified `https://udaan-ai-builder.replit.app/`. If that changes, verify the new application's rendered product first, update the link, `appStatus` and review evidence; otherwise disable the CTA. The validator rejects an enabled CTA without that documented URL. Do not detect/guess a live URL by hostname, query string, or repository name.

## Deployment only after owner approval

The manual GitHub Actions workflow builds on showcase PR changes without publishing. Publishing additionally requires a workflow-dispatch confirmation, the `main` ref, and the `github-pages` environment. Configure that environment with the owner as required reviewer before publication; YAML cannot configure reviewers itself.

After explicit approval and review/merge, configure GitHub Pages to use Actions if the private repository's plan supports it. Run the manual workflow from `main`, entering `PUBLISH APPROVED SHOWCASE`. GitHub Pages may expose the website publicly even when source is private: review all content and image rights first. Do not change repository visibility to work around plan restrictions.

All relative links and asset paths work beneath `/udaan-ai/`. Canonical and Open Graph URLs describe the intended future destination, **not a claim of existing publication**. GitHub source/evidence links currently require repository access.

## Review documents

- [Content/status review](CONTENT_REVIEW.md): evidence and boundaries per chapter.
- [Credits](credits.html): authors, licenses, modifications and screenshot provenance.
- [Validation report](VALIDATION.md): current showcase checks, separated from recorded application tests.
- [Architecture SVG](assets/architecture.svg): actual application, including internal-only speech boundary.
