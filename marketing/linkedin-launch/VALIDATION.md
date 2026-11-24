# Launch-kit validation

Publication revision checked on **23 November 2026**. Only local marketing author/render/validation commands ran during this revision; there was **no new live capture or application interaction**, build, deployment, provider call or outcome write.

## Commands and results

```powershell
npm.cmd run author
npm.cmd run render
npm.cmd run validate
```

**PASS — 110 artifact/content/provenance/model/PDF checks:** seven individual 2160 × 2700 PNGs, eight editable SVGs, 2400 × 1254 cover, seven-page 4:5 PDF, six-page storyboard PDF, complete clickable live URL. The carousel PDF is below LinkedIn's 100 MB ceiling. The storyboard is explicitly labeled as still-frame planning, not a generated video.

Scoped Git attributes mark PDFs/images as binary, preventing Windows line-ending conversion from corrupting ASCII-encoded PDF exports. Text sources use LF.

**PASS:** browser `getBBox()` checks every editorial text object in all seven SVGs against a 60px safe inset. Final sources have no out-of-bounds text. Output dimensions and image decoding were checked with Pillow.

**PASS:** exact original/copied screenshot bytes; all ten crops match original pixels; both saved live onboarding hashes agree with their original capture records and HTTP 200 / fictional-data disclosure. No fabricated UI or altered application text.

**PASS:** ₹54 per unit; ₹2,280 / ₹3,900 / ₹5,520 after promotion; matching revenue/variable costs; 100-unit target; seven-day scope; 28-unit total break-even. The actual boundary was checked: 27 units produces −₹42, 28 produces +₹12.

[`validation.json`](validation.json) contains the machine check summary, artifact sizes and SHA-256 inventory. [`source/bounds-check.json`](source/bounds-check.json) records empty issue arrays for every slide.

**PASS:** seven native-size **390 × 488** proofs and seven **320 × 400** proofs. The revised SVG output contains the complete first-person hook, retained promise, four-part differentiation, illustrative combo question, all six journey steps and single-object full URL. The PDF invitation links cover the newly positioned CTA and URL, not their old locations.

## Publication revision: mobile and evidence review

The critical narrative is editable artwork, not tiny screenshot labels: the first-person hook, four-part thesis, owner question, rupee outcomes and invitation URL must remain understandable without zoom. Product excerpts support the story and are explicitly labeled as excerpts, not newly generated UI.

| Evidence surface | Revised treatment |
| --- | --- |
| Slide 3 | Enlarged context/reasoning excerpt below the four-part thesis; visibly labeled Demo Mode and release-candidate |
| Slide 4 | 520px-wide genuine combo card beside the six-step experience; owner question labeled illustrative outside the image |
| Slide 5 | Almost full-width genuine financial table, with separate readable price/cost/contribution assumptions |
| Slide 7 | 544px-wide saved live-onboarding hero detail instead of a 348px-wide whole-screen thumbnail; full single-line URL and full-width CTA |
| Caption | First-person problem → thesis → concrete execution → builder learning; no judging outcome, builder portrait or award claim |

No controlled synthetic interaction was needed. Original evidence and photo attribution remain intact. Dense historical UI is not advertised as sharper than its original resolution.

An independent visual reviewer inspected **all seven slides at both 390px and 320px**, relevant high-resolution exports, the cover, storyboard and caption. It found three bounded refinements:

| Mobile review finding | Applied correction |
| --- | --- |
| Slide 5 table is naturally dim; lower spacing cramped | Keep genuine pixel colors unchanged, tighten to the contiguous revenue-through-after-promotion rows, add a separate high-contrast editorial sales/cost/promotion summary, and increase lower breathing room |
| Slide 6's editorial/₹600 boundary labels too small | Promote “Editorial suggestion” and “₹600 visibility / test hypothesis” into 34px primary recommendation text instead of small annotations |
| Slide 7 address lacked the literal HTTPS scheme | Display `https://udaan-ai-builder.replit.app/` as one readable 44px text object |

Slide 1 and the cover additionally identify the contextual vendor as neither the builder nor a customer; no builder portrait is supplied.

**Final independent recheck:** affected slides were re-read at 390px, 320px and high resolution, with the cover/storyboard checked for regressions. All retained table rows are complete; financial summary, meaningful recommendation boundaries and the full HTTPS URL read at both phone widths. No new blocking overlap, clipping or readability defect was found. The publication revision's **inspect → fix → reverify cycle is complete**.

The original financial screenshot remains naturally softer/dimmer than editorial type. Its pixels were not brightened or rewritten; high-contrast editorial amounts and assumptions carry the critical decision information without requiring screenshot zoom.

## Original export QA history

A separate visual QA subagent inspected all seven first-render slides and the cover, rather than relying on source-code inspection. It found:

| First-render issue | Correction |
| --- | --- |
| Embedded WebP photos silently absent in the SVG rasterizer | Encode only the embedded photographic versions as JPEG; retain original WebP assets and license notices |
| Top/bottom safe-area violations; clipped redundant footer brand | Move logo/page counts inward; remove redundant bottom branding; verify text bounds |
| Chat evidence overlong and Home crop slicing the lower paragraph | Use an exact complete-response crop plus readable takeaway; stop Home detail after its Explore button |
| Finance screenshot too small relative to its frame | Increase its usable frame while retaining the complete genuine panel and readable editorial numbers |
| Invitation hostname second line outside the canvas | Correct explicit line spacing; show the complete two-line hostname |
| Live onboarding crop slicing language controls | Contain the whole genuine screen without truncating controls |
| ₹600 next-test purpose and 100-unit recommendation provenance unclear | Explicit visibility-test label and editorial next-test-advice label |

That original fix-and-reverification cycle was completed before the initial launch-kit review. The publication revision additionally uses the mobile proofs above rather than relying solely on high-resolution inspection.

The inherited screenshots are **390px-wide historical raster captures**. Upscaling cannot create new detail; their original files are included for close inspection. Large editable callouts carry the critical financial/story information without inventing sharper UI.

## Remaining boundaries

Only live onboarding was freshly verified. Downstream production flows were not retested because Demo entry persists server preferences; the fallback screenshots stay explicitly release-candidate/synthetic. No current deployed commit identity, native-speaker quality, production durability or real-owner impact is established. No MP4, PowerPoint, Sarvam production integration, award or adoption claim is made.
