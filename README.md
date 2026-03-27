# @huh-david/bmp-js

[![npm version](https://img.shields.io/npm/v/%40huh-david%2Fbmp-js)](https://www.npmjs.com/package/@huh-david/bmp-js)
[![Documentation](https://img.shields.io/badge/docs-github%20pages-1d4ed8)](https://huh-david.github.io/bmp-js/)

A pure TypeScript BMP encoder/decoder for Node.js.

## Maintenance

This fork is actively maintained and tracks unresolved upstream `shaozilee/bmp-js` issues and PRs.

- Repository: https://github.com/Huh-David/bmp-js
- Releases: https://github.com/Huh-David/bmp-js/releases
- Documentation: https://huh-david.github.io/bmp-js/

## Features

- Decoding for BMP bit depths: 1, 4, 8, 15, 16, 24, 32
- Decoding support for RLE-4 and RLE-8 compressed BMPs
- Robust DIB handling for CORE/INFO/V4/V5 headers
- Encoding output bit depths: 1, 4, 8, 16, 24, 32
- Dual package output: ESM + CommonJS
- First-class TypeScript types

## Install

```bash
pnpm add @huh-david/bmp-js
```

## Usage

### ESM

```ts
import { decode, encode } from "@huh-david/bmp-js";
import { readFileSync, writeFileSync } from "node:fs";

const input = readFileSync("./image.bmp");
const decoded = decode(input);

const encoded = encode({
  data: decoded.data,
  width: decoded.width,
  height: decoded.height,
});

writeFileSync("./roundtrip.bmp", encoded.data);
```

### Encode options

```ts
import { encode } from "@huh-david/bmp-js";

const encoded = encode(
  {
    data: rgbaLikeBytes,
    width: 320,
    height: 200,
  },
  {
    orientation: "bottom-up", // default: "top-down"
    bitPP: 32, // supported: 1, 4, 8, 16, 24, 32
    // palette is required for 4/8-bit and optional for 1-bit
    // palette: [{ red: 0, green: 0, blue: 0, quad: 0 }, ...],
  },
);
```

### CommonJS

```js
const bmp = require("@huh-david/bmp-js");
const fs = require("node:fs");

const decoded = bmp.decode(fs.readFileSync("./image.bmp"));
const encoded = bmp.encode(decoded);

fs.writeFileSync("./roundtrip.bmp", encoded.data);
```

### Decode options

```ts
import { decode } from "@huh-david/bmp-js";

const decoded = decode(inputBytes, {
  toRGBA: true, // return RGBA instead of default ABGR
});
```

### Output format helpers (non-breaking)

```ts
import { decodeRgb, decodeRgba } from "@huh-david/bmp-js";

const rgba = decodeRgba(inputBytes); // DecodedBmp with RGBA data
const rgb = decodeRgb(inputBytes); // { data, width, height, channels: 3, format: "rgb" }
```

## Data layout

Decoded pixel data is a byte buffer in `ABGR` order by default.
If `toRGBA: true` is provided to `decode`, output is returned in `RGBA`.
`decodeRgba` and `decodeRgb` are explicit opt-in helpers for RGBA/RGB consumers.

- `A`: alpha
- `B`: blue
- `G`: green
- `R`: red

Input/output binary types use `Uint8Array` (Node `Buffer` is fully compatible because it extends `Uint8Array`).

## Sharp adapter (optional subexport)

The package ships an optional Sharp adapter at `@huh-david/bmp-js/sharp`.
Core usage does not require `sharp`.

Install Sharp only when using the adapter:

```bash
pnpm add sharp
```

### BMP -> Sharp -> PNG

```ts
import sharp from "sharp";
import { sharpFromBmp } from "@huh-david/bmp-js/sharp";

const png = await sharpFromBmp(bmpBytes, sharp).resize(800).png().toBuffer();
```

### Sharp raw -> BMP

```ts
import sharp from "sharp";
import { encodeFromSharp } from "@huh-david/bmp-js/sharp";

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const bmp = encodeFromSharp({ data, info }, { bitDepth: 32 });
```

Adapter behavior:

- `decodeForSharp` and `sharpFromBmp` require BMP input and throw on non-BMP bytes.
- Sharp-bound decode output is normalized to `RGBA` + `{ raw: { width, height, channels: 4 } }`.
- `encodeFromSharp` supports `channels` 3 and 4 only; other values throw.
- Default encode depth is data-preserving: RGB -> 24-bit, RGBA -> 32-bit.
- Inputs are `Uint8Array`-first and accept `Buffer`/`ArrayBuffer`/typed-array views.
- `sharpFromBmp` supports both forms:
  - `sharpFromBmp(input, sharp?)`
  - `sharpFromBmp({ input, sharp })`
- `encodeFromSharp` supports:
  - `encodeFromSharp({ data, info }, options?)`
  - `encodeFromSharp({ data, width, height, channels }, options?)`
  - `encodeFromSharp(data, info, options?)`
- `toSharpInput` is kept as a compatibility alias for `decodeForSharp`.

## Development

```bash
pnpm install
pnpm fixtures:generate
pnpm check
```

Useful scripts:

- `pnpm build`
- `pnpm test`
- `pnpm test:browser`
- `pnpm test:watch`
- `pnpm lint`
- `pnpm format`
- `pnpm typecheck`

## License

MIT
