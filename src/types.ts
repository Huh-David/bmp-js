export interface BmpPaletteColor {
  red: number;
  green: number;
  blue: number;
  quad: number;
}

export type BmpBinaryInput = ArrayBuffer | ArrayBufferView;

export interface BmpImageData {
  data: Uint8Array;
  width: number;
  height: number;
}

export interface EncodeOptions {
  orientation?: "top-down" | "bottom-up";
  bitPP?: 24;
}

export interface DecodeOptions {
  treat16BitAs15BitAlpha?: boolean;
}

export interface EncodedBmp {
  data: Uint8Array;
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
  data: Uint8Array;
  getData(): Uint8Array;
}
