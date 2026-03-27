import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { decode } from "../src/index";

function toRgbaFromAbgr(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i += 4) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const g = bytes[i + 2] ?? 0;
    const r = bytes[i + 3] ?? 0;

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = a;
  }

  return out;
}

describe("decode options", () => {
  it("supports toRGBA conversion for true-color fixtures", () => {
    const bytes = readFileSync(join(process.cwd(), "fixtures", "bit24.bmp"));
    const decodedAbgr = decode(bytes);
    const decodedRgba = decode(bytes, { toRGBA: true });

    expect(decodedRgba.width).toBe(decodedAbgr.width);
    expect(decodedRgba.height).toBe(decodedAbgr.height);
    expect(decodedRgba.data).toEqual(toRgbaFromAbgr(decodedAbgr.data));
  });

  it("supports toRGBA conversion for palette fixtures", () => {
    const bytes = readFileSync(join(process.cwd(), "fixtures", "bit8.bmp"));
    const decodedAbgr = decode(bytes);
    const decodedRgba = decode(bytes, { toRGBA: true });

    expect(decodedRgba.data).toEqual(toRgbaFromAbgr(decodedAbgr.data));
  });
});
