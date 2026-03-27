import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const GENERATED_DIR = join(ROOT, "fixtures", "generated");
const INVALID_DIR = join(ROOT, "fixtures", "generated-invalid");

mkdirSync(GENERATED_DIR, { recursive: true });
mkdirSync(INVALID_DIR, { recursive: true });

function rowStride(width, bitPP) {
  return Math.floor((bitPP * width + 31) / 32) * 4;
}

function patternABGR(width, height) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const base = (y * width + x) * 4;
      data[base] = 0xff;
      data[base + 1] = (x * 73 + y * 41) & 0xff;
      data[base + 2] = (x * 17 + y * 97 + 50) & 0xff;
      data[base + 3] = (x * 131 + y * 29 + 90) & 0xff;
    }
  }
  return data;
}

function createBmp24({ width, height, topDown, headerSize }) {
  const stride = rowStride(width, 24);
  const imageSize = stride * height;
  const offset = 14 + headerSize;
  const fileSize = offset + imageSize;
  const bytes = new Uint8Array(fileSize);
  const view = new DataView(bytes.buffer);
  const pixels = patternABGR(width, height);

  bytes[0] = 0x42;
  bytes[1] = 0x4d;
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, offset, true);

  view.setUint32(14, headerSize, true);
  if (headerSize === 12) {
    view.setUint16(18, width, true);
    view.setUint16(20, height, true);
    view.setUint16(22, 1, true);
    view.setUint16(24, 24, true);
  } else {
    view.setInt32(18, width, true);
    view.setInt32(22, topDown ? -height : height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, imageSize, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, 0, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);
  }

  for (let fileRow = 0; fileRow < height; fileRow += 1) {
    const srcY = topDown ? fileRow : height - 1 - fileRow;
    const rowBase = offset + fileRow * stride;
    for (let x = 0; x < width; x += 1) {
      const src = (srcY * width + x) * 4;
      const dst = rowBase + x * 3;
      bytes[dst] = pixels[src + 1] ?? 0;
      bytes[dst + 1] = pixels[src + 2] ?? 0;
      bytes[dst + 2] = pixels[src + 3] ?? 0;
    }
  }

  return bytes;
}

function createBmp8Palette() {
  const width = 3;
  const height = 2;
  const palette = [
    [0, 0, 0],
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
  ];
  const stride = rowStride(width, 8);
  const imageSize = stride * height;
  const offset = 14 + 40 + palette.length * 4;
  const bytes = new Uint8Array(offset + imageSize);
  const view = new DataView(bytes.buffer);
  bytes[0] = 0x42;
  bytes[1] = 0x4d;
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, offset, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 8, true);
  view.setUint32(34, imageSize, true);
  view.setUint32(46, palette.length, true);

  const paletteStart = 54;
  for (let i = 0; i < palette.length; i += 1) {
    const [r, g, b] = palette[i];
    const p = paletteStart + i * 4;
    bytes[p] = b;
    bytes[p + 1] = g;
    bytes[p + 2] = r;
    bytes[p + 3] = 0;
  }

  // bottom row first (BMP bottom-up)
  const pixelStart = offset;
  bytes[pixelStart + 0] = 0;
  bytes[pixelStart + 1] = 1;
  bytes[pixelStart + 2] = 2;
  bytes[pixelStart + 4] = 3;
  bytes[pixelStart + 5] = 2;
  bytes[pixelStart + 6] = 1;
  return bytes;
}

function createBmp8Rle() {
  const width = 4;
  const height = 2;
  const palette = [
    [0, 0, 0],
    [255, 255, 255],
  ];
  const rle = new Uint8Array([
    0,
    4,
    0,
    1,
    0,
    1, // bottom row absolute
    0,
    0, // EOL
    0,
    4,
    1,
    0,
    1,
    0, // top row absolute
    0,
    0, // EOL
    0,
    1, // EOB
  ]);

  const offset = 14 + 40 + palette.length * 4;
  const bytes = new Uint8Array(offset + rle.length);
  const view = new DataView(bytes.buffer);
  bytes[0] = 0x42;
  bytes[1] = 0x4d;
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, offset, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 8, true);
  view.setUint32(30, 1, true); // BI_RLE8
  view.setUint32(34, rle.length, true);
  view.setUint32(46, palette.length, true);

  const paletteStart = 54;
  for (let i = 0; i < palette.length; i += 1) {
    const [r, g, b] = palette[i];
    const p = paletteStart + i * 4;
    bytes[p] = b;
    bytes[p + 1] = g;
    bytes[p + 2] = r;
    bytes[p + 3] = 0;
  }

  bytes.set(rle, offset);
  return bytes;
}

function writeFixture(dir, name, bytes) {
  const file = join(dir, name);
  writeFileSync(file, bytes);
  return file;
}

function generateValidFixtures() {
  writeFixture(
    GENERATED_DIR,
    "valid-info-topdown-3x2.bmp",
    createBmp24({ width: 3, height: 2, topDown: true, headerSize: 40 }),
  );
  writeFixture(
    GENERATED_DIR,
    "valid-info-bottomup-3x2.bmp",
    createBmp24({ width: 3, height: 2, topDown: false, headerSize: 40 }),
  );
  writeFixture(
    GENERATED_DIR,
    "valid-v4-oddwidth-5x1.bmp",
    createBmp24({ width: 5, height: 1, topDown: true, headerSize: 108 }),
  );
  writeFixture(
    GENERATED_DIR,
    "valid-v5-2x2.bmp",
    createBmp24({ width: 2, height: 2, topDown: true, headerSize: 124 }),
  );
  writeFixture(
    GENERATED_DIR,
    "valid-os2-core-2x2.bmp",
    createBmp24({ width: 2, height: 2, topDown: false, headerSize: 12 }),
  );
  writeFixture(GENERATED_DIR, "valid-pal8-3x2.bmp", createBmp8Palette());
  writeFixture(GENERATED_DIR, "valid-rle8-4x2.bmp", createBmp8Rle());
}

function generateInvalidFixtures() {
  writeFixture(INVALID_DIR, "invalid-bad-magic.bmp", new Uint8Array([0x5a, 0x5a, 0, 0, 0, 0]));

  const truncatedHeader = createBmp24({
    width: 2,
    height: 2,
    topDown: true,
    headerSize: 40,
  }).subarray(0, 20);
  writeFixture(INVALID_DIR, "invalid-truncated-header.bmp", truncatedHeader);

  const invalidOffset = createBmp24({ width: 2, height: 2, topDown: true, headerSize: 40 });
  const invalidOffsetView = new DataView(
    invalidOffset.buffer,
    invalidOffset.byteOffset,
    invalidOffset.byteLength,
  );
  invalidOffsetView.setUint32(10, 999_999, true);
  writeFixture(INVALID_DIR, "invalid-offset-out-of-range.bmp", invalidOffset);

  const badDibSize = createBmp24({ width: 2, height: 2, topDown: true, headerSize: 40 });
  const badDibView = new DataView(badDibSize.buffer, badDibSize.byteOffset, badDibSize.byteLength);
  badDibView.setUint32(14, 8, true);
  writeFixture(INVALID_DIR, "invalid-dib-size.bmp", badDibSize);

  const truncatedPixels = createBmp24({
    width: 4,
    height: 2,
    topDown: true,
    headerSize: 40,
  }).subarray(0, 60);
  writeFixture(INVALID_DIR, "invalid-truncated-pixels.bmp", truncatedPixels);
}

generateValidFixtures();
generateInvalidFixtures();

console.log("Generated fixtures in fixtures/generated and fixtures/generated-invalid");
