# Quickstart

Install:

```bash
pnpm add @huh-david/bmp-js
```

## ESM

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

## CommonJS

```js
const { decode, encode } = require("@huh-david/bmp-js");
const { readFileSync, writeFileSync } = require("node:fs");

const decoded = decode(readFileSync("./in.bmp"));
const encoded = encode(decoded);

writeFileSync("./out.bmp", encoded.data);
```

## 60-Second Roundtrip

```ts
import { decode, encode } from "@huh-david/bmp-js";
import { readFileSync, writeFileSync } from "node:fs";

const decoded = decode(readFileSync("./in.bmp"), { toRGBA: false });
const roundtrip = encode(
  {
    data: decoded.data,
    width: decoded.width,
    height: decoded.height,
  },
  {
    bitPP: 24,
    orientation: "top-down",
  },
);

writeFileSync("./roundtrip.bmp", roundtrip.data);
```

Decoded pixel layout is `ABGR` by default.  
Set `toRGBA: true` for RGBA output.
