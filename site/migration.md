# Migration

Move from legacy `bmp-js`/`bmp-ts` usage to `@huh-david/bmp-js` with minimal risk.

## 1. Install

```bash
pnpm remove bmp-js bmp-ts
pnpm add @huh-david/bmp-js
```

## 2. Update imports

### ESM

```ts
import { decode, encode } from "@huh-david/bmp-js";
```

### CommonJS

```js
const { decode, encode } = require("@huh-david/bmp-js");
```

## 3. Handle output byte order explicitly

Default decode output stays `ABGR` for compatibility.

Use one of these when consumers expect RGB-style ordering:

```ts
import { decode, decodeRgba, decodeRgb } from "@huh-david/bmp-js";

const abgr = decode(input); // default, compatibility-safe
const rgba = decodeRgba(input); // explicit RGBA helper
const rgb = decodeRgb(input); // packed RGB helper (3 channels)
```

## 4. Sharp integration (optional)

```ts
import sharp from "sharp";
import { sharpFromBmp, encodeFromSharp } from "@huh-david/bmp-js/sharp";

const png = await sharpFromBmp(bmpBytes, sharp).resize(800).png().toBuffer();

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const bmp = encodeFromSharp({ data, info }, { bitDepth: 32 });
```

## 5. Verify migration

Run the same quality checks we use in CI:

```bash
pnpm check
pnpm test:browser
```

## AI-assisted migration

Use this ready-made prompt to migrate another codebase with an AI coding agent:

- Prompt file: [`docs/ai-migration-prompt.md`](https://github.com/Huh-David/bmp-js/blob/master/docs/ai-migration-prompt.md)
