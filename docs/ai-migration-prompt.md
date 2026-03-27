# AI Migration Prompt (`bmp-js`/`bmp-ts` -> `@huh-david/bmp-js`)

Use this prompt with your coding assistant when migrating an existing project.

```text
You are working in an existing TypeScript/Node.js repository.
Migrate this codebase from legacy BMP dependencies (`bmp-js` and/or `bmp-ts`) to `@huh-david/bmp-js`.

Goals:
1. Preserve behavior unless a clear bug fix is required.
2. Simplify call sites where possible.
3. Make output byte-order expectations explicit (`ABGR` vs `RGBA` vs `RGB`).
4. Keep changes minimal, safe, and well-tested.

Migration rules:
- Replace package usage/imports:
  - from: "bmp-js" / "bmp-ts"
  - to: "@huh-david/bmp-js"
- For Sharp pipelines, use subexport:
  - "@huh-david/bmp-js/sharp"
- Keep default decode behavior compatibility (`ABGR`) unless consumers require otherwise.
- If consumer expects RGBA, use explicit helpers:
  - `decodeRgba(input)`
  - `decodeRgb(input)` for packed 3-channel RGB
- Do not introduce silent byte-order conversions.

Required steps:
1. Find all legacy imports/usages and update to new package.
2. Update lockfile and dependency manifests.
3. Refactor call sites for clearer decode/encode usage.
4. Add/adjust tests for:
   - decode path behavior
   - encode output (bit depth/orientation where relevant)
   - any Sharp integration path touched
5. Update docs/comments where old package name is referenced.

Validation:
- Run formatter/linter/typecheck/tests used by the repo.
- Ensure no references to old packages remain.

Output format:
- Summary of what changed.
- List of files changed.
- Any behavior changes or risks.
- Commands run and their results.
```
