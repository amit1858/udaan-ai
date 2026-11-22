---
name: Browser verification on Nix
description: Reliable browser testing in this Replit environment
---
Use Nix-installed Chromium for local Playwright execution, selecting it with `CHROMIUM_PATH=$(command -v chromium)`.

**Why:** Playwright's downloaded browser binary could not launch because shared `libglib-2.0` was unavailable. The system Chromium wrapper supplied the required libraries and ran the same tests.

**How to apply:** For local browser verification on this environment. Standard Linux CI may use Playwright's normal `install --with-deps chromium` setup instead.
