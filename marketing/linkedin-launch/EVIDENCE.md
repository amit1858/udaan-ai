# Evidence and claim boundaries

## Product/story source

This package was authored from main revision **`a477deec7ffa85474365b36a05ddc65369e1e8da`**. Financial figures come from [`docs/FINANCIAL_VERIFICATION.md`](../../docs/FINANCIAL_VERIFICATION.md), with product thinking and event origin from `README.md`, `docs/PRODUCT_THESIS.md` and `docs/DEMO_SCRIPT.md`. The showcase's `website/CONTENT_REVIEW.md` and `website/credits.html` establish inherited asset provenance. Historical status sentences in older documents are not silently upgraded into deployment claims.

## Screenshot inventory

| Evidence | Origin | Treatment / boundary |
| --- | --- | --- |
| `live/onboarding-mobile.png` | New read-only capture of the owner-supplied live URL, 390 × 844 viewport at 2× | Actual deployed onboarding; 780 × 1688 PNG |
| `live/onboarding-desktop.png` | Same live URL, 1440 × 1000 viewport at 2× | Actual deployed onboarding; 2880 × 2000 PNG |
| `release-candidate/home-en-390.png` | Byte-preserving copy of `website/assets/home-en-390.png` | Genuine historical Home/discovery/business-insights capture; synthetic records, not fresh production evidence |
| `release-candidate/07-demo-conversation.png` | Byte-preserving copy of the same-named showcase asset | Genuine historical Ask Udaan + financial panel; **Demo Mode**, Hinglish |
| `release-candidate/10-learning-low.png` | Byte-preserving copy of the same-named showcase asset | Genuine historical recorded 70-unit learning, comparison and next-visibility hypothesis |
| `release-candidate/11-learning-high.png` | Byte-preserving copy of the same-named showcase asset | Genuine historical recorded 130-unit learning and next-repeat-customer hypothesis |
| `crops/*.png` | Exact pixel crops of the above originals | No rewritten text, invented controls, inpainted pixels or substituted API data; rectangles in `source/design.json` |

Live URL: **https://udaan-ai-builder.replit.app/**. Capture timestamp, HTTP status, viewport, rendered disclosure text and SHA-256 hashes are in [`screenshots/live/capture.json`](screenshots/live/capture.json). Only the rendered entry point is independently verified. This does **not** identify the deployed commit, retest the full production journey or prove production storage durability.

### Why deeper current-production captures were not taken

Entering Demo is not just a browser-local preference:

- `artifacts/udaan-ai/src/components/onboarding.tsx` calls `setPrefs({ language: pick, onboarded: true })`.
- `artifacts/udaan-ai/src/lib/i18n.tsx` sends `useUpdatePreferences`.
- `artifacts/api-server/src/routes/udaan.ts:75–78` handles `PATCH /udaan/preferences` with `prisma.demoSession.update`.

The capture therefore stops before that server-state mutation. Ordinary GET page loading may initialize a synthetic visitor session/cookie; no application code, stored business outcome or deployment was changed intentionally. No chat submission, research invocation, voice request, plan approval or result save occurred. No model allowance was changed. No API mocking or client-state injection was used.

### Important screen-reading nuance

The low/high learning screenshots include **“Expected outcome ₹3,900”** farther down the page. That is the 100-unit plan, **not** the actual 70/130-unit contribution. The comparison at the top shows 70%/130% target achievement and −₹1,620/+₹1,620 variance. The authoritative model yields actual after-promotion contributions of ₹2,280/₹5,520. The launch artwork never relabels the expected financial panel as actual.

## Financial model

| Seven-day scenario | 70 units | 100 units | 130 units |
| --- | ---: | ---: | ---: |
| Selling price / making cost | ₹99 / ₹45 | ₹99 / ₹45 | ₹99 / ₹45 |
| Revenue | ₹6,930 | ₹9,900 | ₹12,870 |
| Variable costs | ₹3,150 | ₹4,500 | ₹5,850 |
| Contribution before promotion | ₹3,780 | ₹5,400 | ₹7,020 |
| Promotion cost | ₹1,500 | ₹1,500 | ₹1,500 |
| **Contribution after promotion** | **₹2,280** | **₹3,900** | **₹5,520** |
| Target achieved | 70% | 100% | 130% |
| Next hypothesis | ₹600 local-visibility test | Cautiously repeat / validate demand | Repeat-customer test or controlled expansion |

`(99 − 45) × units − 1500`. Promotion break-even is `ceil(1500 / 54) = 28` units **total across all seven days**. At 27 units contribution is −₹42; at 28 it is +₹12. This covers the modeled promotion spend after variable cost, not rent, salaries, taxes or other overhead. It is not net profit, full-business break-even, an extra-unit requirement or a daily target.

The 70/130 next recommendations are documented stored demo branches. The 100-unit **“repeat cautiously / validate demand”** step is clearly labeled editorial next-test advice; it is not presented as a screenshot or a verified model-generated production output. The hypotheses are not guarantees and do not establish causality.

## What this launch does not claim

No real customer, revenue, adoption, measured impact, hackathon finalist/winner/award, investment, partnership or organizer endorsement. Event participation is product origin only. No Sarvam integration into the main production chat is claimed; internal Voice Lab evidence remains separate. Learning means retained outcomes informing the next suggestion, not autonomous retraining. No payments, ads, messaging or orders are executed by this package.

Current repository visibility was read as **public**, unlike older source notes describing its earlier private state. It was not changed. No application workflow or Pages deployment was launched.
