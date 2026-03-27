import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { decode, encode } from "../src/index";

function expectAllAlpha255(data: Uint8Array): void {
  for (let i = 0; i < data.length; i += 4) {
    expect(data[i]).toBe(0xff);
  }
}

describe("opaque alpha defaults", () => {
  it("decodes opaque fixture formats with alpha=255", () => {
    const fixtures = [
      "bit1.bmp",
      "bit4.bmp",
      "bit8.bmp",
      "bit16_565.bmp",
      "bit24.bmp",
      "bit32.bmp",
      "generated/valid-v4-oddwidth-5x1.bmp",
      "generated/valid-v5-2x2.bmp",
    ];

    for (const file of fixtures) {
      const bmp = readFileSync(join(process.cwd(), "fixtures", file));
      const decoded = decode(bmp);
      expectAllAlpha255(decoded.data);
    }
  });

  it("keeps opaque alpha at 255 after encode/decode roundtrip", () => {
    const width = 3;
    const height = 2;
    const data = new Uint8Array(width * height * 4);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        data[i] = 0x25;
        data[i + 1] = (x * 60) & 0xff;
        data[i + 2] = (y * 90) & 0xff;
        data[i + 3] = ((x + y) * 40) & 0xff;
      }
    }

    const encoded = encode({ width, height, data });
    const decoded = decode(encoded.data);
    expectAllAlpha255(decoded.data);
  });
});
