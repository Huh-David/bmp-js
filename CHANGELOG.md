# @huh-david/bmp-js

## 0.6.0

### Minor Changes

- 88c34f1: Add an official optional Sharp adapter subexport at `@huh-david/bmp-js/sharp`.

  The adapter adds:
  - `isBmp(input)` signature checks
  - `decodeForSharp(input)` / `toSharpInput(input)` RGBA+raw decoding helpers
  - `sharpFromBmp(input, sharpModule?)` direct Sharp instance creation
  - `encodeFromSharp({ data, info }, options?)` raw Sharp output to BMP encoding

  `sharp` is configured as an optional peer dependency so core package users are not required to install it.

## 0.5.0

### Minor Changes

- 066e25c: Add multi-bit-depth BMP encoding support and expand encoder coverage.
  - encode now supports output bit depths `1`, `4`, `8`, `16`, `24`, and `32`
  - add palette-based encoding for `1/4/8` bit modes (default black/white palette for `1` bit)
  - keep stable default behavior (`24`-bit output when no `bitPP` option is provided)
  - improve validation and error messages for palette size/value constraints
  - add a comprehensive encoder test matrix (`test/encode-bit-depths.test.ts`) with header, padding, roundtrip, and failure-case assertions

## 0.4.1

### Patch Changes

- 4386ce3: Improve bmp-ts compatibility in decode behavior and options.
  - set alpha to `255` for opaque decode paths instead of `0` (palette, 16-bit without alpha mask, 24-bit, and 32-bit bitfield without alpha mask)
  - add `decode(..., { toRGBA: true })` option to return RGBA output
  - add regression tests for opaque alpha defaults and `toRGBA` conversion

## 0.4.0

### Minor Changes

- f94aa29: Harden BMP decoding/encoding with stronger header parsing, safer bounds checks, typed-array binary APIs, generated deterministic fixtures, fixture provenance validation, and stricter CI/release checks.

## 0.3.0

### Minor Changes

- 35967e7: Modernize the package to a TypeScript-first setup with dual ESM/CJS builds, Vitest, OX tooling, and Changesets-driven release automation.
