# @huh-david/bmp-js

A pure TypeScript BMP encoder/decoder for Node.js.

## Maintenance

This fork is actively maintained and tracks unresolved upstream `shaozilee/bmp-js` issues and PRs.

- Repository: https://github.com/Huh-David/bmp-js
- Latest release: https://github.com/Huh-David/bmp-js/releases/tag/v0.4.0

## Features

- Decoding for BMP bit depths: 1, 4, 8, 15, 16, 24, 32
- Decoding support for RLE-4 and RLE-8 compressed BMPs
- Robust DIB handling for CORE/INFO/V4/V5 headers
- Encoding output as 24-bit BMP with configurable orientation
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
    bitPP: 24, // only 24 is currently supported
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

## Data layout

Decoded pixel data is a byte buffer in `ABGR` order.

- `A`: alpha
- `B`: blue
- `G`: green
- `R`: red

Input/output binary types use `Uint8Array` (Node `Buffer` is fully compatible because it extends `Uint8Array`).

## Development

```bash
pnpm install
pnpm fixtures:generate
pnpm check
```

Useful scripts:

- `pnpm build`
- `pnpm test`
- `pnpm test:watch`
- `pnpm lint`
- `pnpm format`
- `pnpm typecheck`

## License

MIT
