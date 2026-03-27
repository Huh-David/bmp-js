---
"@huh-david/bmp-js": minor
---

Add an official optional Sharp adapter subexport at `@huh-david/bmp-js/sharp`.

The adapter adds:

- `isBmp(input)` signature checks
- `decodeForSharp(input)` / `toSharpInput(input)` RGBA+raw decoding helpers
- `sharpFromBmp(input, sharpModule?)` direct Sharp instance creation
- `encodeFromSharp({ data, info }, options?)` raw Sharp output to BMP encoding

`sharp` is configured as an optional peer dependency so core package users are not required to install it.
