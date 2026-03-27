import type { BmpImageData, EncodedBmp } from "./types";

class BmpEncoder {
  private readonly buffer: Buffer;
  private readonly width: number;
  private readonly height: number;
  private readonly extraBytes: number;
  private readonly rgbSize: number;
  private readonly headerInfoSize: number;

  private readonly flag = "BM";
  private readonly reserved = 0;
  private readonly offset = 54;
  private readonly fileSize: number;
  private readonly planes = 1;
  private readonly bitPP = 24;
  private readonly compress = 0;
  private readonly hr = 0;
  private readonly vr = 0;
  private readonly colors = 0;
  private readonly importantColors = 0;

  private pos = 0;

  constructor(imgData: BmpImageData) {
    this.buffer = imgData.data;
    this.width = imgData.width;
    this.height = imgData.height;
    this.extraBytes = this.width % 4;
    this.rgbSize = this.height * (3 * this.width + this.extraBytes);
    this.headerInfoSize = 40;
    this.fileSize = this.rgbSize + this.offset;
  }

  encode(): Buffer {
    const tempBuffer = Buffer.alloc(this.offset + this.rgbSize);

    tempBuffer.write(this.flag, this.pos, 2);
    this.pos += 2;
    tempBuffer.writeUInt32LE(this.fileSize, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.reserved, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.offset, this.pos);
    this.pos += 4;

    tempBuffer.writeUInt32LE(this.headerInfoSize, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.width, this.pos);
    this.pos += 4;
    tempBuffer.writeInt32LE(-this.height, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt16LE(this.planes, this.pos);
    this.pos += 2;
    tempBuffer.writeUInt16LE(this.bitPP, this.pos);
    this.pos += 2;
    tempBuffer.writeUInt32LE(this.compress, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.rgbSize, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.hr, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.vr, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.colors, this.pos);
    this.pos += 4;
    tempBuffer.writeUInt32LE(this.importantColors, this.pos);
    this.pos += 4;

    let i = 0;
    const rowBytes = 3 * this.width + this.extraBytes;

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const p = this.pos + y * rowBytes + x * 3;
        i += 1; // skip alpha from ABGR
        tempBuffer[p] = this.buffer.readUInt8(i++); // blue
        tempBuffer[p + 1] = this.buffer.readUInt8(i++); // green
        tempBuffer[p + 2] = this.buffer.readUInt8(i++); // red
      }

      if (this.extraBytes > 0) {
        const fillOffset = this.pos + y * rowBytes + this.width * 3;
        tempBuffer.fill(0, fillOffset, fillOffset + this.extraBytes);
      }
    }

    return tempBuffer;
  }
}

export function encode(imgData: BmpImageData, quality = 100): EncodedBmp {
  void quality;
  const encoder = new BmpEncoder(imgData);
  const data = encoder.encode();

  return {
    data,
    width: imgData.width,
    height: imgData.height,
  };
}

export { BmpEncoder };
