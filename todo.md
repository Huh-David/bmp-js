# Upstream Triage TODO (`shaozilee/bmp-js`)

Last reviewed: 2026-03-27
Sources:

- https://github.com/shaozilee/bmp-js/issues
- https://github.com/shaozilee/bmp-js/pulls

## Remaining technical backlog

- [x] Evaluate optional output format helpers for RGB/RGBA-friendly consumers while preserving default `ABGR`.
  - Upstream refs:
  - Issue: https://github.com/shaozilee/bmp-js/issues/16
  - PR: https://github.com/shaozilee/bmp-js/pull/19
  - Notes:
  - Current fork keeps `ABGR` as default for compatibility.
  - Added explicit non-breaking helpers: `decodeRgba` and `decodeRgb`.
  - Kept `decode(..., { toRGBA: true })` unchanged for backward compatibility.

- [x] Add browser runtime smoke tests (e.g. `vitest --browser` or bundled example) for decode/encode paths.
  - Upstream refs:
  - PR: https://github.com/shaozilee/bmp-js/pull/37
  - Notes:
  - Core implementation is `Uint8Array`/`DataView` based.
  - Added `test:browser` with Vitest Browser Mode + Playwright Chromium.
  - Added `test/browser/smoke.browser.test.ts` for browser encode/decode runtime checks.
  - CI now includes a dedicated `browser-smoke` job.

- [ ] Release and announce bmp-ts encode parity (`1/4/8/16/24/32`) upstream after publish.
  - Upstream refs:
  - Issue: https://github.com/jimp-dev/bmp-ts/issues/10
  - Notes:
  - Implementation and tests are complete in this fork.
  - Upstream comment should be posted only after the release is live.

## Upstream communication

- [ ] Keep posting concise status updates on relevant upstream issues/PRs when we ship major compatibility improvements.
- [ ] If upstream maintainership resumes, prepare a backportable patch set (decoder/header/padding/orientation/docs).
