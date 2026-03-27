export interface BmpPaletteColor {
  red: number;
  green: number;
  blue: number;
  quad: number;
}

export interface BmpImageData {
  data: Buffer;
  width: number;
  height: number;
}

export interface EncodedBmp {
  data: Buffer;
  width: number;
  height: number;
}

export interface DecodedBmp {
  fileSize: number;
  reserved: number;
  offset: number;
  headerSize: number;
  width: number;
  height: number;
  planes: number;
  bitPP: number;
  compress: number;
  rawSize: number;
  hr: number;
  vr: number;
  colors: number;
  importantColors: number;
  palette?: BmpPaletteColor[];
  data: Buffer;
  getData(): Buffer;
}
