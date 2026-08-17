---
"@huh-david/bmp-js": patch
---

fix: keep Node builtins out of the browser-safe main entry

`tsup`'s `shims` option injected an eager `fileURLToPath(import.meta.url)` into
the chunk shared by both entry points, so importing only `decode`/`encode` from
the main entry pulled `node:url` into browser bundles. Bundlers that polyfill
`url` without a `fileURLToPath` export — notably Next.js/Turbopack — then threw
`(0 , fileURLToPath) is not a function` at module evaluation.

The shim is now disabled and the optional `sharp` peer derives its own
resolution base lazily, on first use. Peer resolution still keys off the
module's own location rather than the caller's `cwd` in both ESM and CJS.
