# @huh-david/bmp-js

A pure TypeScript BMP encoder/decoder for Node.js.

## Features

- Decoding for BMP bit depths: 1, 4, 8, 15, 16, 24, 32
- Decoding support for RLE-4 and RLE-8 compressed BMPs
- Encoding output as 24-bit BMP
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

## Development

```bash
pnpm install
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
