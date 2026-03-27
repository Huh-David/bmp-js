import type { BmpPaletteColor, DecodedBmp } from "./types";

class BmpDecoder implements DecodedBmp {
  private pos = 0;
  private readonly buffer: Buffer;
  private readonly isWithAlpha: boolean;
  private bottomUp = true;

  private maskRed = 0;
  private maskGreen = 0;
  private maskBlue = 0;
  private mask0 = 0;

  fileSize!: number;
  reserved!: number;
  offset!: number;
  headerSize!: number;
  width!: number;
  height!: number;
  planes!: number;
  bitPP!: number;
  compress!: number;
  rawSize!: number;
  hr!: number;
  vr!: number;
  colors!: number;
  importantColors!: number;
  palette?: BmpPaletteColor[];
  data!: Buffer;

  constructor(buffer: Buffer, isWithAlpha = false) {
    this.buffer = buffer;
    this.isWithAlpha = isWithAlpha;

    const flag = this.buffer.toString("utf-8", 0, (this.pos += 2));
    if (flag !== "BM") {
      throw new Error("Invalid BMP File");
    }

    this.parseHeader();
    this.parseRGBA();
  }

  private parseHeader(): void {
    this.fileSize = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.reserved = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.offset = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.headerSize = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.width = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.height = this.buffer.readInt32LE(this.pos);
    this.pos += 4;
    this.planes = this.buffer.readUInt16LE(this.pos);
    this.pos += 2;
    this.bitPP = this.buffer.readUInt16LE(this.pos);
    this.pos += 2;
    this.compress = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.rawSize = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.hr = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.vr = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.colors = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;
    this.importantColors = this.buffer.readUInt32LE(this.pos);
    this.pos += 4;

    if (this.bitPP === 16 && this.isWithAlpha) {
      this.bitPP = 15;
    }

    if (this.bitPP < 15) {
      const len = this.colors === 0 ? 1 << this.bitPP : this.colors;
      this.palette = new Array(len);
      for (let i = 0; i < len; i += 1) {
        const blue = this.buffer.readUInt8(this.pos++);
        const green = this.buffer.readUInt8(this.pos++);
        const red = this.buffer.readUInt8(this.pos++);
        const quad = this.buffer.readUInt8(this.pos++);
        this.palette[i] = { red, green, blue, quad };
      }
    }

    if (this.height < 0) {
      this.height *= -1;
      this.bottomUp = false;
    }
  }

  private parseRGBA(): void {
    const len = this.width * this.height * 4;
    this.data = Buffer.alloc(len);

    switch (this.bitPP) {
      case 1:
        this.bit1();
        return;
      case 4:
        this.bit4();
        return;
      case 8:
        this.bit8();
        return;
      case 15:
        this.bit15();
        return;
      case 16:
        this.bit16();
        return;
      case 24:
        this.bit24();
        return;
      case 32:
        this.bit32();
        return;
      default:
        throw new Error(`Unsupported BMP bit depth: ${this.bitPP}`);
    }
  }

  private getPaletteColor(index: number): BmpPaletteColor {
    const color = this.palette?.[index];
    if (color) {
      return color;
    }

    return {
      red: 0xff,
      green: 0xff,
      blue: 0xff,
      quad: 0x00,
    };
  }

  private bit1(): void {
    const xLen = Math.ceil(this.width / 8);
    const mode = xLen % 4;

    for (let y = this.height - 1; y >= 0; y -= 1) {
      const line = this.bottomUp ? y : this.height - 1 - y;
      for (let x = 0; x < xLen; x += 1) {
        const b = this.buffer.readUInt8(this.pos++);
        const location = line * this.width * 4 + x * 8 * 4;

        for (let i = 0; i < 8; i += 1) {
          if (x * 8 + i >= this.width) {
            break;
          }

          const rgb = this.getPaletteColor((b >> (7 - i)) & 0x1);
          this.data[location + i * 4] = 0;
          this.data[location + i * 4 + 1] = rgb.blue;
          this.data[location + i * 4 + 2] = rgb.green;
          this.data[location + i * 4 + 3] = rgb.red;
        }
      }

      if (mode !== 0) {
        this.pos += 4 - mode;
      }
    }
  }

