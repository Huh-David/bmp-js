---
"@huh-david/bmp-js": patch
---

Refresh dependencies to current stable versions, including `sharp` and the Vitest toolchain.

Highlights:

- upgrade `sharp` to `0.34.x` in dev dependencies
- broaden `sharp` optional peer support to `^0.33.5 || ^0.34.0`
- upgrade Vitest and browser testing stack to `4.1.x`
- upgrade TypeScript to `6.0.x` and align config for TS6 deprecation handling
- force `esbuild` to a patched version via `pnpm.overrides` to address advisory GHSA-67mh-4wv8-2f99
