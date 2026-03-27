import { assertInteger } from "./binary";
import type { BmpImageData, EncodeOptions, EncodedBmp } from "./types";

const FILE_HEADER_SIZE = 14;
const INFO_HEADER_SIZE = 40;
const RGB_TRIPLE_SIZE = 3;
const BYTES_PER_PIXEL_ABGR = 4;

function rowStride24(width: number): number {
  const raw = width * RGB_TRIPLE_SIZE;
  return (raw + 3) & ~3;
}

function normalizeEncodeOptions(
  qualityOrOptions?: number | EncodeOptions,
): Required<EncodeOptions> {
  if (typeof qualityOrOptions === "number" || typeof qualityOrOptions === "undefined") {
    return {
      orientation: "top-down",
      bitPP: 24,
    };
  }

  return {
    orientation: qualityOrOptions.orientation ?? "top-down",
    bitPP: qualityOrOptions.bitPP ?? 24,
  };
}

class BmpEncoder {
  private readonly pixelData: Uint8Array;
  private readonly width: number;
  private readonly height: number;
  private readonly options: Required<EncodeOptions>;

  constructor(imgData: BmpImageData, options: Required<EncodeOptions>) {
    this.pixelData = imgData.data;
    this.width = imgData.width;
    this.height = imgData.height;
    this.options = options;

    assertInteger("width", this.width);
    assertInteger("height", this.height);

    if (this.options.bitPP !== 24) {
      throw new Error(
        `Unsupported encode bit depth: ${this.options.bitPP}. Only 24-bit output is supported.`,
      );
    }

    const minLength = this.width * this.height * BYTES_PER_PIXEL_ABGR;
    if (this.pixelData.length < minLength) {
      throw new Error(
        `Image data is too short: expected at least ${minLength} bytes for ${this.width}x${this.height} ABGR data.`,
      );
    }
  }

  encode(): Uint8Array {
    const stride = rowStride24(this.width);
    const imageSize = stride * this.height;
    const offset = FILE_HEADER_SIZE + INFO_HEADER_SIZE;
    const totalSize = offset + imageSize;
    const output = new Uint8Array(totalSize);
    const view = new DataView(output.buffer, output.byteOffset, output.byteLength);

    // BITMAPFILEHEADER
    output[0] = 0x42; // B
    output[1] = 0x4d; // M
    view.setUint32(2, totalSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, offset, true);

    // BITMAPINFOHEADER
    view.setUint32(14, INFO_HEADER_SIZE, true);
    view.setInt32(18, this.width, true);
    const signedHeight = this.options.orientation === "top-down" ? -this.height : this.height;
    view.setInt32(22, signedHeight, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, imageSize, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, 0, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    for (let fileRow = 0; fileRow < this.height; fileRow += 1) {
      const srcY = this.options.orientation === "top-down" ? fileRow : this.height - 1 - fileRow;
      const rowStart = offset + fileRow * stride;

      for (let x = 0; x < this.width; x += 1) {
        const source = (srcY * this.width + x) * BYTES_PER_PIXEL_ABGR;
        const target = rowStart + x * RGB_TRIPLE_SIZE;

        output[target] = this.pixelData[source + 1] ?? 0; // B
        output[target + 1] = this.pixelData[source + 2] ?? 0; // G
        output[target + 2] = this.pixelData[source + 3] ?? 0; // R
      }
    }

    return output;
  }
}

export function encode(
  imgData: BmpImageData,
  qualityOrOptions?: number | EncodeOptions,
): EncodedBmp {
  const options = normalizeEncodeOptions(qualityOrOptions);
  const encoder = new BmpEncoder(imgData, options);
  const data = encoder.encode();

  return {
    data,
    width: imgData.width,
    height: imgData.height,
  };
}

export { BmpEncoder };
