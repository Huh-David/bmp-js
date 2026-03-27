import type { BmpPaletteColor, EncodeBitDepth } from "../types";

export type PixelSource = Uint8Array | ArrayBufferLike | ArrayBufferView;
export type SharpRawChannels = 3 | 4;

export interface SharpRawDescriptor {
  width: number;
  height: number;
  channels: SharpRawChannels;
  premultiplied?: boolean;
}

export interface SharpRgbaInfo {
  width: number;
  height: number;
  channels: 4;
  premultiplied?: boolean;
}

export interface DecodedSharpInput {
  data: Uint8Array;
  raw: SharpRgbaInfo;
  info: SharpRgbaInfo;
  width: number;
  height: number;
  channels: 4;
}

export interface SharpRawInfo {
  width: number;
  height: number;
  channels: number;
  premultiplied?: boolean;
}

export interface SharpRawLike {
  data: PixelSource;
  info: SharpRawInfo;
}

export interface SharpRawFlatLike {
  data: PixelSource;
  width: number;
  height: number;
  channels: number;
  premultiplied?: boolean;
}

export interface EncodeBmpOptions {
  bitDepth?: EncodeBitDepth;
  topDown?: boolean;
  palette?: BmpPaletteColor[];
}

export interface SharpFromBmpOptions {
  input: PixelSource;
  sharp?: SharpModule;
}

export type BmpSharpInput = PixelSource;
export type DecodeForSharpInput = PixelSource;
export type SharpModule = typeof import("sharp");
export type SharpInstance = import("sharp").Sharp;
