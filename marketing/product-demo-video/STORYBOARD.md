# Proposed 72-second production treatment

**Planning only.** Six scenes, real rendered interactions after authorization;
not a still-image montage passed off as a working product.

| Edit time | Capture / composition | Hold and readable message |
| --- | --- | --- |
| 00-09 | Licensed Indian breakfast-business context; Udaan mark; restrained push into actual onboarding | "Great businesses deserve better decisions." Fictional/context-photo disclosure |
| 09-17 | Actual English Start Demo, Home greeting, brief existing `/shop` context | "Meet Udaan AI." No fabricated profile-entry wizard |
| 17-28 | Discovery combo; one typed owner question; rendered Demo response, then opportunity link | "From an idea to an informed decision." Demo badge visible |
| 28-45 | Genuine evaluation; clear crop on 99 / 45 / 1,500 / 100 and authoritative panel | 3,900 modeled contribution; 28 total-unit promotion break-even; overhead excluded |
| 45-63 | Draft -> approval -> Running; sample-low form, synthetic switch and save; completed learning and 600 next test | "Illustrative result: 70 combos." Actual contribution 2,280. "Measure. Learn. Improve." |
| 63-72 | Best newly recorded product shot, six journey words, Udaan mark; full URL held at least four seconds | "Every small business deserves a big possibility." Explore Udaan AI; prototype disclosure |

Record a longer unedited take, then cut honestly; 72 seconds is the edited
story duration, not a claim that seven days elapsed. Preserve confirmations
and enough of each action/result to make the sequence understandable.
Timings may shift after approved audio, but final duration remains 60-75 seconds.

## Recording and composition

Playwright + installed Chromium successfully recorded a **432 x 768, 25 fps,
VP9/WebM** neutral test card. An initial attempt to set a larger recording size
merely padded the native viewport; this was found visually and corrected.
Do not mistake `deviceScaleFactor:2` for higher-resolution native video.

For production, retain native aspect ratio and original recording. Use the
432 x 768 mobile layout with native-size recorder output; contextual wide shots
can be contained, then focus on genuine contiguous UI regions for readability.
Do not assert that upscaling adds detail. A higher-resolution CDP/screenshot
capture pipeline is an optional later investigation if mobile QA needs it,
not a proven capability or reason to alter the deployed UI/CSS.

Primary edit canvas **1080 x 1350**, 30 fps: 96px identity band, up to 1050px
product area, 140px caption region and 64px attribution/disclosure region.
Whole mobile overviews fit by containment; important evaluation/learning shots
use section crops and natural scrolling, not an unreadably small full phone.
Use editorial 99/45/1,500/28/2,280 callouts outside the UI, never rewrite its text.
Use restrained 150-250ms fades/cuts, visible taps at real action positions,
and smooth scroll; no invented pointers or results.

Validate a representative product crop at 390px and 320px viewing widths after
approved recording **before** voice/final edit. If unreadable, improve framing
or investigate higher-resolution capture; do not silently ship a blurry export.
Navy `#05070D`/`#0A0D16`, cyan `#5CC6FF`, lime `#BDF52F`; use existing mark.
No new generated contextual imagery, UI redesign or technical diagrams.

## Audio, captions and assembly

Use only approved Gnani WAV, 48kHz mono 16-bit. No background music by default.
Preserve original audio, then normalize narration conservatively (target around
-16 LUFS integrated, <= -1.5 dBTP), verify by listening, and avoid clipped peaks.
No unsupported SSML, stretching voice beyond intelligibility or automatic
paid regeneration. Optional room/transition silence is locally generated,
not fabricated application sound.

Create human-checked SRT from the approved script and measured audio; align
sentence boundaries to actual waveform/scene cuts. No paid transcription needed.
Burn in high-contrast captions (maximum two lines, roughly 42 characters/line,
approximately 12-17 characters/second where practicable) while retaining SRT.
Captions stay outside critical controls and photo credits. Pause longer or
shorten editorial text rather than hide disclosures.

Later build script inputs: immutable raw video, edit-decision timestamps,
approved narration, reviewed SRT, credited contextual images and brand assets.
Use FFmpeg trim/setpts, scale-with-aspect, crop/pad/overlay, subtitles, and
audio loudness filters; encode `libx264`, `yuv420p`, 30 fps, CRF about 18-21,
AAC 48kHz 192kbps, `+faststart`. These are a build design, not an existing
final-build script or exported MP4. Preserve source/target paths and versions.

Landscape **1920 x 1080** is optional: capture a genuine second 1440 x 900
desktop view within the same approved visitor where possible, or contain
mobile footage beside branded editorial space. Recompose captions/CTA; never
stretch 9:16 footage. Additional state-mutating takes require approval.

## Photography, fonts and distribution rights

Prior carousel at commit `bb7843750a28a8f9cdc55290f68c8d4eb67b516a`:

| Candidate asset | Credit and documented license | Proposed use |
| --- | --- | --- |
| `marketing/linkedin-launch/assets/dosa-vendor.webp` | Adib95, [Dosa(2).jpg](https://commons.wikimedia.org/wiki/File:Dosa(2).jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Opening context; not Ravi, owner, customer or endorsement |
| `assets/ooty-stall.webp` in that kit | Siyaulhaque, [A food stall in Ooty town.jpg](https://commons.wikimedia.org/wiki/File:A_food_stall_in_Ooty_town.jpg), CC BY-SA 4.0 | Optional alternate context; do not call it Bengaluru |
| `assets/breakfast.webp` in that kit | Saind147, [South Indian Breakast Idli Vada Sambar Chutney](https://commons.wikimedia.org/wiki/File:South_Indian_Breakast_Idli_Vada_Sambar_Chutney.JPG), CC BY-SA 4.0 | Actual in-app combo imagery/optional contextual still, not actual priced serving |

No photo bytes have been reused in new artwork yet. Retrieve only selected
assets from that exact Git ref after creative approval and copy the kit's full
`CREDITS.md`, evidence and modification notices with them. Recheck original
license links before delivery. Credit creator/source/license visibly in the
relevant shot, closing credits/description and source package; disclose crop,
grading, scaling and other adaptations. Preserve in-app image attribution.

Do not assume the carousel license automatically clears a new synchronized
video: determine applicable share-alike scope for the adapted video/composition,
confirm compatibility with Gnani's generated-audio redistribution rights, and
obtain a rights decision before final production/public delivery. This is a
licensing uncertainty, not a claim that CC BY-SA forbids video reuse.
Product marks/software/fonts retain their own rights. Do not redistribute font
binaries or rip audio from provider demos. Music rights are avoided by silence.

## Later deliverables and QA gates

After approvals: original WebM, approved narration WAV, final script, reviewed
SRT, 1080 x 1350 H.264/AAC MP4, thumbnail, reproducible build script and concise
validation report; optional landscape. Deliver binaries via approved private
storage or verified Git LFS quotas, with checksums and durable retrieval links.
Do not commit large files first and attempt to undo shared Git history.

Final QA must inspect real playback, sound-on/muted and phone-size proofs;
financial boundary at 27/28 units, all labels/CTA, correct actual-versus-expected
panel, caption timing/contrast, no identifiers, credits, aspect ratio, duration,
codecs, decode errors, black frames, clipped UI or distorted images.
Create the delivery PR only then; never auto-publish to LinkedIn.

Future caption draft: "A small business doesn't need another dashboard. It needs
a clearer next decision. Udaan AI connects business context, opportunity
exploration, transparent financial evaluation and the next small test.
This prototype walkthrough uses fictional business data and illustrative
outcomes - not customer impact. Every small business deserves a big possibility."
