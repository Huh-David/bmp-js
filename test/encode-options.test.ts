import { describe, expect, it } from "vitest";

import { decode, encode } from "../src/index";

function makePattern(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      bytes[i] = 0xff;
      bytes[i + 1] = (x * 50) & 0xff;
      bytes[i + 2] = (y * 80) & 0xff;
      bytes[i + 3] = ((x + y) * 40) & 0xff;
    }
  }
  return bytes;
}

describe("encode options", () => {
  it("keeps top-down as default orientation", () => {
    const width = 3;
    const height = 2;
    const data = makePattern(width, height);

    const encoded = encode({ width, height, data });
    const decoded = decode(encoded.data);

    expect(decoded.width).toBe(width);
    expect(decoded.height).toBe(height);
    for (let i = 0; i < data.length; i += 4) {
      expect(decoded.data[i + 1]).toBe(data[i + 1]);
      expect(decoded.data[i + 2]).toBe(data[i + 2]);
      expect(decoded.data[i + 3]).toBe(data[i + 3]);
    }
  });

  it("supports explicit bottom-up orientation", () => {
    const width = 3;
    const height = 2;
    const data = makePattern(width, height);

    const encoded = encode({ width, height, data }, { orientation: "bottom-up" });
    const decoded = decode(encoded.data);

    expect(decoded.width).toBe(width);
    expect(decoded.height).toBe(height);
    for (let i = 0; i < data.length; i += 4) {
      expect(decoded.data[i + 1]).toBe(data[i + 1]);
      expect(decoded.data[i + 2]).toBe(data[i + 2]);
      expect(decoded.data[i + 3]).toBe(data[i + 3]);
    }
  });

  it("rejects unsupported encode bit depths", () => {
    const width = 2;
    const height = 2;
    const data = makePattern(width, height);

    expect(() => encode({ width, height, data }, { bitPP: 24 })).not.toThrow();
    expect(() =>
      encode({ width, height, data }, { bitPP: 32 as unknown as 24, orientation: "top-down" }),
    ).toThrow(/unsupported encode bit depth/i);
  });

  it("throws on too-short ABGR input", () => {
    expect(() => encode({ width: 2, height: 2, data: new Uint8Array(3) })).toThrow(/too short/i);
  });
});
