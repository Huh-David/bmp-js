# Upstream Triage TODO (`shaozilee/bmp-js`)

Last reviewed: 2026-03-27
Sources:

- https://github.com/shaozilee/bmp-js/issues
- https://github.com/shaozilee/bmp-js/pulls

## P0 - Decoder correctness and interoperability

- [ ] Handle BMP V4/V5 (including larger DIB headers / color profile offsets) without horizontal offset or color corruption.
  - Upstream refs to comment after fix:
  - Issue: https://github.com/shaozilee/bmp-js/issues/39
  - PR: https://github.com/shaozilee/bmp-js/pull/38
  - PR: https://github.com/shaozilee/bmp-js/pull/19
  - Check with GIMP-exported BMPs (BMP4/BMP5) and ensure pixel rows are aligned correctly.

- [ ] Re-verify row padding/file padding logic across bit depths, especially widths not divisible by 4 and 32bpp cases.
  - Upstream refs to comment after fix:
  - PR: https://github.com/shaozilee/bmp-js/pull/31
  - PR: https://github.com/shaozilee/bmp-js/pull/17
  - Add fixture-based tests for odd widths and compare against known-good decoders.

## P1 - Encoding compatibility options

- [ ] Add/validate encoder option for output row orientation (top-down negative height vs bottom-up positive height).
  - Upstream refs to comment after fix:
  - Issue: https://github.com/shaozilee/bmp-js/issues/28
  - PR: https://github.com/shaozilee/bmp-js/pull/41
  - Keep current behavior default for backward compatibility; add explicit option + tests.

- [ ] Evaluate optional output format for RGBA-friendly consumers while preserving default decoded buffer layout (`ABGR` in this fork).
  - Upstream refs to comment after fix:
  - Issue: https://github.com/shaozilee/bmp-js/issues/16
  - PR: https://github.com/shaozilee/bmp-js/pull/19
  - If adding options, document clearly to avoid channel-order confusion.

## P1 - Bit depth behavior and size expectations

- [ ] Confirm encode bit depth support matrix and behavior (`1/4/8/16/24/32`) and ensure unsupported modes fail clearly.
  - Upstream refs to comment after fix:
  - Issue: https://github.com/shaozilee/bmp-js/issues/21
  - Issue: https://github.com/shaozilee/bmp-js/issues/30
  - PR: https://github.com/shaozilee/bmp-js/pull/24
  - Add roundtrip + fixture tests per bit depth and validate output size expectations.

## P2 - Runtime/platform compatibility

- [ ] Confirm no deprecated `new Buffer()` usage remains and keep modern Node safety APIs.
  - Upstream refs to comment after fix:
  - Issue: https://github.com/shaozilee/bmp-js/issues/22
  - PR: https://github.com/shaozilee/bmp-js/pull/36

- [ ] Verify browser-runtime compatibility path (no Node-only assumptions in decode/encode hot paths where avoidable).
  - Upstream refs to comment after fix:
  - PR: https://github.com/shaozilee/bmp-js/pull/37

## P3 - Documentation and maintenance

- [ ] Fold in still-relevant README fixes/typos and API clarifications.
  - Upstream refs to comment after fix:
  - PR: https://github.com/shaozilee/bmp-js/pull/33
  - PR: https://github.com/shaozilee/bmp-js/pull/27
  - PR: https://github.com/shaozilee/bmp-js/pull/25
  - PR: https://github.com/shaozilee/bmp-js/pull/11
  - Issue: https://github.com/shaozilee/bmp-js/issues/13

- [ ] Add a maintainer note in docs that this fork tracks upstream backlog and lists compatibility goals.
  - Upstream refs to comment after fix:
  - Issue: https://github.com/shaozilee/bmp-js/issues/40

## Suggested execution order

- [ ] 1. Build a regression fixture set from issue/PR repros (#39, #28, #31, #17).
- [ ] 2. Fix decoder/header/padding correctness (P0), then lock with tests.
- [ ] 3. Add encoder compatibility options (orientation + optional channel/format helpers) with strict backward compatibility.
- [ ] 4. Finalize docs and examples, then run full gate: `pnpm check`.

## Upstream Comment Plan

- [ ] When an item is fixed here, post one upstream comment per linked issue/PR above with:
- [ ] What was fixed in this fork
- [ ] Test/fixture evidence
- [ ] Commit or PR link from this fork
- [ ] Whether the change is directly backportable to upstream
