import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { decode } from "../../src/index";
import {
  decodeForSharp,
  encodeFromSharp,
  InvalidSharpRawInputError,
  isBmp,
  NotBmpInputError,
  sharpFromBmp,
  toSharpInput,
} from "../../src/sharp/index";
import type { BmpPaletteColor } from "../../src/types";

const fixturesDir = join(process.cwd(), "fixtures");
const require = createRequire(import.meta.url);
const sharpModule = (() => {
  try {
    return require("sharp") as typeof import("sharp");
  } catch {
    return null;
  }
})();

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

function grayscalePalette(size: number): BmpPaletteColor[] {
  return Array.from({ length: size }, (_, i) => {
    const value = Math.round((255 * i) / Math.max(size - 1, 1));
    return {
      red: value,
      green: value,
      blue: value,
      quad: 0,
    };
  });
}

describe("sharp adapter", () => {
  it("isBmp detects BMP signatures", () => {
    const fixture = readFileSync(join(fixturesDir, "bit24.bmp"));
    expect(isBmp(fixture)).toBe(true);
  });

  it("isBmp rejects non-BMP payloads", () => {
    expect(isBmp(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
    expect(isBmp(new Uint8Array())).toBe(false);
  });

  it("decodeForSharp returns consistent raw descriptor", () => {
    const fixture = readFileSync(join(fixturesDir, "bit32_alpha.bmp"));
    const decoded = decodeForSharp(fixture);

    expect(decoded.width).toBe(decoded.raw.width);
    expect(decoded.height).toBe(decoded.raw.height);
    expect(decoded.channels).toBe(4);
    expect(decoded.raw.channels).toBe(4);
  });

  it("decodeForSharp returns RGBA data with expected length", () => {
    const fixture = readFileSync(join(fixturesDir, "bit24.bmp"));
    const decoded = decodeForSharp(fixture);
    const coreRgba = decode(fixture, { toRGBA: true });

    expect(decoded.data.length).toBe(decoded.width * decoded.height * 4);
    expect(decoded.data).toEqual(coreRgba.data);
  });

  it("toSharpInput is an alias for decodeForSharp", () => {
    const fixture = readFileSync(join(fixturesDir, "bit24.bmp"));

    expect(toSharpInput(fixture)).toEqual(decodeForSharp(fixture));
  });

  it.skipIf(!sharpModule)("sharpFromBmp supports resize/png flow with sharp", async () => {
    const fixture = readFileSync(join(fixturesDir, "bit24.bmp"));
    const sharp = sharpModule as typeof import("sharp");
    const png = await sharpFromBmp(fixture, sharp).resize(12, 12).png().toBuffer();

    expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it.skipIf(!sharpModule)("encodeFromSharp accepts raw output from sharp", async () => {
    const fixture = readFileSync(join(fixturesDir, "bit24.bmp"));
    const sharp = sharpModule as typeof import("sharp");
    const { data, info } = await sharpFromBmp(fixture, sharp)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const encoded = encodeFromSharp({ data, info }, { bitDepth: 32 });
    const decoded = decode(encoded, { toRGBA: true });

    expect(decoded.width).toBe(info.width);
    expect(decoded.height).toBe(info.height);
    expect(decoded.data.length).toBe(info.width * info.height * 4);
  });

  it.skipIf(!sharpModule)("roundtrips BMP through sharp raw and back to BMP", async () => {
    const fixture = readFileSync(join(fixturesDir, "bit24.bmp"));
    const sharp = sharpModule as typeof import("sharp");
    const baseline = decodeForSharp(fixture);

    const { data, info } = await sharpFromBmp(fixture, sharp)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const encoded = encodeFromSharp({ data, info }, { bitDepth: 32 });
    const roundtrip = decode(encoded, { toRGBA: true });

    expect(roundtrip.width).toBe(baseline.width);
    expect(roundtrip.height).toBe(baseline.height);
    expect(roundtrip.data).toEqual(baseline.data);
  });

  it("throws clear errors for invalid adapter input", () => {
    expect(() => decodeForSharp(new Uint8Array([0x50, 0x4e, 0x47]))).toThrow(NotBmpInputError);
    expect(() => decodeForSharp(new Uint8Array())).toThrow(NotBmpInputError);
    expect(() => decodeForSharp(new Uint8Array([0x42, 0x4d, 0x00]))).toThrow(
      /out-of-range|offset|header|invalid|unsupported/i,
    );

    expect(() =>
      encodeFromSharp({
        data: new Uint8Array([0, 0, 0, 255]),
        info: { width: 1, height: 1, channels: 2 },
      }),
    ).toThrow(InvalidSharpRawInputError);

    expect(() =>
      encodeFromSharp({
        data: new Uint8Array([0, 0, 0, 255]),
        info: { width: 2, height: 1, channels: 4 },
      }),
    ).toThrow(/length mismatch/i);
  });

  it("encodes sharp raw input across supported BMP bit depths", () => {
    const width = 4;
    const height = 2;
    const rgba = new Uint8Array(width * height * 4);

    for (let i = 0; i < width * height; i += 1) {
      const base = i * 4;
      rgba[base] = (i * 40) & 0xff;
      rgba[base + 1] = (200 - i * 20) & 0xff;
      rgba[base + 2] = (i * 30) & 0xff;
      rgba[base + 3] = 255;
    }

    for (const bitDepth of [1, 4, 8, 16, 24, 32] as const) {
      const palette =
        bitDepth === 4 ? grayscalePalette(16) : bitDepth === 8 ? grayscalePalette(256) : undefined;
      const options: { bitDepth: 1 | 4 | 8 | 16 | 24 | 32; palette?: BmpPaletteColor[] } = {
        bitDepth,
      };
      if (palette) {
        options.palette = palette;
      }
      const bmp = encodeFromSharp(
        {
          data: rgba,
          info: { width, height, channels: 4 },
        },
        options,
      );
      const header = parseHeader(bmp);
      const decoded = decode(bmp, { toRGBA: true });

      expect(header.bitPP).toBe(bitDepth);
      expect(header.fileSize).toBe(bmp.length);
      expect(header.rawSize).toBe(rowStride(width, bitDepth) * height);
      expect(decoded.width).toBe(width);
      expect(decoded.height).toBe(height);
      expect(decoded.data.length).toBe(width * height * 4);
    }
  });

  it("uses data-preserving default bit depth for RGB and RGBA raw input", () => {
    const rgbData = new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255]);
    const rgbaData = new Uint8Array([
      255, 0, 0, 255, 0, 255, 0, 200, 0, 0, 255, 120, 255, 255, 255, 80,
    ]);

    const rgbBmp = encodeFromSharp({
      data: rgbData,
      info: { width: 2, height: 2, channels: 3 },
    });
    const rgbaBmp = encodeFromSharp({
      data: rgbaData,
      info: { width: 2, height: 2, channels: 4 },
    });

    expect(parseHeader(rgbBmp).bitPP).toBe(24);
    expect(parseHeader(rgbaBmp).bitPP).toBe(32);
  });
});
