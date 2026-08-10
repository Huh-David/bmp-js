---
"@huh-david/bmp-js": patch
---

Fix implicit `sharp` resolution in the ESM build of the `./sharp` subpath export.

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
