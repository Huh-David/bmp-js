---
"@huh-david/bmp-js": patch
---

Improve bmp-ts compatibility in decode behavior and options.

- set alpha to `255` for opaque decode paths instead of `0` (palette, 16-bit without alpha mask, 24-bit, and 32-bit bitfield without alpha mask)
- add `decode(..., { toRGBA: true })` option to return RGBA output
- add regression tests for opaque alpha defaults and `toRGBA` conversion
