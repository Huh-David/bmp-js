# Upstream Triage: `jimp-dev/bmp-ts`

Last reviewed: 2026-03-27
Sources:

- https://github.com/jimp-dev/bmp-ts/issues
- https://github.com/jimp-dev/bmp-ts/pulls

## Goal

Track open upstream bugs/features and ensure this fork covers at least the same practical functionality.

## Open upstream issues (status mapping)

### Issue #31 - Alpha pixels are set to zero on opaque formats

- Upstream: https://github.com/jimp-dev/bmp-ts/issues/31
- Status in this fork: **fixed in code, pending release**
- What was implemented:
- Opaque decode paths now default alpha to `255` instead of `0` for palette, 16-bit (without alpha mask), 24-bit, 32-bit bitfield (without alpha mask), and RLE palette paths.
- Added `decode(..., { toRGBA: true })` option for bmp-ts API compatibility, including palette decode path support.
- Added tests:
- `test/opaque-alpha.test.ts`
- `test/decode-options.test.ts`

### Issue #29 - `1.0.4` package broken (`dist/` missing)

- Upstream: https://github.com/jimp-dev/bmp-ts/issues/29
- Status in this fork: **already covered / released**
- Notes:
- Release pipeline publishes compiled `dist/` artifacts.
- Packaging is validated with `npm pack --dry-run` in `pnpm check`.

### Issue #20 - import/CJS/ESM compatibility error

- Upstream: https://github.com/jimp-dev/bmp-ts/issues/20
- Status in this fork: **already covered / released**
- Notes:
- Dual package exports for ESM + CJS are already shipped.
- API compatibility tests verify import/require usage.

### Issue #14 - unreachable code in decoder

- Upstream: https://github.com/jimp-dev/bmp-ts/issues/14
- Status in this fork: **not applicable (different decoder architecture)**

### Issue #10 - 1-bit encode/decode error

- Upstream: https://github.com/jimp-dev/bmp-ts/issues/10
- Status in this fork: **partially covered**
- Notes:
- Decode side is covered for 1-bit.
- Encode side still only supports 24-bit output in this fork today.

## Open upstream PRs (status mapping)

### PR #30 - bottom-up decode fix

- Upstream: https://github.com/jimp-dev/bmp-ts/pull/30
- Status in this fork: **already covered / released**
- Notes:
- Bottom-up/top-down decode handling is already implemented and tested.

### Dependabot PRs (#27, #26, #25, #24, #23, #22, #19, #18, #17, #16, #15, #11)

- Upstream: https://github.com/jimp-dev/bmp-ts/pulls
- Status in this fork: **not directly applicable**
- Notes:
- Dependency tree and tooling stack differ substantially.

## Remaining compatibility gap vs bmp-ts

- [ ] Add encode output support beyond 24-bit (`1/4/8/16/32`) with palette handling where required.

## Upstream comment policy

- Comment on upstream only after a fix is shipped in a released version.
- Include:
- fix summary
- tests/evidence
- release link