  private bit4(): void {
    if (this.compress === 2) {
      this.data.fill(0xff);

      let location = 0;
      let lines = this.bottomUp ? this.height - 1 : 0;
      let lowNibble = false;

      while (location < this.data.length) {
        const a = this.buffer.readUInt8(this.pos++);
        const b = this.buffer.readUInt8(this.pos++);

        if (a === 0) {
          if (b === 0) {
            lines += this.bottomUp ? -1 : 1;
            location = lines * this.width * 4;
            lowNibble = false;
            continue;
          }

          if (b === 1) {
            break;
          }

          if (b === 2) {
            const x = this.buffer.readUInt8(this.pos++);
            const y = this.buffer.readUInt8(this.pos++);
            lines += this.bottomUp ? -y : y;
            location += y * this.width * 4 + x * 4;
            continue;
          }

          let c = this.buffer.readUInt8(this.pos++);
          for (let i = 0; i < b; i += 1) {
            if (lowNibble) {
              setPixelData.call(this, c & 0x0f);
            } else {
              setPixelData.call(this, (c & 0xf0) >> 4);
            }

            if ((i & 1) === 1 && i + 1 < b) {
              c = this.buffer.readUInt8(this.pos++);
            }

            lowNibble = !lowNibble;
          }

          if ((((b + 1) >> 1) & 1) === 1) {
            this.pos += 1;
          }
        } else {
          for (let i = 0; i < a; i += 1) {
            if (lowNibble) {
              setPixelData.call(this, b & 0x0f);
            } else {
              setPixelData.call(this, (b & 0xf0) >> 4);
            }
            lowNibble = !lowNibble;
          }
        }
      }

      function setPixelData(this: BmpDecoder, rgbIndex: number): void {
        const rgb = this.getPaletteColor(rgbIndex);
        this.data[location] = 0;
        this.data[location + 1] = rgb.blue;
        this.data[location + 2] = rgb.green;
        this.data[location + 3] = rgb.red;
        location += 4;
      }
      return;
    }

    const xLen = Math.ceil(this.width / 2);
    const mode = xLen % 4;

    for (let y = this.height - 1; y >= 0; y -= 1) {
      const line = this.bottomUp ? y : this.height - 1 - y;
      for (let x = 0; x < xLen; x += 1) {
        const b = this.buffer.readUInt8(this.pos++);
        const location = line * this.width * 4 + x * 2 * 4;

        const before = b >> 4;
        const after = b & 0x0f;

        let rgb = this.getPaletteColor(before);
        this.data[location] = 0;
        this.data[location + 1] = rgb.blue;
        this.data[location + 2] = rgb.green;
        this.data[location + 3] = rgb.red;

        if (x * 2 + 1 >= this.width) {
          break;
        }

        rgb = this.getPaletteColor(after);
        this.data[location + 4] = 0;
        this.data[location + 5] = rgb.blue;
        this.data[location + 6] = rgb.green;
        this.data[location + 7] = rgb.red;
      }

      if (mode !== 0) {
        this.pos += 4 - mode;
      }
    }
  }

  private bit8(): void {
    if (this.compress === 1) {
      this.data.fill(0xff);

      let location = 0;
      let lines = this.bottomUp ? this.height - 1 : 0;

      while (location < this.data.length) {
        const a = this.buffer.readUInt8(this.pos++);
        const b = this.buffer.readUInt8(this.pos++);

        if (a === 0) {
          if (b === 0) {
            lines += this.bottomUp ? -1 : 1;
            location = lines * this.width * 4;
            continue;
          }

          if (b === 1) {
            break;
          }

          if (b === 2) {
            const x = this.buffer.readUInt8(this.pos++);
            const y = this.buffer.readUInt8(this.pos++);
            lines += this.bottomUp ? -y : y;
            location += y * this.width * 4 + x * 4;
            continue;
          }

          for (let i = 0; i < b; i += 1) {
            const c = this.buffer.readUInt8(this.pos++);
            setPixelData.call(this, c);
          }

          if ((b & 1) === 1) {
            this.pos += 1;
          }
        } else {
          for (let i = 0; i < a; i += 1) {
            setPixelData.call(this, b);
          }
        }
      }

      function setPixelData(this: BmpDecoder, rgbIndex: number): void {
        const rgb = this.getPaletteColor(rgbIndex);
        this.data[location] = 0;
        this.data[location + 1] = rgb.blue;
        this.data[location + 2] = rgb.green;
        this.data[location + 3] = rgb.red;
        location += 4;
      }
      return;
    }

    const mode = this.width % 4;
    for (let y = this.height - 1; y >= 0; y -= 1) {
      const line = this.bottomUp ? y : this.height - 1 - y;
      for (let x = 0; x < this.width; x += 1) {
        const b = this.buffer.readUInt8(this.pos++);
        const location = line * this.width * 4 + x * 4;

        const rgb = this.getPaletteColor(b);
        this.data[location] = 0;
        this.data[location + 1] = rgb.blue;
        this.data[location + 2] = rgb.green;
        this.data[location + 3] = rgb.red;
      }

      if (mode !== 0) {
        this.pos += 4 - mode;
      }
    }
  }

