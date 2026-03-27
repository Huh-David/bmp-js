---
"@huh-david/bmp-js": minor
---

Add explicit non-breaking output format helpers for RGB/RGBA-friendly consumers while preserving ABGR as the default decode layout.

New helpers:

- `decodeRgba(bmpData, options?)` for explicit RGBA output.
- `decodeRgb(bmpData, options?)` for packed RGB output (`width * height * 3`).

This release keeps existing `decode` behavior and `toRGBA` option unchanged.
