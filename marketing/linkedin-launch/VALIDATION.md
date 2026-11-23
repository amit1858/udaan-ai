# Launch-kit validation

Validated on **23 November 2026**. Only marketing export/capture commands ran; no application build, deployment, provider call or outcome write was performed.

## Commands and results

```powershell
npm.cmd run author
npm.cmd run render
npm.cmd run validate
```

**PASS:** seven individual 2160 × 2700 PNGs, eight editable SVGs, 2400 × 1254 cover, seven-page 4:5 PDF, six-page storyboard PDF, complete clickable live URL. The carousel PDF is below LinkedIn's 100 MB ceiling. The storyboard is explicitly labeled as still-frame planning, not a generated video.

Scoped Git attributes mark PDFs/images as binary, preventing Windows line-ending conversion from corrupting ASCII-encoded PDF exports. Text sources use LF.

**PASS:** browser `getBBox()` checks every editorial text object in all seven SVGs against a 60px safe inset. Final sources have no out-of-bounds text. Output dimensions and image decoding were checked with Pillow.

**PASS:** exact original/copied screenshot bytes; all six crops match original pixels; both live onboarding hashes agree with capture records and successful HTTP 200 / fictional-data disclosure. No fabricated UI or altered application text.

**PASS:** ₹54 per unit; ₹2,280 / ₹3,900 / ₹5,520 after promotion; matching revenue/variable costs; 100-unit target; seven-day scope; 28-unit total break-even. The actual boundary was checked: 27 units produces −₹42, 28 produces +₹12.

[`validation.json`](validation.json) contains the machine check summary, artifact sizes and SHA-256 inventory. [`source/bounds-check.json`](source/bounds-check.json) records empty issue arrays for every slide.

## Visual QA: inspection → fix → reverify

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

All seven final individual PNGs and the cover were then visually reread at full available size; the final carousel and storyboard contact sheets were also inspected. Photographs now render, controls are not sliced, headings/numbers remain readable, credits/disclosures stay inside the frame, and no editorial text collision or clipping remains. The fix-and-reverification cycle is complete.

The inherited screenshots are **390px-wide historical raster captures**. Upscaling cannot create new detail; their original files are included for close inspection. Large editable callouts carry the critical financial/story information without inventing sharper UI.

## Remaining boundaries

Only live onboarding was freshly verified. Downstream production flows were not retested because Demo entry persists server preferences; the fallback screenshots stay explicitly release-candidate/synthetic. No current deployed commit identity, native-speaker quality, production durability or real-owner impact is established. No MP4, PowerPoint, Sarvam production integration, award or adoption claim is made.
