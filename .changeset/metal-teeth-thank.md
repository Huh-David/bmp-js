---
"@huh-david/bmp-js": minor
---

Add multi-bit-depth BMP encoding support and expand encoder coverage.

- encode now supports output bit depths `1`, `4`, `8`, `16`, `24`, and `32`
- add palette-based encoding for `1/4/8` bit modes (default black/white palette for `1` bit)
- keep stable default behavior (`24`-bit output when no `bitPP` option is provided)
- improve validation and error messages for palette size/value constraints
- add a comprehensive encoder test matrix (`test/encode-bit-depths.test.ts`) with header, padding, roundtrip, and failure-case assertions
