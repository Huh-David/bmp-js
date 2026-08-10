# @huh-david/bmp-js

## 0.8.6

### Patch Changes

- 7336eca: Fix implicit `sharp` resolution in the ESM build of the `./sharp` subpath export.

  `__filename` does not exist in ES modules, so the ESM build always fell back to a
  `process.cwd()`-derived base when constructing its `createRequire`. Resolution of the
  optional `sharp` peer therefore depended on the consumer's working directory: an ESM
  consumer running from anywhere other than the project root (systemd units with a
  different `WorkingDirectory`, containers with a different `WORKDIR`, monorepo task
  runners) got a `SharpModuleLoadError` even with `sharp` correctly installed. The ESM
  build now derives a real `__filename` from `import.meta.url`, so both build formats
  resolve relative to the module itself; `process.cwd()` remains only as a last-resort
  fallback.

  `SharpModuleLoadError` now also carries the underlying resolution failure on its `cause`
  property, and its message no longer claims `sharp` is simply missing when it is installed
  but unresolvable. The error class name and public shape are unchanged, and
  `sharpFromBmp(input, sharpModule)` / `sharpFromBmp({ input, sharp })` are unaffected.

## 0.8.5

### Patch Changes

- feb5704: Update all development dependencies to their latest versions and fix the
  home page hero action links so they respect the configured base path
  (`/bmp-js/`) on GitHub Pages instead of resolving to the site root.

## 0.8.4

### Patch Changes

- Refresh development dependencies, migrate the project to pnpm 11, and add support for Sharp 0.35 as an optional peer.

## 0.8.3

### Patch Changes

- Refresh development dependencies to their latest available versions.

## 0.8.2

### Patch Changes

- 2eedd58: Improve package discoverability and migration onboarding.

  Changes:

  - add migration guide in docs and README
  - add AI-assisted migration prompt template
  - refresh npm package keywords for better search discoverability

## 0.8.1

### Patch Changes

- fa578d8: Refresh dependencies to current stable versions, including `sharp` and the Vitest toolchain.

  Highlights:

  - upgrade `sharp` to `0.34.x` in dev dependencies
  - broaden `sharp` optional peer support to `^0.33.5 || ^0.34.0`
  - upgrade Vitest and browser testing stack to `4.1.x`
  - upgrade TypeScript to `6.0.x` and align config for TS6 deprecation handling
  - force `esbuild` to a patched version via `pnpm.overrides` to address advisory GHSA-67mh-4wv8-2f99

## 0.8.0

### Minor Changes

- 865d9a1: Add explicit non-breaking output format helpers for RGB/RGBA-friendly consumers while preserving ABGR as the default decode layout.

  New helpers:

  - `decodeRgba(bmpData, options?)` for explicit RGBA output.
  - `decodeRgb(bmpData, options?)` for packed RGB output (`width * height * 3`).

  This release keeps existing `decode` behavior and `toRGBA` option unchanged.

## 0.7.0

### Minor Changes

- 658e197: Improve the optional `@huh-david/bmp-js/sharp` adapter ergonomics with better input typing and non-breaking overloads.

  Changes include:

  - `isBmp` now acts as a type guard over adapter input sources.
  - Added overload-friendly forms for `sharpFromBmp` and `encodeFromSharp`.
  - Added `info` alias on `decodeForSharp` output for sharper API consistency.
  - Expanded docs and tests for the improved adapter surface.

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
