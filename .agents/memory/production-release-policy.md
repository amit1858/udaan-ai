---
name: Production release permissions
description: Why storage hardening, source push and production publication have separate approval gates.
---

The owner approved durable PostgreSQL while explicitly withholding application and GitHub Pages publication. Private GitHub source approval never implies public repository or app visibility approval.

**Why:** the owner requires review of recurring hosting/database charges and production safety before enabling hosting; the source handoff and deployment are separate decisions.

**How to apply:** obtain explicit publishing approval after the readiness/cost report, and obtain separate approval before adding a billable service or enabling paid inference/speech.

Preserve existing private development contexts in development storage; do not silently copy them into a fresh production environment.

**Why:** preservation was required, but private runtime data was explicitly excluded from source/deployment handoff. New production browser identities do not automatically represent existing development visitors.

**How to apply:** keep schema publication separate from data copying; explain any intended production-data transfer and request approval first.
