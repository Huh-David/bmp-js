# `@huh-david/bmp-js`

<section class="bmp-hero">
  <h1>BMP for real-world pipelines.</h1>
  <p>
    A pure TypeScript BMP encoder/decoder with fixture-backed behavior, dual ESM/CJS packaging, and a modern release flow.
  </p>
  <div class="bmp-actions">
    <a class="vp-button brand" href="/quickstart">Quickstart</a>
    <a class="vp-button alt" href="/migration">Migration</a>
    <a class="vp-button alt" href="/api">API Reference</a>
    <a class="vp-button alt" href="https://github.com/Huh-David/bmp-js">GitHub</a>
  </div>
</section>

```ts
import { decode, encode } from "@huh-david/bmp-js";
import { readFileSync, writeFileSync } from "node:fs";

const input = readFileSync("./in.bmp");
const decoded = decode(input);

const encoded = encode({
  data: decoded.data,
  width: decoded.width,
  height: decoded.height,
});

writeFileSync("./out.bmp", encoded.data);
```

> Decoded pixel layout is `ABGR` by default.  
> Use `decode(..., { toRGBA: true })` when your consumer expects RGBA ordering.

<div class="bmp-grid">
  <article class="bmp-card">
    <h3>Reliable Decoding</h3>
    <p>Supports 1/4/8/15/16/24/32-bit BMP, plus RLE4/RLE8 decoding with malformed-fixture guardrails.</p>
  </article>
  <article class="bmp-card">
    <h3>Flexible Encoding</h3>
    <p>Writes 1/4/8/16/24/32-bit BMP output, orientation control, and palette-aware paths for indexed formats.</p>
  </article>
  <article class="bmp-card">
    <h3>Production Tooling</h3>
    <p>Strict TypeScript, reproducible releases, CI quality gates, and trusted publishing with provenance.</p>
  </article>
</div>
