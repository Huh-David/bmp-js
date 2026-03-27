import { describe, expect, it } from "vitest";

import { decode, encode, type BmpPaletteColor } from "../src/index";

function parseHeader(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    fileSize: view.getUint32(2, true),
    offset: view.getUint32(10, true),
    width: view.getInt32(18, true),
    height: view.getInt32(22, true),
    bitPP: view.getUint16(28, true),
    rawSize: view.getUint32(34, true),
    colors: view.getUint32(46, true),
  };
}

function rowStride(width: number, bitPP: number): number {
  return Math.floor((bitPP * width + 31) / 32) * 4;
}

function makeAbgrPattern(width: number, height: number): Uint8Array {
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      out[i] = 0xff;
      out[i + 1] = (x * 40 + y * 15) & 0xff;
      out[i + 2] = (x * 10 + y * 70) & 0xff;
      out[i + 3] = (x * 90 + y * 20) & 0xff;
    }
  }
  return out;
}

function paletteColor(red: number, green: number, blue: number): BmpPaletteColor {
  return { red, green, blue, quad: 0 };
}

function fromPaletteIndices(
  width: number,
  height: number,
  indices: number[],
  palette: BmpPaletteColor[],
): Uint8Array {
  const out = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const color = palette[indices[i] ?? 0] ?? palette[0]!;
    const base = i * 4;
    out[base] = 0xff;
    out[base + 1] = color.blue;
    out[base + 2] = color.green;
    out[base + 3] = color.red;
  }
  return out;
}