  private bit15(): void {
    const difW = this.width % 3;
    const m = 0b11111;

    for (let y = this.height - 1; y >= 0; y -= 1) {
      const line = this.bottomUp ? y : this.height - 1 - y;
      for (let x = 0; x < this.width; x += 1) {
        const value = this.buffer.readUInt16LE(this.pos);
        this.pos += 2;

        const blue = ((value & m) / m) * 255;
        const green = (((value >> 5) & m) / m) * 255;
        const red = (((value >> 10) & m) / m) * 255;
        const alpha = value >> 15 !== 0 ? 0xff : 0x00;

        const location = line * this.width * 4 + x * 4;
        this.data[location] = alpha;
        this.data[location + 1] = blue | 0;
        this.data[location + 2] = green | 0;
        this.data[location + 3] = red | 0;
      }

      this.pos += difW;
    }
  }

  private bit16(): void {
    const difW = (this.width % 2) * 2;
    this.maskRed = 0x7c00;
    this.maskGreen = 0x03e0;
    this.maskBlue = 0x001f;
    this.mask0 = 0;

    if (this.compress === 3) {
      this.maskRed = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;
      this.maskGreen = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;
      this.maskBlue = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;
      this.mask0 = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;
    }

    const ns: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 16; i += 1) {
      if (((this.maskRed >> i) & 0x01) !== 0) ns[0] += 1;
      if (((this.maskGreen >> i) & 0x01) !== 0) ns[1] += 1;
      if (((this.maskBlue >> i) & 0x01) !== 0) ns[2] += 1;
    }

    ns[1] += ns[0];
    ns[2] += ns[1];
    ns[0] = 8 - ns[0];
    ns[1] -= 8;
    ns[2] -= 8;

    for (let y = this.height - 1; y >= 0; y -= 1) {
      const line = this.bottomUp ? y : this.height - 1 - y;
      for (let x = 0; x < this.width; x += 1) {
        const value = this.buffer.readUInt16LE(this.pos);
        this.pos += 2;

        const blue = (value & this.maskBlue) << ns[0];
        const green = (value & this.maskGreen) >> ns[1];
        const red = (value & this.maskRed) >> ns[2];

        const location = line * this.width * 4 + x * 4;
        this.data[location] = 0;
        this.data[location + 1] = blue;
        this.data[location + 2] = green;
        this.data[location + 3] = red;
      }

      this.pos += difW;
    }
  }

  private bit24(): void {
    for (let y = this.height - 1; y >= 0; y -= 1) {
      const line = this.bottomUp ? y : this.height - 1 - y;
      for (let x = 0; x < this.width; x += 1) {
        const blue = this.buffer.readUInt8(this.pos++);
        const green = this.buffer.readUInt8(this.pos++);
        const red = this.buffer.readUInt8(this.pos++);
        const location = line * this.width * 4 + x * 4;
        this.data[location] = 0;
        this.data[location + 1] = blue;
        this.data[location + 2] = green;
        this.data[location + 3] = red;
      }

      this.pos += this.width % 4;
    }
  }

  private bit32(): void {
    if (this.compress === 3) {
      this.maskRed = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;
      this.maskGreen = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;
      this.maskBlue = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;
      this.mask0 = this.buffer.readUInt32LE(this.pos);
      this.pos += 4;

      for (let y = this.height - 1; y >= 0; y -= 1) {
        const line = this.bottomUp ? y : this.height - 1 - y;
        for (let x = 0; x < this.width; x += 1) {
          const alpha = this.buffer.readUInt8(this.pos++);
          const blue = this.buffer.readUInt8(this.pos++);
          const green = this.buffer.readUInt8(this.pos++);
          const red = this.buffer.readUInt8(this.pos++);
          const location = line * this.width * 4 + x * 4;
          this.data[location] = alpha;
          this.data[location + 1] = blue;
          this.data[location + 2] = green;
          this.data[location + 3] = red;
        }
      }

      return;
    }

    for (let y = this.height - 1; y >= 0; y -= 1) {
      const line = this.bottomUp ? y : this.height - 1 - y;
      for (let x = 0; x < this.width; x += 1) {
        const blue = this.buffer.readUInt8(this.pos++);
        const green = this.buffer.readUInt8(this.pos++);
        const red = this.buffer.readUInt8(this.pos++);
        const alpha = this.buffer.readUInt8(this.pos++);
        const location = line * this.width * 4 + x * 4;
        this.data[location] = alpha;
        this.data[location + 1] = blue;
        this.data[location + 2] = green;
        this.data[location + 3] = red;
      }
    }
  }

  getData(): Buffer {
    return this.data;
  }
}

export function decode(bmpData: Buffer): DecodedBmp {
  return new BmpDecoder(bmpData);
}

export { BmpDecoder };
