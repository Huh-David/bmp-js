# @huh-david/bmp-js

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
