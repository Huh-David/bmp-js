# Upstream Triage TODO (`shaozilee/bmp-js`)

Last reviewed: 2026-03-27
Sources:

- https://github.com/shaozilee/bmp-js/issues
- https://github.com/shaozilee/bmp-js/pulls

## Remaining technical backlog

- [ ] Evaluate optional output format helpers for RGB/RGBA-friendly consumers while preserving default `ABGR`.
  - Upstream refs:
  - Issue: https://github.com/shaozilee/bmp-js/issues/16
  - PR: https://github.com/shaozilee/bmp-js/pull/19
  - Notes:
  - Current fork keeps `ABGR` for compatibility and documents it clearly.
  - Future option should be explicit and non-breaking.

- [ ] Add browser runtime smoke tests (e.g. `vitest --browser` or bundled example) for decode/encode paths.
  - Upstream refs:
  - PR: https://github.com/shaozilee/bmp-js/pull/37
  - Notes:
  - Core implementation is `Uint8Array`/`DataView` based.
  - We still need explicit CI/browser verification beyond Node-only tests.

- [ ] Reach bmp-ts encode parity for output bit depths (`1/4/8/16/24/32`) with palette support where required.
  - Upstream refs:
  - Issue: https://github.com/jimp-dev/bmp-ts/issues/10
  - Notes:
  - Decode parity is already broad.
  - Encode currently supports 24-bit output only.

## Upstream communication

- [ ] Keep posting concise status updates on relevant upstream issues/PRs when we ship major compatibility improvements.
- [ ] If upstream maintainership resumes, prepare a backportable patch set (decoder/header/padding/orientation/docs).
