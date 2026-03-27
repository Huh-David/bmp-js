import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { decode, decodeRgb, decodeRgba } from "../src/index";

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

function toRgbFromRgba(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array((bytes.length / 4) * 3);

  for (let src = 0, dst = 0; src < bytes.length; src += 4, dst += 3) {
    out[dst] = bytes[src] ?? 0;
    out[dst + 1] = bytes[src + 1] ?? 0;
    out[dst + 2] = bytes[src + 2] ?? 0;
  }

  return out;
}

describe("output format helpers", () => {
  it("decodeRgba is an explicit helper for RGBA output", () => {
    const bytes = readFileSync(join(process.cwd(), "fixtures", "bit24.bmp"));
    const decodedAbgr = decode(bytes);
    const decodedRgba = decodeRgba(bytes);

    expect(decodedRgba.width).toBe(decodedAbgr.width);
    expect(decodedRgba.height).toBe(decodedAbgr.height);
    expect(decodedRgba.data).toEqual(toRgbaFromAbgr(decodedAbgr.data));
  });

  it("decodeRgb returns packed RGB bytes and helper metadata", () => {
    const bytes = readFileSync(join(process.cwd(), "fixtures", "bit8.bmp"));
    const decodedRgba = decodeRgba(bytes);
    const decodedRgb = decodeRgb(bytes);

    expect(decodedRgb.width).toBe(decodedRgba.width);
    expect(decodedRgb.height).toBe(decodedRgba.height);
    expect(decodedRgb.channels).toBe(3);
    expect(decodedRgb.format).toBe("rgb");
    expect(decodedRgb.data.length).toBe(decodedRgb.width * decodedRgb.height * 3);
    expect(decodedRgb.data).toEqual(toRgbFromRgba(decodedRgba.data));
  });
});
