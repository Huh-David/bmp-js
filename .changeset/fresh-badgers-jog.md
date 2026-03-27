---
"@huh-david/bmp-js": minor
---

Improve the optional `@huh-david/bmp-js/sharp` adapter ergonomics with better input typing and non-breaking overloads.

Changes include:

- `isBmp` now acts as a type guard over adapter input sources.
- Added overload-friendly forms for `sharpFromBmp` and `encodeFromSharp`.
- Added `info` alias on `decodeForSharp` output for sharper API consistency.
- Expanded docs and tests for the improved adapter surface.
