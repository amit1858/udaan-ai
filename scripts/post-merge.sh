#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm db:init
pnpm seed
pnpm run typecheck
