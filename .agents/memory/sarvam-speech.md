---
name: Sarvam speech constraints
description: Non-obvious model compatibility and Hinglish speech-text constraints
---
Use Bulbul v4's documented persona IDs, not Bulbul v3's short speaker names. Prepare native-script Indic speech text while preserving English business terms, separately from the displayed Romanized Hinglish.

**Why:** Official Sarvam documentation explicitly says v3 speaker IDs cause 400 errors on v4, and Romanized Indic text significantly reduces speech quality. `codemix` transcription preserves English words but writes Indic words in native script; it is not `translit`.

**How to apply:** Before implementing or changing Sarvam speech, recheck current model and voice documentation and run an actual listening test. Do not infer pronunciation quality from a successful HTTP response or silently rewrite the visible conversation.
