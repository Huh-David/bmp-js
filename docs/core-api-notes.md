# Core API Notes

This package keeps the historical core image buffer layout as `ABGR` for `decode`/`encode`.

## Notes for adapter authors

- `decode(...)` returns `ABGR` by default.
- `decode(..., { toRGBA: true })` returns `RGBA` and is used by the Sharp adapter.
- `encode(...)` expects `ABGR` source bytes.
- Supported core encode bit depths are: `1`, `4`, `8`, `16`, `24`, `32`.
- There is no native 2-bit encode mode in core.
