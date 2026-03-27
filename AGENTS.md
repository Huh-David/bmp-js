# AGENTS.md

This file defines repository-specific guidance for coding agents and contributors.

## Project Overview

- Package: `@huh-david/bmp-js`
- Runtime: Node.js `>=22`
- Language: TypeScript
- Module outputs: dual ESM + CommonJS (via `tsup`)
- Public API: `encode` and `decode`
- Pixel layout in decoded buffers: `ABGR`

## Setup

1. Install dependencies:
   - `pnpm install`
2. Run the full quality gate before finalizing:
   - `pnpm check`

## Source Layout

- `src/` library source
- `fixtures/` BMP fixtures used by tests
- `test/` Vitest suite
- `.changeset/` release metadata
- `.github/workflows/` CI and release automation

## Required Quality Gate

Always ensure these pass locally:

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

The canonical command is:

- `pnpm check`

## API and Compatibility Rules

- Keep `encode`/`decode` behavior backward-compatible unless explicitly requested.
- Do not silently change decoded channel order (`ABGR`).
- Preserve dual module compatibility:
  - ESM import path from `dist/index.js`
  - CommonJS require path from `dist/index.cjs`
- Keep exported TypeScript types stable unless the change is intentional and documented.

## Testing Rules

- Add or update tests for any behavior change.
- Keep fixture-based coverage for bit depths and RLE cases.
- If decoding/encoding behavior changes intentionally, update snapshots in:
  - `test/__snapshots__/roundtrip.test.ts.snap`

## Release Rules

- Use Changesets for user-visible changes:
  - `pnpm changeset`
- Do not manually edit version/changelog files as a substitute for changesets.
- CI and release workflows must remain green and functional.

## Editing Guidance

- Prefer focused, minimal diffs.
- Avoid unnecessary dependency churn.
- Do not reintroduce legacy JS entrypoints (`index.js`, `lib/*`).
- Keep docs in sync when scripts, API, or release flow changes.
