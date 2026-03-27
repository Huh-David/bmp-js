# Sharp Adapter

Use the optional subexport `@huh-david/bmp-js/sharp` to bridge BMP data into Sharp without manual format juggling.

## Install

```bash
pnpm add sharp
```

`sharp` is optional for the core package and only needed when you use this adapter.

## API

- `isBmp(input)`
- `decodeForSharp(input)`
- `toSharpInput(input)` (alias of `decodeForSharp`)
- `sharpFromBmp(input, sharpModule?)`
- `encodeFromSharp({ data, info }, options?)`

## BMP -> Sharp -> PNG

```ts
import sharp from "sharp";
import { sharpFromBmp } from "@huh-david/bmp-js/sharp";

const png = await sharpFromBmp(bmpBytes, sharp).resize(800).png().toBuffer();
```

## Sharp raw -> BMP

```ts
import sharp from "sharp";
import { encodeFromSharp } from "@huh-david/bmp-js/sharp";

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const bmp = encodeFromSharp({ data, info }, { bitDepth: 32 });
```

## Behavior

- Adapter decode output is normalized to `RGBA` and `raw.channels = 4`.
- `encodeFromSharp` supports `channels` `3` and `4` only.
- Default encode depth is data-preserving:
  - `channels=3` -> `24-bit`
  - `channels=4` -> `32-bit`
- Non-BMP input to decode helpers throws a clear error.
