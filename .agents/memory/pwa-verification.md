---
name: PWA verification on Chromium
description: Non-obvious installability and Vite peer-resolution issues during production PWA checks
---
Use a temporary persistent Chromium context for PWA installability checks, not an incognito browser context.

**Why:** Chrome reports `in-incognito` as an installation failure even when the manifest, icons and service worker are valid. The persistent-context check returned zero eligibility errors; this still does not prove a physical-device OS installation.

**How to apply:** Test built production assets, clean up the temporary browser profile, and distinguish browser eligibility from Android/iPhone installation. Development PWA registration is intentionally disabled to avoid caching Vite/HMR source.

When adding Workbox tooling, check that shared Vite plugins resolve the same optional Terser peer across workspace packages.

**Why:** Identical Vite versions with different optional-peer identities produced incompatible recursive plugin types in the otherwise unused mockup sandbox.

**How to apply:** Align the actual peer dependency rather than suppressing TypeScript errors or changing application architecture.