describe("encode bit depth coverage", () => {
  it("encodes 32-bit with exact ABGR roundtrip", () => {
    const width = 3;
    const height = 2;
    const input = makeAbgrPattern(width, height);
    input[0] = 0x11;
    input[4] = 0x77;
    input[8] = 0xee;

    const encoded = encode({ width, height, data: input }, { bitPP: 32, orientation: "bottom-up" });
    const header = parseHeader(encoded.data);

    expect(header.bitPP).toBe(32);
    expect(header.height).toBe(height);
    expect(header.rawSize).toBe(rowStride(width, 32) * height);
    expect(header.fileSize).toBe(encoded.data.length);

    const decoded = decode(encoded.data);
    expect(decoded.bitPP).toBe(32);
    expect(decoded.data).toEqual(input);
  });

  it("encodes 24-bit and keeps RGB with alpha forced to 255", () => {
    const width = 5;
    const height = 2;
    const input = makeAbgrPattern(width, height);

    const encoded = encode({ width, height, data: input }, { bitPP: 24, orientation: "top-down" });
    const header = parseHeader(encoded.data);

    expect(header.bitPP).toBe(24);
    expect(header.height).toBe(-height);
    expect(header.rawSize).toBe(rowStride(width, 24) * height);

    const decoded = decode(encoded.data);
    expect(decoded.bitPP).toBe(24);

    for (let i = 0; i < input.length; i += 4) {
      expect(decoded.data[i]).toBe(0xff);
      expect(decoded.data[i + 1]).toBe(input[i + 1]);
      expect(decoded.data[i + 2]).toBe(input[i + 2]);
      expect(decoded.data[i + 3]).toBe(input[i + 3]);
    }
  });

  it("encodes 16-bit (RGB555) with expected quantization", () => {
    const width = 3;
    const height = 2;
    const input = makeAbgrPattern(width, height);

    const encoded = encode({ width, height, data: input }, { bitPP: 16 });
    const header = parseHeader(encoded.data);

    expect(header.bitPP).toBe(16);
    expect(header.rawSize).toBe(rowStride(width, 16) * height);

    const decoded = decode(encoded.data);
    expect(decoded.bitPP).toBe(16);

    for (let i = 0; i < input.length; i += 4) {
      expect(decoded.data[i]).toBe(0xff);
      expect(Math.abs((decoded.data[i + 1] ?? 0) - (input[i + 1] ?? 0))).toBeLessThanOrEqual(8);
      expect(Math.abs((decoded.data[i + 2] ?? 0) - (input[i + 2] ?? 0))).toBeLessThanOrEqual(8);
      expect(Math.abs((decoded.data[i + 3] ?? 0) - (input[i + 3] ?? 0))).toBeLessThanOrEqual(8);
    }
  });

  it("encodes 8-bit with palette and roundtrips expected palette colors", () => {
    const width = 3;
    const height = 2;
    const palette = [
      paletteColor(0, 0, 0),
      paletteColor(255, 0, 0),
      paletteColor(0, 255, 0),
      paletteColor(0, 0, 255),
      paletteColor(255, 255, 255),
    ];
    const indices = [0, 1, 2, 3, 4, 1];
    const input = fromPaletteIndices(width, height, indices, palette);

    const encoded = encode({ width, height, data: input }, { bitPP: 8, palette });
    const header = parseHeader(encoded.data);

    expect(header.bitPP).toBe(8);
    expect(header.colors).toBe(palette.length);
    expect(header.offset).toBe(14 + 40 + palette.length * 4);
    expect(header.rawSize).toBe(rowStride(width, 8) * height);

    const decoded = decode(encoded.data);
    expect(decoded.bitPP).toBe(8);
    expect(decoded.data).toEqual(input);
  });

  it("encodes 4-bit with palette and preserves nearest colors", () => {
    const width = 5;
    const height = 2;
    const palette = [
      paletteColor(0, 0, 0),
      paletteColor(255, 0, 0),
      paletteColor(0, 255, 0),
      paletteColor(0, 0, 255),
      paletteColor(255, 255, 255),
      paletteColor(255, 255, 0),
    ];
    const indices = [0, 1, 2, 3, 4, 5, 0, 2, 4, 1];
    const input = fromPaletteIndices(width, height, indices, palette);

    const encoded = encode({ width, height, data: input }, { bitPP: 4, palette });
    const header = parseHeader(encoded.data);

    expect(header.bitPP).toBe(4);
    expect(header.colors).toBe(palette.length);
    expect(header.rawSize).toBe(rowStride(width, 4) * height);

    const decoded = decode(encoded.data);
    expect(decoded.bitPP).toBe(4);
    expect(decoded.data).toEqual(input);
  });

  it("encodes 1-bit with default palette when none is provided", () => {
    const width = 8;
    const height = 2;
    const input = new Uint8Array(width * height * 4);

    for (let i = 0; i < width * height; i += 1) {
      const base = i * 4;
      const white = i % 2 === 0;
      const value = white ? 255 : 0;
      input[base] = 0xff;
      input[base + 1] = value;
      input[base + 2] = value;
      input[base + 3] = value;
    }

    const encoded = encode({ width, height, data: input }, { bitPP: 1 });
    const header = parseHeader(encoded.data);

    expect(header.bitPP).toBe(1);
    expect(header.colors).toBe(2);
    expect(header.rawSize).toBe(rowStride(width, 1) * height);

    const decoded = decode(encoded.data);
    expect(decoded.bitPP).toBe(1);
    for (let i = 0; i < decoded.data.length; i += 4) {
      expect(decoded.data[i]).toBe(0xff);
      expect([0, 255]).toContain(decoded.data[i + 1]);
      expect([0, 255]).toContain(decoded.data[i + 2]);
      expect([0, 255]).toContain(decoded.data[i + 3]);
    }
  });

  it("throws on invalid palette sizes and values", () => {
    const width = 2;
    const height = 2;
    const input = makeAbgrPattern(width, height);

    const tooBigPalette: BmpPaletteColor[] = Array.from({ length: 17 }, () =>
      paletteColor(0, 0, 0),
    );
    expect(() =>
      encode({ width, height, data: input }, { bitPP: 4, palette: tooBigPalette }),
    ).toThrow(/palette size/i);

    expect(() =>
      encode(
        { width, height, data: input },
        { bitPP: 8, palette: [{ red: 256, green: 0, blue: 0, quad: 0 } as BmpPaletteColor] },
      ),
    ).toThrow(/palette\.red/i);
  });
});
